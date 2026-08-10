/**
 * Assembles a finished audit report from the raw context, and produces the
 * competitor side-by-side comparison.
 */

import { runChecks, scoreResults, prioritise, predictImpact, buildRoadmap } from '../checks/runner.js';
import { categoryCounts } from '../checks/registry.js';

/**
 * @param {object} ctx   audit context from lib/crawl.js
 * @param {'free'|'premium'} tier
 */
export function buildReport(ctx, tier) {
  const results = runChecks(ctx, tier);
  const score = scoreResults(results);
  const topIssues = prioritise(results, tier === 'premium' ? 15 : 5);
  const impact = predictImpact(results, score.overall);

  return {
    tier,
    site: {
      input: ctx.input,
      url: ctx.finalUrl,
      domain: ctx.rootDomain,
      hostname: ctx.hostname,
      https: ctx.isHttps,
      status: ctx.status,
      redirectHops: ctx.redirects.length,
      responseMs: ctx.responseMs,
      htmlBytes: ctx.htmlBytes,
      title: ctx.doc.title,
      metaDescription: metaDesc(ctx),
      wordCount: ctx.doc.wordCount,
      generator: detectPlatform(ctx),
    },
    score,
    results,
    topIssues,
    impact,
    roadmap: buildRoadmap(results),
    coverage: {
      checksRun: results.length,
      freeChecks: 27,
      premiumChecks: 72,
      categories: categoryCounts(),
    },
    scannedAt: ctx.scannedAt,
    // Premium-only sections; filled in by the route handler.
    coreWebVitals: null,
    ai: null,
    competitor: null,
    whiteLabel: null,
  };
}

function metaDesc(ctx) {
  const hit = ctx.doc.metas.find((m) => m.name === 'description');
  return hit ? hit.content : '';
}

/** Best-effort CMS detection — shapes how the roadmap advice is phrased. */
function detectPlatform(ctx) {
  const generator = ctx.doc.metas.find((m) => m.name === 'generator')?.content || '';
  const html = ctx.doc.html;
  const signals = [
    { name: 'WordPress', re: /wp-content|wp-includes|wordpress/i },
    { name: 'Shopify', re: /cdn\.shopify\.com|shopify\.theme/i },
    { name: 'Wix', re: /wix\.com|wixstatic/i },
    { name: 'Squarespace', re: /squarespace/i },
    { name: 'Webflow', re: /webflow/i },
    { name: 'Next.js', re: /__NEXT_DATA__|\/_next\//i },
    { name: 'Ghost', re: /ghost\.io|content\/themes\/casper/i },
    { name: 'Drupal', re: /drupal/i },
    { name: 'Joomla', re: /joomla/i },
    { name: 'Blogger', re: /blogspot|blogger\.com/i },
  ];
  const detected = signals.find((s) => s.re.test(generator) || s.re.test(html));
  return detected ? detected.name : generator || 'Unknown';
}

/**
 * Side-by-side benchmark. Both sides are scored with the free check set so the
 * comparison is apples-to-apples even though the competitor gets a light scan.
 */
export function buildComparison(clientReport, competitorCtx) {
  const competitorResults = runChecks(competitorCtx, 'free');
  const competitorScore = scoreResults(competitorResults);

  // Compare only on checks both sides actually ran.
  const clientFree = new Map(
    clientReport.results.filter((r) => r.tier === 'free').map((r) => [r.id, r])
  );

  const competitorWins = [];
  const clientWins = [];
  const bothFail = [];

  for (const compResult of competitorResults) {
    const mine = clientFree.get(compResult.id);
    if (!mine) continue;
    const myOk = mine.status === 'pass';
    const theirOk = compResult.status === 'pass';
    if (!myOk && theirOk) competitorWins.push(mine.label);
    else if (myOk && !theirOk) clientWins.push(mine.label);
    else if (!myOk && !theirOk && mine.status !== 'skip') bothFail.push(mine.label);
  }

  const gap = clientReport.score.overall - competitorScore.overall;

  return {
    domain: competitorCtx.rootDomain,
    url: competitorCtx.finalUrl,
    score: competitorScore.overall,
    grade: competitorScore.grade,
    clientScore: clientReport.score.overall,
    gap,
    leading: gap > 0,
    categories: competitorScore.categories.map((c) => {
      const mine = clientReport.score.categories.find((x) => x.id === c.id);
      return {
        id: c.id,
        name: c.name,
        icon: c.icon,
        you: mine?.score ?? null,
        them: c.score,
      };
    }),
    competitorWins,
    clientWins,
    bothFail,
    headline:
      gap >= 10
        ? `You are ahead: ${clientReport.score.overall} vs ${competitorScore.overall}. Protect the lead by closing the ${competitorWins.length} gaps below.`
        : gap <= -10
          ? `${competitorCtx.rootDomain} is beating you ${competitorScore.overall} to ${clientReport.score.overall}. They win on ${competitorWins.length} checks you are failing.`
          : `You and ${competitorCtx.rootDomain} are close (${clientReport.score.overall} vs ${competitorScore.overall}). ${competitorWins.length} fixes would put you clearly ahead.`,
  };
}

/**
 * White-label metadata for agency PDF exports. Sanitised here so nothing a
 * client types can inject markup into the rendered report.
 */
export function buildWhiteLabel(input = {}) {
  const clean = (v, max) =>
    String(v ?? '')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, max);

  const logoUrl = String(input.logoUrl || '').trim();
  const safeLogo = /^https:\/\/[^\s"'<>]+$/i.test(logoUrl) ? logoUrl : '';

  return {
    enabled: true,
    agencyName: clean(input.agencyName, 80) || 'Your Agency',
    agencyWebsite: clean(input.agencyWebsite, 120),
    agencyEmail: clean(input.agencyEmail, 120),
    agencyPhone: clean(input.agencyPhone, 40),
    logoUrl: safeLogo,
    accentColor: /^#[0-9a-f]{6}$/i.test(input.accentColor || '') ? input.accentColor : '#2563eb',
    preparedFor: clean(input.preparedFor, 80),
    hideSmartGenBranding: Boolean(input.hideSmartGenBranding),
  };
}
