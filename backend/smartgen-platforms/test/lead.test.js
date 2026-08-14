import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../src/index.js';

/** No LEADS_SHEET_ID/GOOGLE_SERVICE_ACCOUNT_JSON -> storage is skipped, but
 * validation still runs, so this env is enough to exercise handleLead. */
const ENV = {};

function post(body) {
  return worker.fetch(
    new Request('https://smartgen-platforms.example/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    ENV,
    { waitUntil: () => {} }
  );
}

test('a newsletter signup succeeds with only an email, no fullName required', async () => {
  const res = await post({ lead: { leadType: 'newsletter_subscribe', email: 'reader@example.com' } });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
});

test('a free_audit lead still requires fullName', async () => {
  const res = await post({ lead: { leadType: 'free_audit', email: 'reader@example.com' } });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.equal(data.ok, false);
  assert.match(data.error, /name/i);
});

test('a lead with no leadType (default) still requires fullName', async () => {
  const res = await post({ lead: { email: 'reader@example.com' } });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.equal(data.ok, false);
});

test('an invalid email is rejected regardless of leadType', async () => {
  const res = await post({ lead: { leadType: 'newsletter_subscribe', email: 'not-an-email' } });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.match(data.error, /valid email/i);
});

test('the honeypot silently no-ops instead of erroring', async () => {
  const res = await post({
    lead: { leadType: 'newsletter_subscribe', email: 'bot@example.com', company_website: 'https://spam.example' },
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.spam, true);
});
