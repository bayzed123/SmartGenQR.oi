import test from 'node:test';
import assert from 'node:assert/strict';
import * as ent from '../src/lib/entitlements.js';

/**
 * Who gets premium: owner, email, email domain, audited site domain, plus
 * expiry and revocation.
 *
 * Every test builds its own KV. An earlier version shared one store and
 * relied on the order statements happened to run in, which quietly broke the
 * moment the assertions became deferred callbacks -- the setup all ran first
 * and the tests then asserted against end-state. Isolation is not ceremony
 * here; it is what makes these results mean anything.
 */
function freshEnv() {
  const store = new Map();
  const KV = {
    async get(k, t) {
      const v = store.get(k);
      return v == null ? null : t === 'json' ? JSON.parse(v) : v;
    },
    async put(k, v) { store.set(k, v); },
    async delete(k) { store.delete(k); },
    async list({ prefix, limit }) {
      return {
        keys: [...store.keys()].filter((k) => k.startsWith(prefix)).slice(0, limit).map((name) => ({ name })),
      };
    },
  };
  return { env: { AUDIT_KV: KV, FREE_AUDIT_LIMIT: '3' }, store };
}

const user = (email, role = 'user') => ({ email, role });

/* ------------------------------------------------ identifier normalisation */
// The workflow accepts whatever the owner pastes, so this has to be forgiving.

test('a pasted URL reduces to its hostname', () => {
  assert.equal(ent.normaliseIdentifier('site_domain', 'https://www.Acme.com/pricing?x=1'), 'acme.com');
});

test('an @-prefixed domain reduces', () => {
  assert.equal(ent.normaliseIdentifier('email_domain', '@Acme.com'), 'acme.com');
});

test('a port is stripped', () => {
  assert.equal(ent.normaliseIdentifier('site_domain', 'acme.com:8080'), 'acme.com');
});

test('an email is lowercased', () => {
  assert.equal(ent.normaliseIdentifier('email', 'Sara@Acme.COM'), 'sara@acme.com');
});

test('emailDomain extracts the domain', () => {
  assert.equal(ent.emailDomain('sara@acme.com'), 'acme.com');
});

/* ------------------------------------------------------------ base tiers */

test('signed out resolves to anonymous', async () => {
  const { env } = freshEnv();
  assert.equal((await ent.resolveEntitlement(env, null, 'x.com')).tier, 'anonymous');
});

test('a plain account is free', async () => {
  const { env } = freshEnv();
  assert.equal((await ent.resolveEntitlement(env, user('sara@acme.com'), 'x.com')).tier, 'free');
});

test('the owner is unlimited regardless of grants', async () => {
  const { env } = freshEnv();
  const r = await ent.resolveEntitlement(env, user('me', 'owner'), 'x.com');
  assert.equal(r.unlimited, true);
  assert.equal(r.tier, 'owner');
});

/* --------------------------------------------------------- the three routes */

test('an email grant makes exactly that person premium', async () => {
  const { env } = freshEnv();
  await ent.putGrant(env, { kind: 'email', value: 'sara@acme.com' });

  const granted = await ent.resolveEntitlement(env, user('sara@acme.com'), 'x.com');
  assert.equal(granted.premium, true);
  assert.equal(granted.source, 'email');

  const other = await ent.resolveEntitlement(env, user('bob@other.com'), 'x.com');
  assert.equal(other.tier, 'free', 'a grant must not leak to other accounts');
});

test('an email_domain grant covers everyone at the company', async () => {
  const { env } = freshEnv();
  await ent.putGrant(env, { kind: 'email_domain', value: 'corp.com' });

  const staff = await ent.resolveEntitlement(env, user('anyone@corp.com'), 'x.com');
  assert.equal(staff.premium, true);
  assert.equal(staff.source, 'email_domain');

  const outsider = await ent.resolveEntitlement(env, user('anyone@notcorp.com'), 'x.com');
  assert.equal(outsider.tier, 'free');
});

test('a site_domain grant follows the audited site, not the account', async () => {
  const { env } = freshEnv();
  await ent.putGrant(env, { kind: 'site_domain', value: 'client.com' });

  const onSite = await ent.resolveEntitlement(env, user('nobody@nowhere.com'), 'client.com');
  assert.equal(onSite.premium, true);
  assert.equal(onSite.source, 'site_domain');

  const elsewhere = await ent.resolveEntitlement(env, user('nobody@nowhere.com'), 'other.com');
  assert.equal(elsewhere.tier, 'free', 'the same account is free on any other site');
});

/* ------------------------------------------------------ revoke and expiry */

test('revoking a grant returns the account to free', async () => {
  const { env } = freshEnv();
  await ent.putGrant(env, { kind: 'email', value: 'sara@acme.com' });
  assert.equal((await ent.resolveEntitlement(env, user('sara@acme.com'), 'x.com')).premium, true);

  await ent.deleteGrant(env, 'email', 'sara@acme.com');
  assert.equal((await ent.resolveEntitlement(env, user('sara@acme.com'), 'x.com')).tier, 'free');
});

test('an expired grant is not honoured and is swept on read', async () => {
  const { env, store } = freshEnv();
  await ent.putGrant(env, {
    kind: 'email',
    value: 'exp@acme.com',
    expiresAt: new Date(Date.now() - 1000).toISOString(),
  });

  assert.equal((await ent.resolveEntitlement(env, user('exp@acme.com'), 'x.com')).tier, 'free');
  assert.equal(store.has('premium:email:exp@acme.com'), false, 'expired grants are deleted lazily');
});

/* ------------------------------------------------------------- free quota */

test('a fresh account has the full free allowance', () => {
  const { env } = freshEnv();
  assert.equal(ent.freeQuotaFor(env, { auditsUsed: 0 }).remaining, 3);
});

test('the allowance is exhausted at the limit', () => {
  const { env } = freshEnv();
  assert.equal(ent.freeQuotaFor(env, { auditsUsed: 3 }).exhausted, true);
});

test('remaining never goes negative', () => {
  const { env } = freshEnv();
  assert.equal(ent.freeQuotaFor(env, { auditsUsed: 99 }).remaining, 0);
});

/* -------------------------------------------- listing, for the workflow log */

test('listGrants returns only live grants', async () => {
  const { env, store } = freshEnv();
  await ent.putGrant(env, { kind: 'email_domain', value: 'corp.com' });
  await ent.putGrant(env, { kind: 'site_domain', value: 'client.com' });

  // An expired grant that has never been read, so nothing has swept it yet.
  // It must still be absent from the listing the workflow prints.
  store.set(
    'premium:email:stale@acme.com',
    JSON.stringify({ kind: 'email', value: 'stale@acme.com', expiresAt: new Date(Date.now() - 5000).toISOString() })
  );

  const grants = await ent.listGrants(env);
  assert.equal(grants.length, 2);
  assert.deepEqual(
    grants.map((g) => `${g.kind}:${g.value}`).sort(),
    ['email_domain:corp.com', 'site_domain:client.com']
  );
});
