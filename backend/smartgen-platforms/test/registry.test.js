import test from 'node:test';
import assert from 'node:assert/strict';

import { CHECKS, CATEGORIES, categoryCounts, checkCatalogue } from '../src/checks/registry.js';
import { runChecks, scoreResults, predictImpact, buildRoadmap } from '../src/checks/runner.js';
import { parseDocument } from '../src/lib/parse.js';
import { normalizeTargetUrl } from '../src/lib/http.js';

/** The published pricing table — the registry must always match it exactly. */
const ADVERTISED = {
  authority: { free: 4, total: 10 },
  schema: { free: 1, total: 4 },
  'eeat-pages': { free: 4, total: 7 },
  footer: { free: 4, total: 10 },
  social: { free: 2, total: 8 },
  ux: { free: 3, total: 5 },
  about: { free: 0, total: 9 },
  homepage: { free: 4, total: 5 },
  onsite: { free: 5, total: 14 },
};

test('registry ships exactly 72 checks, 27 of them free', () => {
  assert.equal(CHECKS.length, 72);
  assert.equal(CHECKS.filter((c) => c.tier === 'free').length, 27);
  assert.equal(CHECKS.filter((c) => c.tier === 'premium').length, 45);
});

test('per-category counts match the advertised pricing table', () => {
  for (const cat of categoryCounts()) {
    assert.deepEqual(
      { free: cat.free, total: cat.total },
      ADVERTISED[cat.id],
      `category ${cat.id} drifted from the pricing table`
    );
  }
});

test('every check is well formed', () => {
  const ids = new Set();
  const categoryIds = new Set(CATEGORIES.map((c) => c.id));
  for (const check of CHECKS) {
    assert.ok(check.id, 'check needs an id');
    assert.ok(!ids.has(check.id), `duplicate check id: ${check.id}`);
    ids.add(check.id);
    assert.ok(categoryIds.has(check.category), `${check.id} has unknown category ${check.category}`);
    assert.ok(['free', 'premium'].includes(check.tier), `${check.id} has a bad tier`);
    assert.ok(
      ['critical', 'high', 'medium', 'low'].includes(check.impact),
      `${check.id} has a bad impact`
    );
    assert.ok(check.label && check.description && check.fix, `${check.id} is missing copy`);
    assert.equal(typeof check.run, 'function');
  }
});

test('the public catalogue leaks no evaluator functions', () => {
  for (const item of checkCatalogue()) {
    assert.equal(item.run, undefined);
    assert.equal(item.fix, undefined);
  }
});

/* ------------------------------------------------------------------ */

const GOOD_HTML = `<!doctype html><html><head>
<title>Acme Analytics — Real-Time Dashboards for Growth Teams</title>
<meta name="description" content="Acme builds analytics dashboards.">
<link rel="canonical" href="https://acme.com/">
<link rel="icon" href="/favicon.ico">
<meta property="og:title" content="Acme"><meta property="og:description" content="d"><meta property="og:image" content="https://acme.com/og.png">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Acme"},{"@type":"WebSite","url":"https://acme.com"}]}</script>
</head><body>
<header><a href="/"><img src="/logo.svg" alt="Acme logo"></a>
<nav><a href="/about/">About</a><a href="/contact/">Contact</a></nav>
<form role="search"><input type="search" name="s"></form></header>
<main><h1>Real-time analytics for growth teams</h1>
<p>${'Acme helps growth teams understand their funnel with live dashboards. '.repeat(34)}</p>
<img src="/hero.png" alt="Dashboard screenshot">
<a href="https://partner.example.com/">Our partner</a>
</main>
<footer><p>© ${new Date().getUTCFullYear()} Acme Analytics Ltd. Acme builds real-time analytics dashboards for modern growth teams worldwide.</p>
<p>1200 Market Street, Suite 400, San Francisco, CA 94103 · <a href="mailto:hi@acme.com">hi@acme.com</a> · <a href="tel:+14155550142">+1 415-555-0142</a></p>
<a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/about/">About</a>
<a href="https://twitter.com/acme">Twitter</a><a href="https://facebook.com/acme">Facebook</a>
</footer></body></html>`;

const BAD_HTML = `<html><head><title>Home</title><meta name="robots" content="noindex"></head>
<body><h2>Section</h2><h1>Hi</h1><a href="#">Menu</a><a href="#">Toggle</a><a href="#">More</a><a href="#">X</a>
<img src=""><p>Short.</p></body></html>`;

function contextFrom(html, overrides = {}) {
  const doc = parseDocument(html, 'https://acme.com/');
  return {
    input: 'acme.com',
    target: 'https://acme.com/',
    origin: 'https://acme.com',
    hostname: 'acme.com',
    rootDomain: 'acme.com',
    finalUrl: 'https://acme.com/',
    status: 200,
    isHttps: true,
    redirects: [],
    headers: {},
    responseMs: 120,
    htmlBytes: html.length,
    truncated: false,
    doc,
    robots: { status: 200, ok: true, text: 'Sitemap: https://acme.com/sitemap.xml', sitemaps: ['https://acme.com/sitemap.xml'] },
    sitemaps: [{ url: 'https://acme.com/sitemap.xml', status: 200, ok: true, fromRobots: true }],
    indexPhp: { status: 404, redirects: [], finalUrl: '' },
    defaultContent: { helloWorld: 404, samplePage: 404, uncategorized: 404 },
    variants: null,
    trailingSlash: null,
    about: null,
    deep: false,
    scannedAt: new Date().toISOString(),
    ...overrides,
  };
}

test('a well-built page scores far higher than a broken one', () => {
  const good = scoreResults(runChecks(contextFrom(GOOD_HTML), 'free'));
  const bad = scoreResults(
    runChecks(
      contextFrom(BAD_HTML, {
        isHttps: false,
        robots: { status: 404, ok: false, text: '', sitemaps: [] },
        sitemaps: [{ url: 'https://acme.com/sitemap.xml', status: 404, ok: false, fromRobots: false }],
        indexPhp: { status: 200, redirects: [], finalUrl: 'https://acme.com/index.php' },
        defaultContent: { helloWorld: 200, samplePage: 200, uncategorized: 200 },
      }),
      'free'
    )
  );

  assert.ok(good.overall > 70, `expected a high score for the good page, got ${good.overall}`);
  assert.ok(bad.overall < 35, `expected a low score for the broken page, got ${bad.overall}`);
  assert.equal(good.total, 27);
});

test('specific free checks fire correctly on the good page', () => {
  const results = runChecks(contextFrom(GOOD_HTML), 'free');
  const status = (id) => results.find((r) => r.id === id)?.status;

  assert.equal(status('ssl-certificate'), 'pass');
  assert.equal(status('has-favicon'), 'pass');
  assert.equal(status('has-logo'), 'pass');
  assert.equal(status('schema-organization'), 'pass');
  assert.equal(status('page-privacy-policy'), 'pass');
  assert.equal(status('page-contact'), 'pass');
  assert.equal(status('footer-copyright'), 'pass');
  assert.equal(status('footer-copyright-year'), 'pass');
  assert.equal(status('footer-contact-email'), 'pass');
  assert.equal(status('footer-social-links'), 'pass');
  assert.equal(status('ux-search'), 'pass');
  assert.equal(status('ux-image-alt'), 'pass');
  assert.equal(status('home-not-noindexed'), 'pass');
  assert.equal(status('home-title-not-generic'), 'pass');
  assert.equal(status('home-content-visible'), 'pass');
  assert.equal(status('onsite-no-heading-before-h1'), 'pass');
  assert.equal(status('onsite-robots-sitemap-reachable'), 'pass');
});

test('specific free checks fail correctly on the broken page', () => {
  const results = runChecks(
    contextFrom(BAD_HTML, {
      isHttps: false,
      defaultContent: { helloWorld: 200, samplePage: 404, uncategorized: 200 },
    }),
    'free'
  );
  const status = (id) => results.find((r) => r.id === id)?.status;

  assert.equal(status('ssl-certificate'), 'fail');
  assert.equal(status('home-not-noindexed'), 'fail');
  assert.equal(status('home-title-not-generic'), 'fail');
  assert.equal(status('home-content-visible'), 'fail');
  assert.equal(status('onsite-no-heading-before-h1'), 'fail');
  assert.equal(status('onsite-no-empty-hash-links'), 'fail');
  assert.equal(status('onsite-default-content'), 'fail');
  assert.equal(status('onsite-uncategorized'), 'fail');
});

test('premium tier runs all 72 checks and skips About checks without a deep scan', () => {
  const results = runChecks(contextFrom(GOOD_HTML), 'premium');
  assert.equal(results.length, 72);
  const aboutResults = results.filter((r) => r.category === 'about');
  assert.equal(aboutResults.length, 9);
  assert.ok(aboutResults.every((r) => r.status === 'skip'));
});

test('skipped checks do not drag the score down', () => {
  const withImages = scoreResults(runChecks(contextFrom(GOOD_HTML), 'free'));
  const noImages = scoreResults(
    runChecks(contextFrom(GOOD_HTML.replace(/<img[^>]*>/g, '')), 'free')
  );
  const uxNoImages = noImages.categories.find((c) => c.id === 'ux');
  assert.equal(uxNoImages.skipped, 2);
  assert.ok(withImages.overall > 0 && noImages.overall > 0);
});

test('impact prediction is bounded and grows with issue count', () => {
  const few = predictImpact(
    [{ status: 'fail', impact: 'low' }],
    90
  );
  const many = predictImpact(
    Array.from({ length: 30 }, () => ({ status: 'fail', impact: 'critical' })),
    30
  );
  assert.ok(few.estimatedUpliftHigh < many.estimatedUpliftHigh);
  assert.ok(many.estimatedUpliftHigh <= 125);
  assert.ok(many.projectedScore <= 100);
});

test('the deterministic roadmap assigns each issue to exactly one week', () => {
  const results = runChecks(contextFrom(BAD_HTML, { isHttps: false }), 'premium');
  const roadmap = buildRoadmap(results);
  assert.ok(roadmap.length > 0);
  const ids = roadmap.flatMap((w) => w.tasks.map((t) => t.id));
  assert.equal(ids.length, new Set(ids).size, 'a task was scheduled in two different weeks');
});

/* ------------------------------------------------------- SSRF guard */

test('normalizeTargetUrl rejects private and malformed targets', () => {
  const blocked = [
    'http://localhost/',
    'http://127.0.0.1/',
    'http://10.0.0.5/',
    'http://192.168.1.1/',
    'http://172.16.4.1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://metadata.google.internal/',
    'file:///etc/passwd',
    'https://user:pass@example.com/',
    'notaurl',
  ];
  for (const url of blocked) {
    assert.throws(() => normalizeTargetUrl(url), new RegExp('.'), `should have rejected ${url}`);
  }
});

test('normalizeTargetUrl accepts and normalises real domains', () => {
  assert.equal(normalizeTargetUrl('example.com').href, 'https://example.com/');
  assert.equal(normalizeTargetUrl('  HTTPS://Example.com/path#frag ').href, 'https://example.com/path');
  assert.equal(normalizeTargetUrl('http://sub.example.co.uk/x').href, 'http://sub.example.co.uk/x');
});
