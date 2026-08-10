/**
 * Builds the "audit context" — every piece of evidence the 72 checks read
 * from. Everything is fetched here, once, so no check performs its own I/O.
 *
 * Subrequest budget matters: Cloudflare's free plan allows 50 subrequests per
 * invocation. The free tier costs ~8, premium ~16, and a premium run with a
 * competitor ~24. Comfortably inside the limit.
 */

import { safeFetch, probe, normalizeTargetUrl } from './http.js';
import { parseDocument, visibleText } from './parse.js';

/** Homepages larger than this are truncated before parsing to protect CPU time. */
const PARSE_BYTE_CAP = 400_000;

const ABOUT_PATTERNS = [
  /\/about(-us)?\/?$/i,
  /\/about\.(html?|php|aspx)$/i,
  /\/who-we-are\/?$/i,
  /\/our-story\/?$/i,
  /\/company\/?$/i,
];

const DEFAULT_WP_PATHS = ['/hello-world/', '/sample-page/', '/category/uncategorized/'];

/**
 * @param {string} rawUrl        website to audit
 * @param {{deep?:boolean}} opts deep=true adds the premium-only probes
 */
export async function buildAuditContext(rawUrl, opts = {}) {
  const deep = Boolean(opts.deep);
  const target = normalizeTargetUrl(rawUrl);

  const home = await safeFetch(target);
  if (!home.body && !home.ok) {
    const err = new Error(home.error || 'The website could not be reached.');
    err.userMessage = `We could not reach ${target.hostname}. ${home.error || ''}`.trim();
    err.status = 422;
    throw err;
  }

  const finalUrl = new URL(home.finalUrl);
  const origin = finalUrl.origin;
  const html = home.body.length > PARSE_BYTE_CAP ? home.body.slice(0, PARSE_BYTE_CAP) : home.body;
  const doc = parseDocument(html, home.finalUrl);
  markFooterLinks(doc);

  // ---- always-on probes (free tier included) ----------------------------
  const [robots, indexPhp, defaults] = await Promise.all([
    safeFetch(`${origin}/robots.txt`, { accept: 'text/plain,*/*' }),
    probe(`${origin}/index.php`),
    Promise.all(DEFAULT_WP_PATHS.map((p) => probe(origin + p))),
  ]);

  const robotsText = robots.ok && /text\/plain|text\//i.test(robots.contentType) ? robots.body : '';
  const robotsSitemaps = [...robotsText.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim());

  const sitemapCandidates = dedupe([
    ...robotsSitemaps,
    ...doc.links.filter((l) => l.href && /sitemap.*\.xml$/i.test(l.href)).map((l) => l.href),
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ]).slice(0, 2);

  const sitemapProbes = await Promise.all(
    sitemapCandidates.map(async (url) => {
      const res = await probe(url);
      return { url, status: res.status, ok: res.ok, fromRobots: robotsSitemaps.includes(url) };
    })
  );

  const ctx = {
    input: rawUrl,
    target: target.href,
    origin,
    hostname: finalUrl.hostname,
    rootDomain: finalUrl.hostname.replace(/^www\./, ''),
    finalUrl: home.finalUrl,
    status: home.status,
    isHttps: finalUrl.protocol === 'https:',
    redirects: home.redirects,
    headers: headerSnapshot(home.headers),
    responseMs: home.timingMs,
    htmlBytes: home.body.length,
    truncated: home.body.length > PARSE_BYTE_CAP,
    doc,
    robots: {
      status: robots.status,
      ok: robots.ok,
      text: robotsText,
      sitemaps: robotsSitemaps,
    },
    sitemaps: sitemapProbes,
    indexPhp: { status: indexPhp.status, redirects: indexPhp.redirects, finalUrl: indexPhp.finalUrl },
    defaultContent: {
      helloWorld: defaults[0].status,
      samplePage: defaults[1].status,
      uncategorized: defaults[2].status,
    },
    // Filled in below only when deep === true.
    variants: null,
    trailingSlash: null,
    about: null,
    deep,
    scannedAt: new Date().toISOString(),
  };

  if (!deep) return ctx;

  // ---- premium-only probes ---------------------------------------------
  const bare = ctx.rootDomain;
  const [variantResults, slashResult, aboutResult] = await Promise.all([
    Promise.all(
      [`https://${bare}/`, `https://www.${bare}/`, `http://${bare}/`].map(async (url) => {
        const res = await probe(url);
        return {
          url,
          status: res.status,
          finalUrl: res.finalUrl,
          redirected: res.redirects.length > 0,
        };
      })
    ),
    checkTrailingSlash(ctx),
    fetchAboutPage(ctx),
  ]);

  const canonical200 = variantResults.filter((v) => v.status === 200 && !v.redirected);
  ctx.variants = { probes: variantResults, distinct200: canonical200.length };
  ctx.trailingSlash = slashResult;
  ctx.about = aboutResult;

  return ctx;
}

/**
 * A cheap context used only for competitor benchmarking — homepage + robots,
 * no variant probing. Keeps a side-by-side comparison affordable.
 */
export async function buildLightContext(rawUrl) {
  const target = normalizeTargetUrl(rawUrl);
  const home = await safeFetch(target);
  if (!home.body && !home.ok) {
    const err = new Error('unreachable');
    err.userMessage = `We could not reach ${target.hostname}.`;
    err.status = 422;
    throw err;
  }

  const finalUrl = new URL(home.finalUrl);
  const html = home.body.slice(0, PARSE_BYTE_CAP);
  const doc = parseDocument(html, home.finalUrl);
  markFooterLinks(doc);

  const robots = await safeFetch(`${finalUrl.origin}/robots.txt`, { accept: 'text/plain,*/*' });
  const robotsText = robots.ok ? robots.body : '';

  return {
    input: rawUrl,
    target: target.href,
    origin: finalUrl.origin,
    hostname: finalUrl.hostname,
    rootDomain: finalUrl.hostname.replace(/^www\./, ''),
    finalUrl: home.finalUrl,
    status: home.status,
    isHttps: finalUrl.protocol === 'https:',
    redirects: home.redirects,
    headers: headerSnapshot(home.headers),
    responseMs: home.timingMs,
    htmlBytes: home.body.length,
    truncated: false,
    doc,
    robots: {
      status: robots.status,
      ok: robots.ok,
      text: robotsText,
      sitemaps: [...robotsText.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1].trim()),
    },
    sitemaps: [],
    indexPhp: { status: 0, redirects: [], finalUrl: '' },
    defaultContent: { helloWorld: 0, samplePage: 0, uncategorized: 0 },
    variants: null,
    trailingSlash: null,
    about: null,
    deep: false,
    light: true,
    scannedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------ internals */

function headerSnapshot(headers) {
  const out = {};
  if (!headers) return out;
  for (const key of [
    'content-type',
    'server',
    'x-powered-by',
    'strict-transport-security',
    'x-frame-options',
    'content-security-policy',
    'x-robots-tag',
    'cache-control',
  ]) {
    const value = headers.get(key);
    if (value) out[key] = value;
  }
  return out;
}

/** Tag anchors that live inside the footer so footer checks can filter. */
function markFooterLinks(doc) {
  if (!doc.footer) return;
  const footerHrefs = new Set(
    [...doc.footer.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1].trim())
  );
  for (const link of doc.links) {
    if (link.raw && footerHrefs.has(link.raw)) link.inFooter = true;
  }
}

/**
 * Take one real internal URL and see whether the with/without-slash pair
 * resolves consistently. A site that serves 200 on both is duplicating pages.
 */
async function checkTrailingSlash(ctx) {
  const candidate = ctx.doc.links.find((l) => {
    if (!l.href || l.external) return false;
    try {
      const u = new URL(l.href);
      return (
        u.origin === ctx.origin &&
        u.pathname !== '/' &&
        u.pathname.length > 1 &&
        !/\.[a-z0-9]{2,5}$/i.test(u.pathname)
      );
    } catch {
      return false;
    }
  });

  if (!candidate) return { tested: false, reason: 'No suitable internal URL found' };

  const url = new URL(candidate.href);
  url.search = '';
  const withSlash = url.pathname.endsWith('/') ? url.href : `${url.href}/`;
  const withoutSlash = url.pathname.endsWith('/') ? url.href.replace(/\/$/, '') : url.href;

  const [a, b] = await Promise.all([probe(withSlash), probe(withoutSlash)]);
  const bothPlain200 = a.status === 200 && !a.redirects.length && b.status === 200 && !b.redirects.length;

  return {
    tested: true,
    sample: url.href,
    withSlash: { status: a.status, redirected: a.redirects.length > 0, finalUrl: a.finalUrl },
    withoutSlash: { status: b.status, redirected: b.redirects.length > 0, finalUrl: b.finalUrl },
    consistent: !bothPlain200,
  };
}

/** Find and fetch the About page so the 9 About-Us checks have something to read. */
async function fetchAboutPage(ctx) {
  const link = ctx.doc.links.find((l) => {
    if (!l.href || l.external) return false;
    let path;
    try {
      path = new URL(l.href).pathname;
    } catch {
      return false;
    }
    if (ABOUT_PATTERNS.some((re) => re.test(path))) return true;
    return /^(about|about us|about me|our story|who we are)$/i.test(l.text.trim());
  });

  const url = link?.href || `${ctx.origin}/about/`;
  const res = await safeFetch(url);
  if (!res.ok || !res.body) {
    return { found: false, url, status: res.status, doc: null, text: '' };
  }

  const doc = parseDocument(res.body.slice(0, PARSE_BYTE_CAP), res.finalUrl);
  return {
    found: true,
    url: res.finalUrl,
    status: res.status,
    doc,
    text: visibleText(doc.body),
  };
}

function dedupe(list) {
  return [...new Set(list.filter(Boolean))];
}
