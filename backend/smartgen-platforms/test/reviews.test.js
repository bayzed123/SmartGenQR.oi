import test from 'node:test';
import assert from 'node:assert/strict';

import { listReviews, submitReview } from '../src/lib/reviews.js';
import worker from '../src/index.js';

// cacheRateLimit() (src/lib/quota.js) reaches for the Cache API's `caches.default`,
// which only exists in the real Workers runtime. Polyfill an in-memory stand-in so
// the HTTP-level tests below can exercise routes that rate-limit, same as
// Miniflare/wrangler would provide.
if (typeof globalThis.caches === 'undefined') {
  const store = new Map();
  globalThis.caches = {
    default: {
      async match(req) {
        return store.get(req.url) || undefined;
      },
      async put(req, res) {
        store.set(req.url, res);
      },
    },
  };
}

/** Minimal in-memory stand-in for the bits of the KV API reviews.js uses. */
function makeKV() {
  const store = new Map(); // key -> { value, metadata }
  return {
    async get(key) {
      return store.has(key) ? store.get(key).value : null;
    },
    async put(key, value, opts) {
      store.set(key, { value, metadata: opts?.metadata });
    },
    async list({ prefix }) {
      const keys = [...store.entries()]
        .filter(([k]) => k.startsWith(prefix))
        .map(([name, { metadata }]) => ({ name, metadata }));
      return { keys, list_complete: true, cursor: undefined };
    },
  };
}

test('submitReview rejects an invalid slug', async () => {
  const env = { AUDIT_KV: makeKV() };
  const res = await submitReview(env, { slug: 'not a slug!', name: 'A', rating: 5, comment: 'Great post' });
  assert.equal(res.ok, false);
});

test('submitReview rejects an out-of-range rating', async () => {
  const env = { AUDIT_KV: makeKV() };
  const res = await submitReview(env, { slug: 'my-post', name: 'A', rating: 7, comment: 'Great post' });
  assert.equal(res.ok, false);
  assert.match(res.error, /star rating/i);
});

test('submitReview rejects a too-short comment', async () => {
  const env = { AUDIT_KV: makeKV() };
  const res = await submitReview(env, { slug: 'my-post', name: 'A', rating: 4, comment: 'ok' });
  assert.equal(res.ok, false);
  assert.match(res.error, /too short/i);
});

test('submitReview defaults an empty name to Anonymous Reader', async () => {
  const env = { AUDIT_KV: makeKV() };
  const res = await submitReview(env, { slug: 'my-post', name: '  ', rating: 5, comment: 'Loved this guide!' });
  assert.equal(res.ok, true);
  assert.equal(res.review.name, 'Anonymous Reader');
});

test('a submitted review is returned by listReviews for the same slug, but not a different one', async () => {
  const env = { AUDIT_KV: makeKV() };
  await submitReview(env, { slug: 'post-a', name: 'Alice', rating: 5, comment: 'Excellent, learned a lot!' });

  const forA = await listReviews(env, 'post-a');
  assert.equal(forA.ok, true);
  assert.equal(forA.count, 1);
  assert.equal(forA.reviews[0].name, 'Alice');
  assert.equal(forA.average, 5);

  const forB = await listReviews(env, 'post-b');
  assert.equal(forB.ok, true);
  assert.equal(forB.count, 0);
  assert.equal(forB.average, 0);
});

test('the average rating is computed correctly and rounded to one decimal', async () => {
  const env = { AUDIT_KV: makeKV() };
  await submitReview(env, { slug: 'post-c', name: 'A', rating: 5, comment: 'Great content overall!' });
  await submitReview(env, { slug: 'post-c', name: 'B', rating: 4, comment: 'Pretty useful, thanks.' });
  await submitReview(env, { slug: 'post-c', name: 'C', rating: 3, comment: 'It was fine, could improve.' });

  const result = await listReviews(env, 'post-c');
  assert.equal(result.count, 3);
  assert.equal(result.average, 4); // (5+4+3)/3 = 4
});

test('listReviews rejects an invalid slug', async () => {
  const env = { AUDIT_KV: makeKV() };
  const res = await listReviews(env, 'DROP TABLE; --');
  assert.equal(res.ok, false);
});

/* --------------------------------------------------- via the HTTP layer */

function makeEnv() {
  return { AUDIT_KV: makeKV() };
}

function post(env, body) {
  return worker.fetch(
    new Request('https://smartgen-platforms.example/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
    { waitUntil: () => {} }
  );
}

function list(env, slug) {
  return worker.fetch(
    new Request(`https://smartgen-platforms.example/api/reviews?slug=${encodeURIComponent(slug)}`),
    env,
    { waitUntil: () => {} }
  );
}

test('POST then GET /api/reviews round-trips through the Worker routing', async () => {
  const env = makeEnv();
  const postRes = await post(env, { slug: 'hello-world', name: 'Reader', rating: 5, comment: 'Really helpful post!' });
  const postData = await postRes.json();
  assert.equal(postRes.status, 200);
  assert.equal(postData.ok, true);

  const listRes = await list(env, 'hello-world');
  const listData = await listRes.json();
  assert.equal(listRes.status, 200);
  assert.equal(listData.count, 1);
  assert.equal(listData.reviews[0].comment, 'Really helpful post!');
});

test('the review honeypot silently no-ops instead of erroring', async () => {
  const env = makeEnv();
  const res = await post(env, {
    slug: 'hello-world',
    name: 'Bot',
    rating: 5,
    comment: 'spam spam spam',
    company_website: 'https://spam.example',
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.spam, true);

  const listRes = await list(env, 'hello-world');
  const listData = await listRes.json();
  assert.equal(listData.count, 0);
});
