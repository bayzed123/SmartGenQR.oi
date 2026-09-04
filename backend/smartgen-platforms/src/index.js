/**
 * SmartGen Platforms — Cloudflare Worker API
 * Backend for the SmartGen SEO Audit Tool (https://smartgentools.com/seo-audit-tool/)
 *
 * Design notes
 * ------------
 * • Scanning only. Email delivery is handled by the separate SmartGen mailer,
 *   which reads the leads spreadsheet — so a slow inbox can never stall or
 *   crash an audit.
 * • Audits require an account. The free allowance is metered per account in
 *   KV, not per visitor fingerprint -- a fingerprint resets with a private
 *   window, so it never actually limited anything. Premium is granted out of
 *   band by the owner (see lib/entitlements.js), never bought in-app.
 * • Every premium enrichment (PageSpeed, Gemini, Sheets) degrades gracefully:
 *   if one is unavailable the report still ships, with a note.
 *
 * Routes
 *   GET  /                        service banner
 *   GET  /api/health              uptime + which integrations are configured
 *   GET  /api/checks              public catalogue of all 72 checks
 *   GET  /api/pricing             tier comparison table (server is the source of truth)
 *   GET  /api/quota               this account's remaining audits + tier
 *   POST /api/auth/register       create an account
 *   POST /api/auth/login          sign in (account, or the owner)
 *   GET  /api/auth/me             who am I, and what am I entitled to
 *   POST /api/audit               audit — 27 checks free, 72 for premium/owner
 *   POST /api/audit/premium       full audit — 72 checks + CWV + AI + competitor
 *   POST /api/lead                store a lead in Google Sheets
 *   POST /api/chat                SmartGen AI Assistant (grounded, site-scoped)
 *   GET  /api/chat/suggestions    opening greeting + starter questions
 *   POST /api/serp/suggest        AI title/description suggestions (Gemini)
 *   POST /api/serp/rank           keyword ranking lookup (Google Custom Search)
 *   GET  /api/reviews             a blog post's reviews + average rating
 *   POST /api/reviews             submit a review for a blog post
 *   POST /api/admin/init-sheet    one-time header row (requires ADMIN_TOKEN)
 *   POST /api/admin/premium       grant/revoke/check premium (ADMIN_TOKEN)
 *   GET  /api/admin/premium       list active grants (ADMIN_TOKEN)
 */

import { buildAuditContext, buildLightContext } from './lib/crawl.js';
import { buildReport, buildComparison, buildWhiteLabel } from './lib/report.js';
import { checkCatalogue, categoryCounts } from './checks/registry.js';
import { fetchCoreWebVitals } from './lib/pagespeed.js';
import { generateRoadmap, suggestSerpCopy } from './lib/gemini.js';
import { checkRanking } from './lib/rank.js';
import { appendLead, ensureHeaderRow } from './lib/sheets.js';
import { listReviews, submitReview } from './lib/reviews.js';
import {
  normaliseEmail,
  isValidEmail,
  passwordProblem,
  findUser,
  createUser,
  verifyPassword,
  consumeAccountAudit,
  isOwnerLogin,
  ownerConfigured,
  mintSession,
  verifySession,
  sessionTokenFrom,
} from './lib/auth.js';
import {
  GRANT_KINDS,
  normaliseIdentifier,
  putGrant,
  deleteGrant,
  readGrant,
  listGrants,
  resolveEntitlement,
  freeQuotaFor,
} from './lib/entitlements.js';
import {
  visitorKey,
  getQuota,
  burstLimit,
  cacheRateLimit,
  cacheReport,
  readCachedReport,
} from './lib/quota.js';
import { answerQuestion } from './lib/chat.js';
import { SITE, TOOLS } from './lib/knowledge.js';

const VERSION = '1.0.0';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      const response = await route(url, request, env, ctx);
      for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
      return response;
    } catch (err) {
      const status = err.status || 500;
      return json(
        {
          ok: false,
          error: err.userMessage || 'Something went wrong while auditing that site.',
          code: err.code || 'internal_error',
          ...(env.DEBUG === 'true' ? { debug: err.message, stack: err.stack } : {}),
        },
        status,
        cors
      );
    }
  },
};

async function route(url, request, env, ctx) {
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/' && request.method === 'GET') {
    return json({
      service: 'SmartGen Platforms API',
      version: VERSION,
      docs: 'https://smartgentools.com/seo-audit-tool/',
      endpoints: [
        'GET /api/health',
        'GET /api/checks',
        'GET /api/pricing',
        'GET /api/quota',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'POST /api/audit',
        'POST /api/audit/premium',
        'POST /api/lead',
        'POST /api/chat',
        'GET /api/chat/suggestions',
        'POST /api/serp/suggest',
        'POST /api/serp/rank',
        'GET /api/reviews',
        'POST /api/reviews',
      ],
    });
  }

  if (path === '/api/health' && request.method === 'GET') {
    return json({
      ok: true,
      version: VERSION,
      time: new Date().toISOString(),
      integrations: {
        kv: Boolean(env.AUDIT_KV),
        pagespeed: env.ENABLE_PAGESPEED !== 'false' && Boolean(env.PAGESPEED_API_KEY),
        gemini: env.ENABLE_AI_ROADMAP !== 'false' && Boolean(env.GEMINI_API_KEY),
        sheets: Boolean(env.LEADS_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_JSON),
        chatbot: Boolean(env.GEMINI_API_KEY),
        serpSuggestions: Boolean(env.GEMINI_API_KEY),
        rankChecker: Boolean(env.GOOGLE_CSE_API_KEY && env.GOOGLE_CSE_ID),
        blogReviews: Boolean(env.AUDIT_KV),
        paymentsEnabled: env.PAYMENTS_ENABLED === 'true',

        // Without these three the premium access model is inert, and the
        // failure is quiet: sign-in returns 503 and the grant workflow gets a
        // 401, neither of which is visible from the site. Surfacing them here
        // makes "is it configured?" answerable with one request.
        accounts: Boolean(env.AUDIT_KV && env.SESSION_SECRET),
        ownerLogin: ownerConfigured(env),
        premiumGrants: Boolean(env.AUDIT_KV && env.ADMIN_TOKEN),
      },
      knowledge: {
        tools: TOOLS.length,
        sourceHash: SITE.sourceHash,
      },
      freeAuditLimit: Number(env.FREE_AUDIT_LIMIT || 3),
    });
  }

  if (path === '/api/checks' && request.method === 'GET') {
    return json(
      { ok: true, total: 72, free: 27, categories: categoryCounts(), checks: checkCatalogue() },
      200,
      { 'Cache-Control': 'public, max-age=3600' }
    );
  }

  if (path === '/api/pricing' && request.method === 'GET') {
    return json({ ok: true, ...pricing(env) }, 200, { 'Cache-Control': 'public, max-age=600' });
  }

  if (path === '/api/quota' && request.method === 'GET') {
    // Signed in: the quota that actually applies. Signed out: the anonymous
    // fingerprint quota, kept only so the page can show "3 free" before login.
    const session = await verifySession(env, sessionTokenFrom(request, null));
    if (session) {
      const ent = await resolveEntitlement(env, session, '');
      const user = session.role === 'owner' ? null : await findUser(env, session.email);
      return json({
        ok: true,
        signedIn: true,
        account: { email: session.email, role: session.role },
        entitlement: { tier: ent.tier, unlimited: ent.unlimited, source: ent.source || null },
        quota: ent.unlimited ? { unlimited: true } : freeQuotaFor(env, user),
      });
    }
    const key = await visitorKey(request);
    return json({ ok: true, signedIn: false, quota: await getQuota(env, key) });
  }

  if (path === '/api/auth/register' && request.method === 'POST') {
    return handleRegister(request, env);
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }

  if (path === '/api/auth/me' && request.method === 'GET') {
    return handleMe(request, env);
  }

  if (path === '/api/admin/premium' && request.method === 'POST') {
    return handlePremiumGrant(request, env);
  }

  if (path === '/api/admin/premium' && request.method === 'GET') {
    return handlePremiumList(request, env);
  }

  if (path === '/api/audit' && request.method === 'POST') {
    return handleFreeAudit(request, env, ctx);
  }

  if (path === '/api/audit/premium' && request.method === 'POST') {
    return handlePremiumAudit(request, env, ctx);
  }

  if (path === '/api/lead' && request.method === 'POST') {
    return handleLead(request, env, ctx);
  }

  if (path === '/api/chat' && request.method === 'POST') {
    return handleChat(request, env);
  }

  if (path === '/api/chat/suggestions' && request.method === 'GET') {
    return json(
      {
        ok: true,
        greeting: `Hi! I'm the SmartGen assistant. Ask me about any of our ${SITE.toolCount} free tools.`,
        suggestions: [
          'What tools do you have?',
          'Is my data safe?',
          'Do you have an SEO audit tool?',
          'How do I compress an image?',
        ],
        toolCount: SITE.toolCount,
        categories: SITE.categories,
      },
      200,
      { 'Cache-Control': 'public, max-age=3600' }
    );
  }

  if (path === '/api/serp/suggest' && request.method === 'POST') {
    return handleSerpSuggest(request, env);
  }

  if (path === '/api/serp/rank' && request.method === 'POST') {
    return handleSerpRank(request, env);
  }

  if (path === '/api/reviews' && request.method === 'GET') {
    return handleReviewsList(url, env);
  }

  if (path === '/api/reviews' && request.method === 'POST') {
    return handleReviewsSubmit(request, env);
  }

  if (path === '/api/admin/init-sheet' && request.method === 'POST') {
    requireAdmin(request, env);
    return json({ ok: true, ...(await ensureHeaderRow(env)) });
  }

  return json({ ok: false, error: 'Not found', code: 'not_found' }, 404);
}

/* ------------------------------------------------------- free audit */

async function handleFreeAudit(request, env, ctx) {
  const body = await readJson(request);
  const targetUrl = String(body.url || '').trim();
  if (!targetUrl) return json({ ok: false, error: 'A website URL is required.' }, 400);

  // Sign-in is now required. The anonymous fingerprint quota it replaces was
  // resettable with a private window, so it never actually limited anything.
  const session = await verifySession(env, sessionTokenFrom(request, body));
  if (!session) {
    return json(
      {
        ok: false,
        code: 'auth_required',
        error: 'Create a free account or sign in to run an audit.',
        freeAudits: Number(env.FREE_AUDIT_LIMIT || 3),
      },
      401
    );
  }

  const domain = normalizeDomainKey(targetUrl);
  const ent = await resolveEntitlement(env, session, domain);

  // Burst protection still keys on the visitor, not the account: it exists to
  // protect our subrequest budget from a hot loop, which is a per-connection
  // problem. The owner is exempt so a demo is never throttled mid-call.
  if (ent.tier !== 'owner') {
    const burst = await burstLimit(env, await visitorKey(request), 4);
    if (!burst.ok) {
      return json(
        { ok: false, error: 'Too many scans in a row. Give it a minute and try again.', code: 'burst_limit' },
        429
      );
    }
  }

  // Premium and owner get the full 72-check report from this endpoint too --
  // there is no reason to make them call a different URL for what they have
  // already paid for.
  if (ent.unlimited) {
    return runUnlimitedAudit(request, env, ctx, { body, targetUrl, domain, session, ent });
  }

  const user = await findUser(env, session.email);
  const quota = freeQuotaFor(env, user);
  if (quota.exhausted) {
    return json(
      {
        ok: false,
        code: 'payment_required',
        error: `You have used all ${quota.limit} free audits on this account.`,
        quota,
        account: { email: session.email },
        upgrade: pricing(env).premium,
      },
      402
    );
  }

  const cached = await readCachedReport(env, domain, 'free');
  if (cached) {
    const after = await consumeAccountAudit(env, session.email);
    return json({
      ok: true,
      cached: true,
      quota: { ...quota, used: after.used, remaining: Math.max(0, quota.limit - after.used) },
      report: cached,
    });
  }

  const auditCtx = await buildAuditContext(targetUrl, { deep: false });
  const report = buildReport(auditCtx, 'free');
  report.locked = {
    hiddenChecks: 45,
    message:
      'Unlock all 72 checks, Core Web Vitals, an AI-written 30-day roadmap, competitor benchmarking and a white-label PDF.',
  };

  const after = await consumeAccountAudit(env, session.email);
  ctx.waitUntil(cacheReport(env, domain, 'free', report));

  return json({
    ok: true,
    cached: false,
    quota: { ...quota, used: after.used, remaining: Math.max(0, quota.limit - after.used) },
    report,
  });
}

/**
 * The full audit, for the owner and for anyone holding a premium grant.
 * Same body as handlePremiumAudit, minus the unlock-token check -- the
 * entitlement has already been resolved by the caller.
 */
async function runUnlimitedAudit(request, env, ctx, { body, targetUrl, domain, session, ent }) {
  const cached = await readCachedReport(env, domain, 'premium');
  if (cached) {
    return json({ ok: true, cached: true, quota: { unlimited: true }, report: cached });
  }

  const auditCtx = await buildAuditContext(targetUrl, { deep: true });
  const report = buildReport(auditCtx, 'premium');
  report.access = {
    mode: ent.tier,
    source: ent.source || null,
    account: session.email,
  };

  const wantPsi = env.ENABLE_PAGESPEED !== 'false';
  const wantAi = env.ENABLE_AI_ROADMAP !== 'false' && Boolean(env.GEMINI_API_KEY);
  const competitorUrl = String(body.competitorUrl || '').trim();

  const [psi, competitor] = await Promise.all([
    wantPsi
      ? fetchCoreWebVitals(
          report.site.url,
          env.PAGESPEED_API_KEY,
          body.strategy === 'desktop' ? 'desktop' : 'mobile'
        )
      : Promise.resolve({ available: false, error: 'Disabled by configuration.' }),
    competitorUrl
      ? buildLightContext(competitorUrl)
          .then((cctx) => buildComparison(report, cctx))
          .catch((err) => ({ error: err.userMessage || 'Competitor scan failed.' }))
      : Promise.resolve(null),
  ]);

  report.coreWebVitals = psi;
  report.competitor = competitor;

  if (wantAi) {
    report.roadmap = await generateRoadmap(
      {
        domain: report.site.domain,
        score: report.score.overall,
        issues: report.topIssues,
      },
      env.GEMINI_API_KEY
    ).catch(() => null);
  }

  ctx.waitUntil(cacheReport(env, domain, 'premium', report));
  return json({ ok: true, cached: false, quota: { unlimited: true }, report });
}

/* -------------------------------------------------------------------------- */
/* auth endpoints                                                             */
/* -------------------------------------------------------------------------- */

async function handleRegister(request, env) {
  if (!env.AUDIT_KV) return json({ ok: false, error: 'Accounts are not available right now.' }, 503);
  if (!env.SESSION_SECRET) {
    return json({ ok: false, error: 'Sign-in is not configured on the server yet.' }, 503);
  }

  const body = await readJson(request);
  const email = normaliseEmail(body.email);
  const password = String(body.password || '');

  if (!isValidEmail(email)) return json({ ok: false, error: 'Enter a valid email address.' }, 400);
  const pwProblem = passwordProblem(password);
  if (pwProblem) return json({ ok: false, error: pwProblem }, 400);

  // Registration is a write, so brake it harder than a read would be.
  const brake = await burstLimit(env, `reg:${await visitorKey(request)}`, 5);
  if (!brake.ok) {
    return json({ ok: false, error: 'Too many attempts. Try again in a minute.' }, 429);
  }

  const created = await createUser(env, email, password);
  if (!created.ok) {
    return json({ ok: false, error: 'An account with that email already exists. Sign in instead.' }, 409);
  }

  const token = await mintSession(env, { email, role: 'user' });
  return json({
    ok: true,
    account: { email, role: 'user' },
    sessionToken: token,
    quota: freeQuotaFor(env, created.user),
  });
}

async function handleLogin(request, env) {
  if (!env.SESSION_SECRET) {
    return json({ ok: false, error: 'Sign-in is not configured on the server yet.' }, 503);
  }

  const body = await readJson(request);
  const identifier = String(body.email || body.username || '').trim();
  const password = String(body.password || '');

  const brake = await burstLimit(env, `login:${await visitorKey(request)}`, 8);
  if (!brake.ok) {
    return json({ ok: false, error: 'Too many sign-in attempts. Try again in a minute.' }, 429);
  }

  // Owner first: the admin username is not required to be an email address.
  if (ownerConfigured(env) && isOwnerLogin(env, identifier, password)) {
    const token = await mintSession(env, { email: identifier.toLowerCase(), role: 'owner' });
    return json({
      ok: true,
      account: { email: identifier.toLowerCase(), role: 'owner' },
      sessionToken: token,
      quota: { unlimited: true },
    });
  }

  const email = normaliseEmail(identifier);
  const user = email ? await findUser(env, email) : null;

  // One message for "no such account" and "wrong password" so the endpoint
  // cannot be used to enumerate which addresses are registered.
  const ok = user ? await verifyPassword(password, user.password) : false;
  if (!ok) return json({ ok: false, error: 'Email or password is incorrect.' }, 401);

  const token = await mintSession(env, { email, role: 'user' });
  const ent = await resolveEntitlement(env, { email, role: 'user' }, '');
  return json({
    ok: true,
    account: { email, role: 'user' },
    sessionToken: token,
    entitlement: { tier: ent.tier, unlimited: ent.unlimited, source: ent.source || null },
    quota: ent.unlimited ? { unlimited: true } : freeQuotaFor(env, user),
  });
}

async function handleMe(request, env) {
  const session = await verifySession(env, sessionTokenFrom(request, null));
  if (!session) return json({ ok: false, signedIn: false }, 401);

  const ent = await resolveEntitlement(env, session, '');
  const user = session.role === 'owner' ? null : await findUser(env, session.email);
  return json({
    ok: true,
    signedIn: true,
    account: { email: session.email, role: session.role },
    entitlement: { tier: ent.tier, unlimited: ent.unlimited, source: ent.source || null },
    quota: ent.unlimited ? { unlimited: true } : freeQuotaFor(env, user),
  });
}

/* -------------------------------------------------------------------------- */
/* admin: premium grants (driven by the GitHub Action)                         */
/* -------------------------------------------------------------------------- */

/**
 * Guarded by ADMIN_TOKEN, which lives only in GitHub secrets and Cloudflare.
 * The owner's browser session is deliberately NOT accepted here: this endpoint
 * is for the workflow, and keeping it token-only means an XSS on the site
 * cannot mint premium grants.
 */
function adminAuthorised(request, env) {
  const supplied = (request.headers.get('x-admin-token') || '').trim();
  const expected = String(env.ADMIN_TOKEN || '');
  if (!expected || !supplied || supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function handlePremiumGrant(request, env) {
  if (!adminAuthorised(request, env)) {
    return json({ ok: false, error: 'Unauthorised.' }, 401);
  }
  if (!env.AUDIT_KV) return json({ ok: false, error: 'Grant storage is not configured.' }, 503);

  const body = await readJson(request);
  const action = String(body.action || 'grant').toLowerCase();
  const kind = String(body.kind || 'email').toLowerCase();
  const value = normaliseIdentifier(kind, body.identifier);

  if (!GRANT_KINDS.includes(kind)) {
    return json({ ok: false, error: `kind must be one of: ${GRANT_KINDS.join(', ')}` }, 400);
  }
  if (!value) return json({ ok: false, error: 'identifier is required.' }, 400);
  if (kind === 'email' && !isValidEmail(value)) {
    return json({ ok: false, error: `"${value}" is not a valid email address.` }, 400);
  }
  if (kind !== 'email' && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
    return json({ ok: false, error: `"${value}" is not a valid domain.` }, 400);
  }

  if (action === 'check') {
    const grant = await readGrant(env, kind, value);
    return json({ ok: true, action, kind, identifier: value, premium: Boolean(grant), grant: grant || null });
  }

  if (action === 'revoke') {
    const existed = await deleteGrant(env, kind, value);
    return json({ ok: true, action, kind, identifier: value, removed: existed });
  }

  if (action !== 'grant') {
    return json({ ok: false, error: 'action must be grant, revoke or check.' }, 400);
  }

  const days = Number(body.expiresDays || 0);
  const expiresAt = days > 0 ? new Date(Date.now() + days * 864e5).toISOString() : null;

  const grant = await putGrant(env, {
    kind,
    value,
    plan: body.plan,
    expiresAt,
    note: body.note,
    grantedBy: body.grantedBy || 'github-action',
  });
  return json({ ok: true, action, kind, identifier: value, grant });
}

async function handlePremiumList(request, env) {
  if (!adminAuthorised(request, env)) return json({ ok: false, error: 'Unauthorised.' }, 401);
  const grants = await listGrants(env);
  return json({ ok: true, count: grants.length, grants });
}

/* ---------------------------------------------------- premium audit */

async function handlePremiumAudit(request, env, ctx) {
  const body = await readJson(request);
  const targetUrl = String(body.url || '').trim();
  if (!targetUrl) return json({ ok: false, error: 'A website URL is required.' }, 400);

  // While PAYMENTS_ENABLED is false the premium endpoint runs in preview mode
  // for anyone with an unlock token; once payments go live, only tokens minted
  // after a successful checkout are accepted.
  const auth = await verifyPremiumAccess(request, env, body);
  if (!auth.allowed) {
    return json(
      {
        ok: false,
        code: 'payment_required',
        error: auth.reason,
        pricing: pricing(env),
      },
      402
    );
  }

  const auditCtx = await buildAuditContext(targetUrl, { deep: true });
  const report = buildReport(auditCtx, 'premium');
  report.access = { mode: auth.mode };

  // Enrichments run in parallel; none of them can fail the audit.
  const wantPsi = env.ENABLE_PAGESPEED !== 'false';
  const wantAi = env.ENABLE_AI_ROADMAP !== 'false' && Boolean(env.GEMINI_API_KEY);
  const competitorUrl = String(body.competitorUrl || '').trim();

  const [psi, competitor] = await Promise.all([
    wantPsi
      ? fetchCoreWebVitals(report.site.url, env.PAGESPEED_API_KEY, body.strategy === 'desktop' ? 'desktop' : 'mobile')
      : Promise.resolve({ available: false, error: 'Disabled by configuration.' }),
    competitorUrl
      ? buildLightContext(competitorUrl)
          .then((cctx) => buildComparison(report, cctx))
          .catch((err) => ({ error: err.userMessage || 'Competitor scan failed.' }))
      : Promise.resolve(null),
  ]);

  report.coreWebVitals = psi;
  report.competitor = competitor;

  if (wantAi) {
    const ai = await generateRoadmap(
      {
        domain: report.site.domain,
        score: report.score.overall,
        issues: report.topIssues,
        psi,
        competitor: competitor && !competitor.error ? competitor : null,
      },
      env
    );
    report.ai = ai.available ? ai : { ...ai, fallbackRoadmap: report.roadmap };
  } else {
    report.ai = { available: false, source: 'deterministic', fallbackRoadmap: report.roadmap };
  }

  if (body.whiteLabel && typeof body.whiteLabel === 'object') {
    report.whiteLabel = buildWhiteLabel(body.whiteLabel);
  }

  // Premium buyers are the most valuable leads — record them without blocking.
  if (body.lead && typeof body.lead === 'object') {
    ctx.waitUntil(storeLead(env, request, body.lead, report, 'premium_audit'));
  }

  return json({ ok: true, report });
}

/* ------------------------------------------------------------- chat */

async function handleChat(request, env) {
  const body = await readJson(request);
  const message = String(body.message || '').trim();

  if (!message) {
    return json({ ok: false, error: 'Ask me something about SmartGen Tools.' }, 400);
  }
  if (message.length > 600) {
    return json(
      { ok: false, error: 'That question is a bit long — try trimming it to a sentence or two.' },
      400
    );
  }

  // Cache-API counters: no KV writes, so a busy chatbot cannot exhaust the
  // free plan's daily write allowance.
  const key = await visitorKey(request);
  const perMinute = await cacheRateLimit(`chat-min:${key}`, 8, 60);
  if (!perMinute.ok) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: `You're going a bit fast — try again in ${perMinute.resetsInSeconds}s.`,
      },
      429
    );
  }

  const perHour = await cacheRateLimit(`chat-hour:${key}`, Number(env.CHAT_HOURLY_LIMIT || 40), 3600);
  if (!perHour.ok) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: `You've reached this hour's message limit. It resets in about ${Math.ceil(
          perHour.resetsInSeconds / 60
        )} minutes — meanwhile, every tool is at ${SITE.tools}.`,
      },
      429
    );
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter((t) => t && typeof t.content === 'string')
        .map((t) => ({ role: t.role === 'assistant' ? 'assistant' : 'user', content: t.content }))
    : [];

  const result = await answerQuestion({ message, history, page: body.page }, env);

  return json({
    ok: true,
    answer: result.answer,
    sources: result.sources,
    followUps: result.followUps,
    kind: result.kind,
    remaining: perHour.remaining,
  });
}

/* --------------------------------------------------------- serp tool */

async function handleSerpSuggest(request, env) {
  const body = await readJson(request);
  const topic = String(body.topic || '').trim();
  if (!topic) {
    return json({ ok: false, error: 'Describe what the page is about first.' }, 400);
  }

  const key = await visitorKey(request);
  const limit = await cacheRateLimit(`serp-suggest:${key}`, 12, 3600);
  if (!limit.ok) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: `You're going a bit fast — try again in ${Math.ceil(limit.resetsInSeconds / 60)} minute(s).`,
      },
      429
    );
  }

  const result = await suggestSerpCopy(
    {
      topic,
      url: body.url,
      existingTitle: body.existingTitle,
      existingDescription: body.existingDescription,
    },
    env
  );

  if (!result.available) {
    return json({ ok: false, error: result.reason }, 200);
  }

  return json({ ok: true, model: result.model, variants: result.variants });
}

async function handleSerpRank(request, env) {
  const body = await readJson(request);
  const domain = String(body.domain || body.url || '').trim();
  const keyword = String(body.keyword || '').trim();
  if (!domain) return json({ ok: false, error: 'Enter the page URL to check first.' }, 400);
  if (!keyword) return json({ ok: false, error: 'Enter a keyword to check ranking for.' }, 400);

  const key = await visitorKey(request);

  // Stricter than everything else: Custom Search's free tier is 100
  // queries/day for the whole project, so a single visitor must not be able
  // to spend a meaningful share of it alone.
  const perVisitorDay = await cacheRateLimit(`serp-rank:${key}`, 8, 24 * 60 * 60);
  if (!perVisitorDay.ok) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: "You've used today's ranking checks. This resets in about 24 hours.",
      },
      429
    );
  }

  const result = await checkRanking({ domain, keyword }, env);

  if (!result.available) {
    return json({ ok: false, error: result.reason, code: result.code }, 200);
  }

  return json({
    ok: true,
    keyword: result.keyword,
    domain: result.domain,
    position: result.position,
    inTop10: result.inTop10,
    checked: result.checked,
    topResults: result.topResults,
  });
}

/* -------------------------------------------------------- blog reviews */

async function handleReviewsList(url, env) {
  const slug = String(url.searchParams.get('slug') || '').trim();
  const result = await listReviews(env, slug);
  if (!result.ok) return json(result, 400);
  return json(result, 200, { 'Cache-Control': 'public, max-age=60' });
}

async function handleReviewsSubmit(request, env) {
  const body = await readJson(request);

  // Honeypot -- real visitors never fill a hidden field.
  if (String(body.company_website || '').trim()) {
    return json({ ok: true, stored: false, spam: true });
  }

  const key = await visitorKey(request);
  const limit = await cacheRateLimit(`review-submit:${key}`, 5, 24 * 60 * 60);
  if (!limit.ok) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        error: "You've submitted a few reviews already today. Try again tomorrow.",
      },
      429
    );
  }

  const result = await submitReview(env, {
    slug: body.slug,
    name: body.name,
    rating: body.rating,
    comment: body.comment,
  });

  if (!result.ok) return json(result, result.skipped ? 200 : 400);
  return json(result, 200);
}

/* ------------------------------------------------------------- lead */

async function handleLead(request, env, ctx) {
  const body = await readJson(request);
  const lead = body.lead || body;

  const email = String(lead.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'A valid email address is required.' }, 400);
  }

  // A blog newsletter signup is email-only by design -- asking for a name
  // there is exactly the extra friction that kills subscribe-rate. Every
  // other lead type (audit reports, contact forms) still requires one.
  const isNewsletter = lead.leadType === 'newsletter_subscribe';
  if (!isNewsletter && !String(lead.fullName || '').trim()) {
    return json({ ok: false, error: 'Your name is required.' }, 400);
  }
  if (isNewsletter && !String(lead.fullName || '').trim()) {
    lead.fullName = 'Newsletter Subscriber';
  }

  // Honeypot — real visitors never fill a hidden field.
  if (String(lead.company_website || '').trim()) {
    return json({ ok: true, stored: false, spam: true });
  }

  // Arithmetic captcha, verified server-side so it cannot be bypassed.
  if (body.captcha && !verifyCaptcha(body.captcha)) {
    return json({ ok: false, error: 'The security question was answered incorrectly.' }, 400);
  }

  const result = await storeLead(env, request, lead, body.report || null, lead.leadType || 'free_audit');

  if (!result.ok && !result.skipped) {
    console.error('lead capture failed:', result.error);
  }

  // The visitor should never see a spreadsheet outage — the audit already
  // succeeded, and failures are visible in `wrangler tail`.
  return json({
    ok: true,
    stored: result.ok,
    ...(result.skipped ? { note: 'Lead storage is not configured yet.' } : {}),
  });
}

async function storeLead(env, request, lead, report, leadType) {
  const cwv = report?.coreWebVitals;
  return appendLead(env, {
    timestamp: new Date().toISOString(),
    leadType,
    fullName: lead.fullName,
    email: lead.email,
    websiteUrl: lead.websiteUrl || report?.site?.url || '',
    competitorUrl: lead.competitorUrl || report?.competitor?.url || '',
    country: lead.country,
    whatsapp: lead.whatsapp,
    preferredContact: lead.preferredContact,
    score: report?.score?.overall,
    grade: report?.score?.grade,
    issueCount: report?.impact?.issueCount,
    passed: report?.score?.passed,
    failed: report?.score?.failed,
    performanceScore: cwv?.scores?.performance,
    lcp: cwv?.metrics?.LCP?.display || '',
    cls: cwv?.metrics?.CLS?.display || '',
    topIssue: report?.topIssues?.[0]?.label || '',
    source: lead.source || 'seo-audit-tool',
    referrer: lead.referrer || request.headers.get('referer') || '',
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    cfCountry: request.headers.get('cf-ipcountry') || '',
    userAgent: request.headers.get('user-agent') || '',
  });
}

/* -------------------------------------------------------- helpers */

function pricing(env) {
  return {
    free: {
      name: 'Free SEO Audit',
      price: 0,
      currency: 'USD',
      checks: 27,
      auditsPerDay: Number(env.FREE_AUDIT_LIMIT || 3),
      features: [
        '27 instant checks across 9 categories',
        'Overall health score and grade',
        'Top 5 priority fixes',
        'Emailed copy of your report',
      ],
    },
    premium: {
      name: 'Premium SEO Audit',
      price: Number(env.PREMIUM_PRICE_USD || 99),
      currency: 'USD',
      checks: 72,
      enabled: env.PAYMENTS_ENABLED === 'true',
      features: [
        'All 72 checks including the 9 About-page checks',
        'Google Core Web Vitals (LCP, INP, CLS) from real user data',
        'AI-written 30-day action roadmap',
        'Competitor side-by-side benchmark',
        'Traffic impact prediction',
        'White-label PDF report for agencies',
        '30-minute strategy call',
      ],
    },
    comparison: categoryCounts(),
  };
}

/**
 * Premium access control.
 *
 * PAYMENTS_ENABLED=false  → preview mode: an unlock token is still required,
 *                           so the endpoint is not open to the whole internet,
 *                           but no payment is checked.
 * PAYMENTS_ENABLED=true   → the token must be a valid HMAC signed by the
 *                           checkout webhook after a completed payment.
 */
async function verifyPremiumAccess(request, env, body) {
  const token =
    (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim() ||
    String(body.unlockToken || '').trim();

  if (!token) {
    return {
      allowed: false,
      reason:
        env.PAYMENTS_ENABLED === 'true'
          ? 'This is a paid audit. Complete checkout to receive an unlock token.'
          : 'Premium is in preview. An unlock token is required — contact SmartGen for access.',
    };
  }

  const secret = env.PREMIUM_UNLOCK_SECRET;
  if (!secret) {
    return { allowed: false, reason: 'Premium access is not configured on the server yet.' };
  }

  const valid = await verifyUnlockToken(token, secret);
  if (!valid.ok) return { allowed: false, reason: valid.reason };

  return { allowed: true, mode: env.PAYMENTS_ENABLED === 'true' ? 'paid' : 'preview' };
}

/**
 * Unlock token format: base64url(payloadJson).base64url(hmacSha256)
 * Payload: { order, exp, domain? }
 */
async function verifyUnlockToken(token, secret) {
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return { ok: false, reason: 'Malformed unlock token.' };

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  let signature;
  try {
    signature = base64urlToBytes(signaturePart);
  } catch {
    return { ok: false, reason: 'Malformed unlock token.' };
  }

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    new TextEncoder().encode(payloadPart)
  );
  if (!valid) return { ok: false, reason: 'This unlock token is not valid.' };

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadPart)));
  } catch {
    return { ok: false, reason: 'Malformed unlock token payload.' };
  }

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return { ok: false, reason: 'This unlock token has expired.' };
  }

  return { ok: true, payload };
}

function base64urlToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** The frontend sends { a, b, answer }; we re-check the arithmetic here. */
function verifyCaptcha(captcha) {
  const a = Number(captcha.a);
  const b = Number(captcha.b);
  const answer = Number(captcha.answer);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(answer)) return false;
  return a + b === answer;
}

function requireAdmin(request, env) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    const err = new Error('Unauthorized');
    err.status = 401;
    err.userMessage = 'Unauthorized.';
    throw err;
  }
}

function normalizeDomainKey(input) {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return String(input).toLowerCase().slice(0, 100);
  }
}

async function readJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    const err = new Error('Expected application/json');
    err.status = 415;
    err.userMessage = 'Requests must be sent as JSON.';
    throw err;
  }
  try {
    return await request.json();
  } catch {
    const err = new Error('Invalid JSON');
    err.status = 400;
    err.userMessage = 'The request body was not valid JSON.';
    throw err;
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  else if (allowed.length === 0) headers['Access-Control-Allow-Origin'] = '*';

  return headers;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}
