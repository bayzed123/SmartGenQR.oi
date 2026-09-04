import test from 'node:test';
import assert from 'node:assert/strict';

/** Accounts, password hashing and session signing, including forgery attempts. */
import * as auth from '../src/lib/auth.js';
import * as ent from '../src/lib/entitlements.js';

// Minimal in-memory KV double with the surface these modules use.
const store = new Map();
const KV = {
  async get(k, t) { const v = store.get(k); return v == null ? null : (t === 'json' ? JSON.parse(v) : v); },
  async put(k, v) { store.set(k, v); },
  async delete(k) { store.delete(k); },
  async list({ prefix, limit }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).slice(0, limit).map(name => ({ name })) }; },
};
const env = { AUDIT_KV: KV, SESSION_SECRET: 'test-secret-value', FREE_AUDIT_LIMIT: '3',
              SEO_ADMIN_USERNAME: 'bayezid', SEO_ADMIN_PASSWORD: 'owner-pass-123' };

// --- passwords
const h = await auth.hashPassword('correct horse battery');
test('hash is salted pbkdf2', () => assert.ok(h.startsWith('pbkdf2$210000$')));
test('correct password verifies', async () => assert.ok(await auth.verifyPassword('correct horse battery', h)));
test('wrong password rejected', async () => assert.ok(!(await auth.verifyPassword('wrong', h))));
test('same password hashes differently (unique salt)', async () => assert.ok((await auth.hashPassword('x')) !== (await auth.hashPassword('x'))));

// --- validation
test('short password rejected', () => assert.ok(auth.passwordProblem('short') !== null));
test('8-char password accepted', () => assert.ok(auth.passwordProblem('12345678') === null));
test('invalid email rejected', () => assert.ok(!auth.isValidEmail('not-an-email')));
test('valid email accepted', () => assert.ok(auth.isValidEmail('a@b.co')));

// --- accounts
const c1 = await auth.createUser(env, 'sara@acme.com', 'password123');
test('user created', () => assert.ok(c1.ok));
const c2 = await auth.createUser(env, 'sara@acme.com', 'password123');
test('duplicate registration refused', () => assert.ok(!c2.ok && c2.reason === 'exists'));

// --- owner
test('owner login accepted', () => assert.ok(auth.isOwnerLogin(env, 'bayezid', 'owner-pass-123')));
test('owner login case-insensitive username', () => assert.ok(auth.isOwnerLogin(env, 'BAYEZID', 'owner-pass-123')));
test('owner wrong password rejected', () => assert.ok(!auth.isOwnerLogin(env, 'bayezid', 'nope')));
test('owner rejected when unconfigured', () => assert.ok(!auth.isOwnerLogin({}, 'bayezid', 'owner-pass-123')));

// --- sessions
const tok = await auth.mintSession(env, { email: 'sara@acme.com', role: 'user' });
const ok = await auth.verifySession(env, tok);
test('session verifies', () => assert.ok(ok && ok.email === 'sara@acme.com' && ok.role === 'user'));
test('tampered payload rejected', async () => assert.ok(!(await auth.verifySession(env, 'eyJhIjoxfQ.' + tok.split('.')[1]))));
test('wrong signing secret rejected', async () => assert.ok(!(await auth.verifySession({ SESSION_SECRET: 'other' }, tok))));
test('garbage token rejected', async () => assert.ok(!(await auth.verifySession(env, 'garbage'))));
// privilege escalation attempt: rewrite role to owner, keep old signature
const forged = Buffer.from(JSON.stringify({ email: 'sara@acme.com', role: 'owner', exp: 9e9 })).toString('base64url');
test('role escalation rejected', async () => assert.ok(!(await auth.verifySession(env, forged + '.' + tok.split('.')[1]))));

