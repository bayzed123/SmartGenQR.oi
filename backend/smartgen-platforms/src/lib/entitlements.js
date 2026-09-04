/**
 * Who is allowed what.
 *
 * Premium is granted out of band rather than bought in-app: the owner runs the
 * "Premium SEO Access" GitHub Action with an email or a domain, that workflow
 * calls /api/admin/premium, and the grant lands in KV. The Worker reads it on
 * every audit. There is no Stripe webhook to trust and no checkout to fake --
 * the only way to become premium is for the owner to say so.
 *
 * THREE WAYS TO BE PREMIUM
 * ------------------------
 *   email        one address.                 grant email      sara@acme.com
 *   email_domain everyone at a company.       grant email_domain acme.com
 *                Matches the domain of the *logged-in account's* address, so
 *                a whole team is covered by one grant.
 *   site_domain  a site, whoever audits it.   grant site_domain acme.com
 *                Matches the domain *being audited*, which is what an agency
 *                buying "premium for this client's site" actually wants.
 *
 * Grants can carry an expiry. An expired grant is treated as absent and is
 * lazily deleted on read, so KV does not fill with dead records.
 */

export const GRANT_KINDS = ['email', 'email_domain', 'site_domain'];

const grantKey = (kind, value) => `premium:${kind}:${value}`;

export function normaliseIdentifier(kind, raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return '';
  if (kind === 'email') return value;
  // Accept a pasted URL or an @-prefixed domain and reduce it to the hostname.
  return value
    .replace(/^@/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];
}

export function emailDomain(email) {
  const at = String(email || '').lastIndexOf('@');
  return at === -1 ? '' : String(email).slice(at + 1).toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* grant storage                                                               */
/* -------------------------------------------------------------------------- */

export async function putGrant(env, { kind, value, plan, expiresAt, note, grantedBy }) {
  if (!env.AUDIT_KV) throw new Error('Grant storage is not configured.');
  const record = {
    kind,
    value,
    plan: plan || 'premium',
    grantedAt: new Date().toISOString(),
    grantedBy: grantedBy || 'owner',
    expiresAt: expiresAt || null,
    note: note || '',
  };

  // Let KV expire the key itself where an expiry is set, so a lapsed grant
  // disappears even if nobody ever reads it again.
  const options = {};
  if (expiresAt) {
    const ttl = Math.floor((Date.parse(expiresAt) - Date.now()) / 1000);
    if (ttl > 60) options.expirationTtl = ttl;
  }

  await env.AUDIT_KV.put(grantKey(kind, value), JSON.stringify(record), options);
  return record;
}

export async function deleteGrant(env, kind, value) {
  if (!env.AUDIT_KV) return false;
  const existing = await env.AUDIT_KV.get(grantKey(kind, value));
  await env.AUDIT_KV.delete(grantKey(kind, value));
  return Boolean(existing);
}

export async function readGrant(env, kind, value) {
  if (!env.AUDIT_KV || !value) return null;
  const record = await env.AUDIT_KV.get(grantKey(kind, value), 'json');
  if (!record) return null;

  if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
    // Lazy cleanup: an expired grant is gone as far as callers are concerned.
    await env.AUDIT_KV.delete(grantKey(kind, value)).catch(() => {});
    return null;
  }
  return record;
}

export async function listGrants(env, limit = 200) {
  if (!env.AUDIT_KV) return [];
  const out = [];
  for (const kind of GRANT_KINDS) {
    const page = await env.AUDIT_KV.list({ prefix: `premium:${kind}:`, limit });
    for (const key of page.keys) {
      const record = await env.AUDIT_KV.get(key.name, 'json');
      if (!record) continue;
      const expired = record.expiresAt && Date.parse(record.expiresAt) <= Date.now();
      if (!expired) out.push(record);
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* resolution                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Decide the tier for one audit request.
 *
 * Order matters: the owner short-circuits everything, then the three premium
 * routes, then free. The audited domain is checked last among the premium
 * routes because it is the broadest -- a site_domain grant makes that site
 * premium for anyone, which is intended but should not mask a more specific
 * per-account grant when reporting *why* someone is premium.
 *
 * @param {object} session  verified session payload, or null when signed out
 * @param {string} auditDomain  hostname being audited, may be empty
 */
export async function resolveEntitlement(env, session, auditDomain) {
  if (!session) {
    return { tier: 'anonymous', premium: false, unlimited: false, reason: 'Sign in to run an audit.' };
  }

  if (session.role === 'owner') {
    return {
      tier: 'owner',
      premium: true,
      unlimited: true,
      source: 'owner',
      reason: 'Owner account — all features unlocked.',
    };
  }

  const email = String(session.email || '').toLowerCase();

  const byEmail = await readGrant(env, 'email', email);
  if (byEmail) {
    return { tier: 'premium', premium: true, unlimited: true, source: 'email', grant: byEmail };
  }

  const byEmailDomain = await readGrant(env, 'email_domain', emailDomain(email));
  if (byEmailDomain) {
    return {
      tier: 'premium',
      premium: true,
      unlimited: true,
      source: 'email_domain',
      grant: byEmailDomain,
    };
  }

  const site = normaliseIdentifier('site_domain', auditDomain);
  if (site) {
    const bySite = await readGrant(env, 'site_domain', site);
    if (bySite) {
      return { tier: 'premium', premium: true, unlimited: true, source: 'site_domain', grant: bySite };
    }
  }

  return { tier: 'free', premium: false, unlimited: false, source: 'account' };
}

/** Free-tier state for a signed-in account. */
export function freeQuotaFor(env, user) {
  const limit = Number(env.FREE_AUDIT_LIMIT || 3);
  const used = Number(user?.auditsUsed || 0);
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exhausted: used >= limit,
  };
}
