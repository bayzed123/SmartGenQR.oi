/**
 * Accounts and sessions for the SEO audit tool.
 *
 * WHY THIS EXISTS
 * ---------------
 * The audit quota used to be anonymous, keyed on a hash of IP + user-agent +
 * accept-language. That is trivially reset -- open a private window, switch
 * from wifi to mobile data, change browser -- so "3 free audits" was really
 * "3 free audits per browser session, unlimited if you care to bother". Once
 * the audit is something we intend to charge for, the quota has to attach to
 * an account rather than to a fingerprint.
 *
 * THREE KINDS OF CALLER
 * ---------------------
 *   owner    the site owner, authenticated with SEO_ADMIN_USERNAME and
 *            SEO_ADMIN_PASSWORD. Unlimited everything, no quota, no payment
 *            wall. There is exactly one.
 *   premium  granted out of band (see entitlements.js) by email, email
 *            domain, or audited site domain. Unlimited 72-check audits.
 *   free     any registered account. Three 27-check audits, then the wall.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * -----------------------------
 * No password reset, no email verification, no OAuth. Those need an outbound
 * mail path this Worker does not have yet. Registration therefore accepts any
 * syntactically valid address, which is fine while the only thing an account
 * unlocks is a free audit -- but it must be revisited before an account can
 * hold anything of value.
 */

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const PBKDF2_ITERATIONS = 210_000; // OWASP's 2023 floor for PBKDF2-HMAC-SHA256
const MIN_PASSWORD_LENGTH = 8;

/* -------------------------------------------------------------------------- */
/* password hashing                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Derive a password hash. PBKDF2 is used rather than bcrypt/argon2 because it
 * is what WebCrypto gives us inside a Worker -- there is no native binding for
 * the others, and a pure-JS implementation would blow the CPU budget.
 */
async function derive(password, saltBytes, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, iterations, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'pbkdf2') return false;

  const salt = unb64(saltB64);
  const expected = unb64(hashB64);
  const actual = await derive(password, salt, Number(iterations) || PBKDF2_ITERATIONS);
  return timingSafeEqual(actual, expected);
}

/* -------------------------------------------------------------------------- */
/* accounts                                                                    */
/* -------------------------------------------------------------------------- */

export function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value) {
  // Deliberately permissive. A stricter pattern rejects real addresses far
  // more often than it catches fake ones, and we cannot verify deliverability
  // from here anyway.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function passwordProblem(password) {
  const value = String(password || '');
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (value.length > 200) return 'Password must be under 200 characters.';
  return null;
}

const userKey = (email) => `user:${email}`;

export async function findUser(env, email) {
  if (!env.AUDIT_KV) return null;
  return env.AUDIT_KV.get(userKey(email), 'json');
}

export async function createUser(env, email, password) {
  if (!env.AUDIT_KV) throw new Error('Account storage is not configured.');

  const record = {
    email,
    password: await hashPassword(password),
    createdAt: new Date().toISOString(),
    auditsUsed: 0,
  };
  // 'wx'-style guard: KV has no atomic create, so re-check immediately before
  // the write. The window is small and the worst case is a duplicate
  // registration racing itself, which the caller reports as "already exists".
  const existing = await findUser(env, email);
  if (existing) return { ok: false, reason: 'exists' };

  await env.AUDIT_KV.put(userKey(email), JSON.stringify(record));
  return { ok: true, user: record };
}

/** Record one consumed audit against the account. */
export async function consumeAccountAudit(env, email) {
  if (!env.AUDIT_KV) return { used: 0 };
  const user = await findUser(env, email);
  if (!user) return { used: 0 };
  user.auditsUsed = (user.auditsUsed || 0) + 1;
  user.lastAuditAt = new Date().toISOString();
  await env.AUDIT_KV.put(userKey(email), JSON.stringify(user));
  return { used: user.auditsUsed };
}

/* -------------------------------------------------------------------------- */
/* the owner                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The owner's credentials live in Cloudflare secrets, synced from the GitHub
 * secrets SEO_ADMIN_USERNAME and SEO_ADMIN_PASSWORD by the deploy workflow.
 *
 * Both comparisons are timing-safe. A plain === on the password leaks its
 * length and a prefix of its content through response timing, which is exactly
 * the credential worth protecting here since it unlocks everything.
 */
export function isOwnerLogin(env, username, password) {
  const expectedUser = env.SEO_ADMIN_USERNAME;
  const expectedPass = env.SEO_ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  const enc = new TextEncoder();
  // Compare both fields unconditionally so a wrong username and a wrong
  // password cost the same time.
  const userOk = timingSafeEqual(
    enc.encode(String(username || '').trim().toLowerCase()),
    enc.encode(String(expectedUser).trim().toLowerCase())
  );
  const passOk = timingSafeEqual(enc.encode(String(password || '')), enc.encode(String(expectedPass)));
  return userOk && passOk;
}

export function ownerConfigured(env) {
  return Boolean(env.SEO_ADMIN_USERNAME && env.SEO_ADMIN_PASSWORD);
}

/* -------------------------------------------------------------------------- */
/* sessions                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A session is `payload.signature`, both base64url. The payload is not secret
 * -- it holds the email, the role and an expiry -- but the signature means it
 * cannot be edited, so a free account cannot promote itself to owner by
 * rewriting a cookie.
 *
 * Signed with SESSION_SECRET. If that secret is rotated every existing session
 * stops verifying, which is the intended behaviour for a forced logout.
 */
export async function mintSession(env, { email, role }) {
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured.');

  const payload = {
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = b64(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(secret, encoded);
  return `${encoded}.${sig}`;
}

export async function verifySession(env, token) {
  const secret = env.SESSION_SECRET;
  if (!secret || !token) return null;

  const [encoded, sig] = String(token).split('.');
  if (!encoded || !sig) return null;

  const expected = await hmac(secret, encoded);
  if (!timingSafeEqual(new TextEncoder().encode(sig), new TextEncoder().encode(expected))) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(unb64(encoded)));
  } catch {
    return null;
  }
  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/** Pull a session token from the Authorization header or a JSON body field. */
export function sessionTokenFrom(request, body) {
  const header = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (header) return header;
  return String(body?.sessionToken || '').trim();
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return b64(new Uint8Array(sig));
}

/**
 * Constant-time comparison. Length is compared first and returns early, which
 * leaks only the length -- unavoidable, and not the secret part.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function b64(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64(str) {
  const padded = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}
