/**
 * SmartGen Platforms — Cloudflare Worker API
 * Backend for the SmartGen SEO Audit Tool (https://smartgentools.com/seo-audit-tool/)
 *
 * Design notes
 * ------------
 * • Scanning only. Email delivery is handled by the separate SmartGen mailer,
 *   which reads the leads spreadsheet — so a slow inbox can never stall or
 *   crash an audit.
 * • Stateless and login-free. Free usage is metered per anonymous visitor
 *   fingerprint in KV.
 * • Every premium enrichment (PageSpeed, Gemini, Sheets) degrades gracefully:
 *   if one is unavailable the report still ships, with a note.
 *
 * Routes
 *   GET  /                        service banner
 *   GET  /api/health              uptime + which integrations are configured
 *   GET  /api/checks              public catalogue of all 72 checks
 *   GET  /api/pricing             tier comparison table (server is the source of truth)
 *   GET  /api/quota               how many free audits this visitor has left
 *   POST /api/audit               free audit — 27 checks, instant
 *   POST /api/audit/premium       full audit — 72 checks + CWV + AI + competitor
 *   POST /api/lead                store a lead in Google Sheets
 *   POST /api/admin/init-sheet    one-time header row (requires ADMIN_TOKEN)
 */

import { buildAuditContext, buildLightContext } from './lib/crawl.js';
import { buildReport, buildComparison, buildWhiteLabel } from './lib/report.js';
import { checkCatalogue, categoryCounts } from './checks/registry.js';
import { fetchCoreWebVitals } from './lib/pagespeed.js';
import { generateRoadmap } from './lib/gemini.js';
import { appendLead, ensureHeaderRow } from './lib/sheets.js';
import {
  visitorKey,
  getQuota,
  consumeQuota,
  burstLimit,
  cacheReport,
  readCachedReport,
} from './lib/quota.js';

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
        'POST /api/audit',
        'POST /api/audit/premium',
        'POST /api/lead',
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
        paymentsEnabled: env.PAYMENTS_ENABLED === 'true',
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
    const key = await visitorKey(request);
    return json({ ok: true, quota: await getQuota(env, key) });
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

  const key = await visitorKey(request);

  const burst = await burstLimit(env, key, 4);
  if (!burst.ok) {
    return json(
      { ok: false, error: 'Too many scans in a row. Give it a minute and try again.', code: 'burst_limit' },
      429
    );
  }

  const quota = await getQuota(env, key);
  if (quota.exhausted) {
    return json(
      {
        ok: false,
        code: 'quota_exhausted',
        error: `You have used all ${quota.limit} free audits for today.`,
        quota,
        upgrade: pricing(env).premium,
      },
      429
    );
  }

  const domain = normalizeDomainKey(targetUrl);
  const cached = await readCachedReport(env, domain, 'free');
  if (cached) {
    const after = await consumeQuota(env, key);
    return json({ ok: true, cached: true, quota: after, report: cached });
  }

  const auditCtx = await buildAuditContext(targetUrl, { deep: false });
  const report = buildReport(auditCtx, 'free');
  report.locked = {
    hiddenChecks: 45,
    message:
      'Unlock all 72 checks, Core Web Vitals, an AI-written 30-day roadmap, competitor benchmarking and a white-label PDF.',
  };

  const after = await consumeQuota(env, key);
  ctx.waitUntil(cacheReport(env, domain, 'free', report));

  return json({ ok: true, cached: false, quota: after, report });
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
      env.GEMINI_API_KEY
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

/* ------------------------------------------------------------- lead */

async function handleLead(request, env, ctx) {
  const body = await readJson(request);
  const lead = body.lead || body;

  const email = String(lead.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'A valid email address is required.' }, 400);
  }
  if (!String(lead.fullName || '').trim()) {
    return json({ ok: false, error: 'Your name is required.' }, 400);
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
