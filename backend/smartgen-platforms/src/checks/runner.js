/**
 * Runs the check registry against an audit context and turns the raw results
 * into the scored, grouped report the frontend renders.
 */

import { CHECKS, CATEGORIES } from './registry.js';

/** How much a failing check costs, relative to its impact rating. */
const IMPACT_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

/** Rough organic-traffic upside per failing check, used for the prediction. */
const IMPACT_TRAFFIC = { critical: 0.055, high: 0.03, medium: 0.015, low: 0.005 };

export function runChecks(ctx, tier = 'free') {
  const wanted = tier === 'premium' ? CHECKS : CHECKS.filter((c) => c.tier === 'free');

  const results = wanted.map((check) => {
    let outcome;
    try {
      outcome = check.run(ctx);
    } catch (err) {
      outcome = {
        status: 'skip',
        detail: `Could not evaluate this check (${err.message}).`,
      };
    }
    return {
      id: check.id,
      category: check.category,
      tier: check.tier,
      label: check.label,
      description: check.description,
      impact: check.impact,
      fix: check.fix,
      status: outcome.status,
      detail: outcome.detail || '',
      evidence: outcome.evidence ?? null,
    };
  });

  return results;
}

/**
 * Weighted score. A `warn` counts as half credit; `skip` is excluded from the
 * denominator so a site with no images is not punished for image checks.
 */
export function scoreResults(results) {
  const byCategory = CATEGORIES.map((cat) => {
    const items = results.filter((r) => r.category === cat.id);
    const graded = items.filter((r) => r.status !== 'skip');

    let earned = 0;
    let possible = 0;
    for (const item of graded) {
      const w = IMPACT_WEIGHT[item.impact] || 2;
      possible += w;
      if (item.status === 'pass') earned += w;
      else if (item.status === 'warn') earned += w * 0.5;
    }

    const score = possible ? Math.round((earned / possible) * 100) : null;
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      weight: cat.weight,
      total: items.length,
      passed: items.filter((r) => r.status === 'pass').length,
      warned: items.filter((r) => r.status === 'warn').length,
      failed: items.filter((r) => r.status === 'fail').length,
      skipped: items.filter((r) => r.status === 'skip').length,
      score,
      earned,
      possible,
    };
  }).filter((c) => c.total > 0);

  const totalEarned = byCategory.reduce((sum, c) => sum + c.earned * c.weight, 0);
  const totalPossible = byCategory.reduce((sum, c) => sum + c.possible * c.weight, 0);
  const overall = totalPossible ? Math.round((totalEarned / totalPossible) * 100) : 0;

  return {
    overall,
    grade: gradeFor(overall),
    verdict: verdictFor(overall),
    passed: results.filter((r) => r.status === 'pass').length,
    warned: results.filter((r) => r.status === 'warn').length,
    failed: results.filter((r) => r.status === 'fail').length,
    skipped: results.filter((r) => r.status === 'skip').length,
    total: results.length,
    categories: byCategory,
  };
}

function gradeFor(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

function verdictFor(score) {
  if (score >= 90) return 'Excellent — your technical and trust foundations are solid.';
  if (score >= 80) return 'Good — a handful of fixes will put you ahead of most competitors.';
  if (score >= 70) return 'Fair — the basics are there, but trust signals are leaking rankings.';
  if (score >= 55) return 'Needs work — several high-impact issues are holding this site back.';
  return 'Critical — foundational SEO and E-E-A-T problems are capping your visibility.';
}

/**
 * Rank failing checks so the roadmap and the "top fixes" list lead with the
 * items that move rankings most.
 */
export function prioritise(results, limit = 12) {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return results
    .filter((r) => r.status === 'fail' || r.status === 'warn')
    .sort((a, b) => {
      const byStatus = (a.status === 'fail' ? 0 : 1) - (b.status === 'fail' ? 0 : 1);
      if (byStatus !== 0) return byStatus;
      return (order[a.impact] ?? 9) - (order[b.impact] ?? 9);
    })
    .slice(0, limit);
}

/**
 * Deterministic traffic-upside estimate from the issues actually found.
 * Deliberately conservative and always presented as a range, never a promise.
 */
export function predictImpact(results, score) {
  const issues = results.filter((r) => r.status === 'fail' || r.status === 'warn');
  const raw = issues.reduce((sum, r) => {
    const base = IMPACT_TRAFFIC[r.impact] || 0.01;
    return sum + (r.status === 'fail' ? base : base * 0.4);
  }, 0);

  // Diminishing returns — fixing 40 things does not quadruple your traffic.
  const uplift = 1 - Math.exp(-raw);
  const low = Math.round(uplift * 100 * 0.6);
  const high = Math.round(uplift * 100 * 1.25);

  return {
    issueCount: issues.length,
    criticalCount: issues.filter((r) => r.impact === 'critical').length,
    estimatedUpliftLow: Math.max(low, issues.length ? 3 : 0),
    estimatedUpliftHigh: Math.max(high, issues.length ? 8 : 0),
    projectedScore: Math.min(100, score + Math.round((100 - score) * 0.85)),
    statement: issues.length
      ? `We found ${issues.length} issues on this site. Fixing them could lift organic traffic by an estimated ${Math.max(
          low,
          3
        )}%–${Math.max(high, 8)}% over 3–6 months and take your score from ${score} to about ${Math.min(
          100,
          score + Math.round((100 - score) * 0.85)
        )}.`
      : 'No issues were detected in this audit — focus your effort on content depth and link acquisition.',
  };
}

/**
 * A deterministic 4-week plan built from the prioritised failures. This is the
 * fallback the report ships with when Gemini is unavailable, so every premium
 * report always has a roadmap.
 */
export function buildRoadmap(results) {
  const issues = prioritise(results, 40);
  if (!issues.length) return [];

  const buckets = [
    {
      week: 1,
      title: 'Week 1 — Technical foundations',
      match: (r) => ['authority', 'homepage'].includes(r.category) || r.impact === 'critical',
    },
    {
      week: 2,
      title: 'Week 2 — Trust pages & E-E-A-T',
      match: (r) => ['eeat-pages', 'about'].includes(r.category),
    },
    {
      week: 3,
      title: 'Week 3 — Structured data & footer signals',
      match: (r) => ['schema', 'footer', 'social'].includes(r.category),
    },
    {
      week: 4,
      title: 'Week 4 — On-page polish & UX',
      match: () => true,
    },
  ];

  const assigned = new Set();
  return buckets
    .map((bucket) => {
      const tasks = issues
        .filter((r) => !assigned.has(r.id) && bucket.match(r))
        .slice(0, 8)
        .map((r) => {
          assigned.add(r.id);
          return { id: r.id, task: r.label, why: r.detail, how: r.fix, impact: r.impact };
        });
      return { week: bucket.week, title: bucket.title, tasks };
    })
    .filter((b) => b.tasks.length > 0);
}
