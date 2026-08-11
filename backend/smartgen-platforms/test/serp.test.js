import test from 'node:test';
import assert from 'node:assert/strict';

import { suggestSerpCopy } from '../src/lib/gemini.js';
import { checkRanking } from '../src/lib/rank.js';

/* --------------------------------------------------- suggestSerpCopy */

test('suggestSerpCopy degrades gracefully with no GEMINI_API_KEY', async () => {
  const result = await suggestSerpCopy({ topic: 'a free QR code generator' }, {});
  assert.equal(result.available, false);
  assert.match(result.reason, /not configured/i);
});

test('suggestSerpCopy rejects an empty topic without calling the model', async () => {
  const result = await suggestSerpCopy({ topic: '' }, { GEMINI_API_KEY: 'fake-key-never-used' });
  assert.equal(result.available, false);
  assert.match(result.reason, /describe what the page/i);
});

test('suggestSerpCopy never throws on a network-unreachable key', async () => {
  // Not a real key, so the fetch will fail or the API will reject it — the
  // function must still resolve, not throw, so a Gemini outage can never
  // crash the /api/serp/suggest route.
  const result = await suggestSerpCopy(
    { topic: 'a free QR code generator', url: 'https://smartgentools.com/qr-generator/' },
    { GEMINI_API_KEY: 'invalid-test-key' }
  );
  assert.equal(typeof result.available, 'boolean');
});

/* -------------------------------------------------------- checkRanking */

test('checkRanking degrades gracefully with no CSE credentials', async () => {
  const result = await checkRanking({ domain: 'smartgentools.com', keyword: 'qr code generator' }, {});
  assert.equal(result.available, false);
  assert.match(result.reason, /not configured/i);
});

test('checkRanking requires both a domain and a keyword', async () => {
  const env = { GOOGLE_CSE_API_KEY: 'fake', GOOGLE_CSE_ID: 'fake' };

  const noDomain = await checkRanking({ domain: '', keyword: 'qr code' }, env);
  assert.equal(noDomain.available, false);
  assert.match(noDomain.reason, /page url/i);

  const noKeyword = await checkRanking({ domain: 'smartgentools.com', keyword: '' }, env);
  assert.equal(noKeyword.available, false);
  assert.match(noKeyword.reason, /keyword/i);
});

test('checkRanking never throws on a network-unreachable key', async () => {
  const result = await checkRanking(
    { domain: 'smartgentools.com', keyword: 'qr code generator' },
    { GOOGLE_CSE_API_KEY: 'invalid-test-key', GOOGLE_CSE_ID: 'invalid-test-cx' }
  );
  assert.equal(typeof result.available, 'boolean');
});
