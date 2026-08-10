/**
 * Anonymous free-audit quota — no login, no cookie the visitor has to accept.
 *
 * WHY 3 PER DAY
 * -------------
 * One audit is not enough to build trust; the visitor tries their own site,
 * gets a score, and leaves with no reason to come back. Five or more removes
 * every reason to pay. Three is the sweet spot: audit your own site, audit a
 * competitor, audit a client's site — by the third run the tool has proven
 * itself and the wall lands exactly when intent is highest. It also keeps us
 * inside Cloudflare's free tier (2 KV writes per audit ≈ 500 audits/day).
 *
 * Change it any time with the FREE_AUDIT_LIMIT var in wrangler.toml.
 */

const WINDOW_SECONDS = 24 * 60 * 60;

/**
 * Identify a visitor without a login. IP alone punishes shared offices and
 * carrier NAT, so we combine it with a coarse client fingerprint.
 */
export async function visitorKey(request) {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '0.0.0.0';
  const ua = request.headers.get('user-agent') || '';
  const lang = request.headers.get('accept-language') || '';
  const hash = await sha256Hex(`${ip}|${ua}|${lang}`);
  return `quota:${hash.slice(0, 32)}`;
}

/** Read the current usage without consuming anything. */
export async function getQuota(env, key) {
  const limit = Number(env.FREE_AUDIT_LIMIT || 3);
  if (!env.AUDIT_KV) return { used: 0, limit, remaining: limit, exhausted: false, unlimited: true };

  const raw = await env.AUDIT_KV.get(key, 'json');
  const used = raw?.count || 0;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exhausted: used >= limit,
    resetsAt: raw?.resetsAt || null,
  };
}

/** Consume one audit. Returns the post-consumption quota state. */
export async function consumeQuota(env, key) {
  const limit = Number(env.FREE_AUDIT_LIMIT || 3);
  if (!env.AUDIT_KV) return { used: 0, limit, remaining: limit, exhausted: false, unlimited: true };

  const raw = await env.AUDIT_KV.get(key, 'json');
  const resetsAt = raw?.resetsAt || new Date(Date.now() + WINDOW_SECONDS * 1000).toISOString();
  const used = (raw?.count || 0) + 1;

  await env.AUDIT_KV.put(key, JSON.stringify({ count: used, resetsAt }), {
    expirationTtl: WINDOW_SECONDS,
  });

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exhausted: used >= limit,
    resetsAt,
  };
}

/**
 * Cache a completed report for 6 hours. Re-scanning the same domain then
 * costs zero subrequests, which matters a lot on the free plan.
 */
export async function cacheReport(env, domain, tier, report) {
  if (!env.AUDIT_KV) return;
  try {
    await env.AUDIT_KV.put(`report:${tier}:${domain}`, JSON.stringify(report), {
      expirationTtl: 6 * 60 * 60,
    });
  } catch {
    // A full KV namespace must never break an audit.
  }
}

export async function readCachedReport(env, domain, tier) {
  if (!env.AUDIT_KV) return null;
  try {
    return await env.AUDIT_KV.get(`report:${tier}:${domain}`, 'json');
  } catch {
    return null;
  }
}

/**
 * Rate limiting that costs nothing.
 *
 * The chatbot is chatty by nature, and one KV write per message would eat the
 * free plan's 1,000 writes/day. The Cache API has no write quota, so counters
 * live there instead. Cache is per-colo rather than global, which is fine for
 * a brake — a visitor is normally pinned to one colo, and the worst case is
 * that a travelling user gets a slightly higher allowance.
 *
 * @returns {{ok:boolean, used:number, limit:number, remaining:number, resetsInSeconds:number}}
 */
export async function cacheRateLimit(key, limit, windowSeconds) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const resetsInSeconds = windowSeconds - Math.floor((Date.now() / 1000) % windowSeconds);
  // Cache keys must look like URLs; this host is never actually requested.
  const cacheKey = new Request(`https://ratelimit.smartgen.internal/${key}/${bucket}`);
  const cache = caches.default;

  let used = 0;
  try {
    const hit = await cache.match(cacheKey);
    if (hit) used = Number(await hit.text()) || 0;
  } catch {
    // A cache miss or read error just means "no usage recorded yet".
  }

  const next = used + 1;
  try {
    await cache.put(
      cacheKey,
      new Response(String(next), {
        headers: { 'Cache-Control': `max-age=${windowSeconds}`, 'Content-Type': 'text/plain' },
      })
    );
  } catch {
    // If we cannot record usage we let the request through rather than
    // locking everyone out on a cache hiccup.
  }

  return {
    ok: next <= limit,
    used: next,
    limit,
    remaining: Math.max(0, limit - next),
    resetsInSeconds,
  };
}

/** Coarse abuse brake: max N audits per minute from one visitor. */
export async function burstLimit(env, key, max = 4) {
  if (!env.AUDIT_KV) return { ok: true };
  const bucket = `burst:${key}:${Math.floor(Date.now() / 60_000)}`;
  const count = Number((await env.AUDIT_KV.get(bucket)) || 0) + 1;
  await env.AUDIT_KV.put(bucket, String(count), { expirationTtl: 120 });
  return { ok: count <= max, count };
}

async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
