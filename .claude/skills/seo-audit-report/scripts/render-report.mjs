#!/usr/bin/env node
/**
 * SmartGen premium SEO audit report renderer.
 *
 * Report JSON (from the SmartGen Platforms Worker) + optional agency branding
 * → a single self-contained, print-ready HTML file. No dependencies, no build.
 *
 *   node render-report.mjs --input report.json --output audit.html \
 *     --agency "Acme SEO" --logo https://acme.com/logo.png --accent "#0f172a"
 *
 * Open the output and print to PDF (A4, background graphics on).
 */

import fs from 'node:fs';
import path from 'node:path';

/* ----------------------------------------------------------------- CLI */

const FLAGS = {
  input: { alias: 'i', description: 'Path to the audit JSON (use "-" for stdin)' },
  output: { alias: 'o', description: 'Output HTML path (default: <domain>-seo-audit.html)' },
  agency: { description: 'Agency name shown on the cover and footer' },
  logo: { description: 'Absolute https:// URL of the agency logo' },
  accent: { description: 'Accent colour as #rrggbb (default #2563eb)' },
  email: { description: 'Agency contact email' },
  phone: { description: 'Agency contact phone' },
  website: { description: 'Agency website' },
  'prepared-for': { description: 'Client name shown on the cover' },
  summary: { description: 'Override the executive summary (text, or @path/to/file.md)' },
  'hide-smartgen': { flag: true, description: 'Remove all SmartGen branding' },
  help: { alias: 'h', flag: true, description: 'Show this help' },
};

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('-')) continue;

    const long = token.replace(/^--?/, '');
    const [name, inlineValue] = long.includes('=') ? long.split(/=(.*)/) : [long, undefined];

    const key =
      Object.keys(FLAGS).find((k) => k === name || FLAGS[k].alias === name) || name;
    const spec = FLAGS[key];

    if (spec && spec.flag) {
      out[key] = true;
      continue;
    }
    if (inlineValue !== undefined) {
      out[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function showHelp() {
  console.log('\nSmartGen premium SEO audit report renderer\n');
  console.log('Usage: node render-report.mjs --input report.json [options]\n');
  for (const [name, spec] of Object.entries(FLAGS)) {
    const flagText = `  --${name}${spec.alias ? `, -${spec.alias}` : ''}`;
    console.log(flagText.padEnd(26) + spec.description);
  }
  console.log('');
}

/* ------------------------------------------------------------- helpers */

const esc = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const STATUS_ICON = { pass: '✓', warn: '!', fail: '✕', skip: '–' };

function scoreColor(score) {
  if (score == null) return '#94a3b8';
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function readInput(inputPath) {
  const raw =
    inputPath === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(inputPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    fail(`Could not parse ${inputPath} as JSON: ${err.message}`);
  }
  // Accept either the API envelope { ok, report } or a bare report object.
  const report = parsed.report || parsed;
  if (!report.score || !Array.isArray(report.results)) {
    fail('That JSON does not look like a SmartGen audit report (missing score/results).');
  }
  return report;
}

function fail(message) {
  console.error(`\n✕ ${message}\n`);
  process.exit(1);
}

function resolveSummary(value, report) {
  if (typeof value === 'string' && value.startsWith('@')) {
    return fs.readFileSync(value.slice(1), 'utf8').trim();
  }
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (report.ai && report.ai.executiveSummary) return report.ai.executiveSummary;
  return report.score.verdict;
}

/** Gemini roadmap if present, otherwise the deterministic one. */
function resolveRoadmap(report) {
  const ai = report.ai;
  if (ai && ai.available && Array.isArray(ai.roadmap) && ai.roadmap.length) {
    return {
      source: 'ai',
      weeks: ai.roadmap.map((w) => ({
        title: w.title || `Week ${w.week}`,
        focus: w.focus || '',
        outcome: w.expectedOutcome || '',
        tasks: (w.tasks || []).map((t) => ({ task: t, how: '' })),
      })),
    };
  }
  const fallback = (ai && ai.fallbackRoadmap) || report.roadmap || [];
  return {
    source: 'deterministic',
    weeks: fallback.map((w) => ({
      title: w.title,
      focus: '',
      outcome: '',
      tasks: (w.tasks || []).map((t) => ({ task: t.task, how: t.how || '', why: t.why || '' })),
    })),
  };
}

/* -------------------------------------------------------------- render */

function renderCover(report, brand, summary) {
  const score = report.score.overall;
  const color = scoreColor(score);
  const date = new Date(report.scannedAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<section class="cover page">
  <div class="cover-brand">
    ${brand.logoUrl ? `<img class="cover-logo" src="${esc(brand.logoUrl)}" alt="${esc(brand.agencyName)}">` : `<span class="cover-agency">${esc(brand.agencyName)}</span>`}
    <span class="cover-kicker">SEO Audit Report</span>
  </div>

  <h1 class="cover-domain">${esc(report.site.domain)}</h1>
  ${brand.preparedFor ? `<p class="cover-prepared">Prepared for <strong>${esc(brand.preparedFor)}</strong></p>` : ''}
  <p class="cover-date">${esc(date)} · ${report.tier === 'premium' ? '72-point audit' : '27-point audit'}</p>

  <div class="cover-score">
    <div class="dial" style="--dial-color:${color};--dial-pct:${score}">
      <span class="dial-number">${score}</span>
      <span class="dial-grade">Grade ${esc(report.score.grade)}</span>
    </div>
    <div class="cover-stats">
      <div><strong>${report.score.passed}</strong><span>passed</span></div>
      <div><strong>${report.score.warned}</strong><span>warnings</span></div>
      <div><strong>${report.score.failed}</strong><span>failed</span></div>
      <div><strong>${report.score.total}</strong><span>checks run</span></div>
    </div>
  </div>

  <div class="cover-summary">
    <h2>Executive summary</h2>
    <p>${esc(summary)}</p>
  </div>

  <div class="cover-footer">
    ${[brand.agencyWebsite, brand.agencyEmail, brand.agencyPhone].filter(Boolean).map(esc).join(' · ')}
  </div>
</section>`;
}

function renderScorecard(report) {
  const cats = report.score.categories;
  const weakest = cats
    .filter((c) => c.score != null)
    .sort((a, b) => a.score - b.score)[0];

  return `
<section class="page">
  <h2 class="section-title">Scorecard</h2>
  <p class="section-lede">
    Each category is weighted by ranking impact, so a failing critical check costs
    more than a failing cosmetic one.
    ${weakest ? `Your weakest area is <strong>${esc(weakest.name)}</strong> at ${weakest.score}%.` : ''}
  </p>

  <table class="scorecard">
    <thead>
      <tr><th>Category</th><th>Score</th><th>Passed</th><th>Failed</th><th>Not applicable</th></tr>
    </thead>
    <tbody>
      ${cats
        .map(
          (c) => `<tr>
        <td>${esc(c.icon)} ${esc(c.name)}</td>
        <td><span class="pill" style="background:${scoreColor(c.score)}1a;color:${scoreColor(c.score)}">${c.score == null ? '—' : c.score + '%'}</span></td>
        <td>${c.passed}</td>
        <td>${c.failed}</td>
        <td>${c.skipped || '—'}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</section>`;
}

function renderImpact(report) {
  const impact = report.impact;
  if (!impact || !impact.issueCount) return '';

  return `
<section class="block">
  <h2 class="section-title">What this is costing you</h2>
  <div class="impact-box">
    <p class="impact-headline">${esc(impact.statement)}</p>
    <div class="impact-stats">
      <div><strong>${impact.issueCount}</strong><span>issues found</span></div>
      <div><strong>${impact.criticalCount}</strong><span>critical</span></div>
      <div><strong>${impact.estimatedUpliftLow}–${impact.estimatedUpliftHigh}%</strong><span>modelled traffic upside</span></div>
      <div><strong>${report.score.overall} → ${impact.projectedScore}</strong><span>score after fixes</span></div>
    </div>
    <p class="disclaimer">
      These figures are modelled from the issues found on this site and the typical impact of each
      fix. They are a planning guide for prioritisation, not a guarantee of results.
    </p>
  </div>
</section>`;
}

function renderFindings(report) {
  const critical = report.results.filter(
    (r) => (r.status === 'fail' || r.status === 'warn') && ['critical', 'high'].includes(r.impact)
  );
  if (!critical.length) {
    return `
<section class="block">
  <h2 class="section-title">Critical findings</h2>
  <p class="section-lede">No critical or high-impact issues were found. That is genuinely rare —
  the remaining work is in the appendix, and it is all medium or low severity.</p>
</section>`;
  }

  return `
<section class="block">
  <h2 class="section-title">Critical findings</h2>
  <p class="section-lede">${critical.length} issues rated critical or high, in the order we would fix them.</p>
  ${critical
    .map(
      (r, i) => `
  <article class="finding ${esc(r.impact)}">
    <header>
      <span class="finding-number">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(r.label)}</h3>
      <span class="severity ${esc(r.impact)}">${esc(r.impact)}</span>
    </header>
    <p class="finding-detail">${esc(r.detail)}</p>
    ${r.fix ? `<p class="finding-fix"><strong>Fix:</strong> ${esc(r.fix)}</p>` : ''}
  </article>`
    )
    .join('')}
</section>`;
}

function renderCoreWebVitals(report) {
  const cwv = report.coreWebVitals;
  if (!cwv) return '';
  if (!cwv.available) {
    return `
<section class="block">
  <h2 class="section-title">Core Web Vitals</h2>
  <p class="section-lede">Not available for this run — ${esc(cwv.error || 'PageSpeed Insights did not respond')}.</p>
</section>`;
  }

  const metricRows = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']
    .map((key) => ({ key, metric: cwv.metrics[key] }))
    .filter((m) => m.metric);

  return `
<section class="block">
  <h2 class="section-title">Core Web Vitals</h2>
  <p class="section-lede">
    Measured by Google PageSpeed Insights on ${esc(cwv.strategy)}.
    ${cwv.hasFieldData
      ? 'Field data from real Chrome users — this is what Google ranks on.'
      : 'No field data available for this URL, so these are lab measurements: a diagnostic, not the ranking signal.'}
  </p>

  <div class="lighthouse-scores">
    ${Object.entries(cwv.scores)
      .filter(([, v]) => v != null)
      .map(
        ([k, v]) =>
          `<div class="ls-item"><span class="ls-value" style="color:${scoreColor(v)}">${v}</span><span class="ls-label">${esc(k.replace(/([A-Z])/g, ' $1'))}</span></div>`
      )
      .join('')}
  </div>

  <table class="scorecard">
    <thead><tr><th>Metric</th><th>Value</th><th>Rating</th><th>Good if</th><th>Source</th></tr></thead>
    <tbody>
      ${metricRows
        .map(
          ({ key, metric }) => `<tr>
        <td>${esc(key)}</td>
        <td>${esc(metric.display)}</td>
        <td><span class="pill rating-${esc(metric.rating || 'unknown')}">${esc((metric.rating || 'unknown').replace('-', ' '))}</span></td>
        <td>≤ ${esc(metric.threshold ? metric.threshold.good + (metric.threshold.unit || '') : '—')}</td>
        <td>${esc(metric.source)}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  ${
    cwv.opportunities && cwv.opportunities.length
      ? `<h3 class="sub-title">Biggest speed opportunities</h3>
  <ul class="opportunity-list">
    ${cwv.opportunities
      .map(
        (o) =>
          `<li><strong>${esc(o.title)}</strong> — saves ~${Math.round(o.savingsMs / 100) / 10}s. ${esc(o.description)}</li>`
      )
      .join('')}
  </ul>`
      : ''
  }
</section>`;
}

function renderCompetitor(report) {
  const comp = report.competitor;
  if (!comp) return '';
  if (comp.error) {
    return `
<section class="block">
  <h2 class="section-title">Competitor benchmark</h2>
  <p class="section-lede">The competitor scan did not complete — ${esc(comp.error)}</p>
</section>`;
  }

  return `
<section class="block">
  <h2 class="section-title">Competitor benchmark</h2>
  <p class="section-lede">${esc(comp.headline)}</p>

  <div class="versus">
    <div class="versus-side">
      <span class="versus-label">${esc(report.site.domain)}</span>
      <span class="versus-score" style="color:${scoreColor(comp.clientScore)}">${comp.clientScore}</span>
    </div>
    <span class="versus-vs">vs</span>
    <div class="versus-side">
      <span class="versus-label">${esc(comp.domain)}</span>
      <span class="versus-score" style="color:${scoreColor(comp.score)}">${comp.score}</span>
    </div>
  </div>

  <table class="scorecard">
    <thead><tr><th>Category</th><th>${esc(report.site.domain)}</th><th>${esc(comp.domain)}</th><th>Gap</th></tr></thead>
    <tbody>
      ${comp.categories
        .map((c) => {
          const gap = c.you != null && c.them != null ? c.you - c.them : null;
          return `<tr>
        <td>${esc(c.icon)} ${esc(c.name)}</td>
        <td>${c.you == null ? '—' : c.you + '%'}</td>
        <td>${c.them == null ? '—' : c.them + '%'}</td>
        <td style="color:${gap == null ? '#94a3b8' : gap >= 0 ? '#16a34a' : '#dc2626'}">${gap == null ? '—' : (gap > 0 ? '+' : '') + gap}</td>
      </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  ${
    comp.competitorWins.length
      ? `<h3 class="sub-title">Where they beat you</h3>
  <ul class="gap-list">${comp.competitorWins.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`
      : ''
  }
  ${
    comp.clientWins.length
      ? `<h3 class="sub-title">Where you beat them</h3>
  <ul class="gap-list win">${comp.clientWins.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`
      : ''
  }
</section>`;
}

function renderRoadmap(report) {
  const roadmap = resolveRoadmap(report);
  if (!roadmap.weeks.length) return '';

  return `
<section class="block">
  <h2 class="section-title">Your 30-day roadmap</h2>
  <p class="section-lede">
    Sequenced so each week unblocks the next: crawlability first, then trust signals,
    then structured data, then polish.
  </p>
  ${roadmap.weeks
    .map(
      (week) => `
  <div class="week">
    <h3>${esc(week.title)}</h3>
    ${week.focus ? `<p class="week-focus">${esc(week.focus)}</p>` : ''}
    <ol class="week-tasks">
      ${week.tasks
        .map(
          (t) =>
            `<li><strong>${esc(t.task)}</strong>${t.how ? `<span class="task-how">${esc(t.how)}</span>` : ''}</li>`
        )
        .join('')}
    </ol>
    ${week.outcome ? `<p class="week-outcome"><strong>By the end of this week:</strong> ${esc(week.outcome)}</p>` : ''}
  </div>`
    )
    .join('')}
</section>`;
}

function renderAppendix(report) {
  const byCategory = new Map();
  for (const r of report.results) {
    if (!byCategory.has(r.category)) byCategory.set(r.category, []);
    byCategory.get(r.category).push(r);
  }

  return `
<section class="block page-break">
  <h2 class="section-title">Appendix — all ${report.results.length} checks</h2>
  ${report.score.categories
    .map((cat) => {
      const items = byCategory.get(cat.id) || [];
      if (!items.length) return '';
      return `
  <h3 class="sub-title">${esc(cat.icon)} ${esc(cat.name)} <span class="sub-count">${cat.passed}/${cat.total} passed</span></h3>
  <ul class="appendix-list">
    ${items
      .map(
        (r) => `<li class="appendix-item status-${esc(r.status)}">
      <span class="appendix-icon">${STATUS_ICON[r.status] || '·'}</span>
      <div><strong>${esc(r.label)}</strong><span>${esc(r.detail || r.description)}</span></div>
    </li>`
      )
      .join('')}
  </ul>`;
    })
    .join('')}
</section>`;
}

function renderNextSteps(report, brand) {
  return `
<section class="block next-steps">
  <h2 class="section-title">Next steps</h2>
  <ol>
    <li><strong>Book the strategy call.</strong> Thirty minutes to walk through this roadmap,
        agree priorities and answer whatever this document could not.</li>
    <li><strong>Start with Week 1.</strong> The critical findings block everything downstream —
        there is no point optimising content that Google cannot index.</li>
    <li><strong>Re-audit after each week.</strong> The score is the feedback loop; watch it move.</li>
  </ol>
  <p class="contact">
    ${esc(brand.agencyName)}${brand.agencyEmail ? ` · ${esc(brand.agencyEmail)}` : ''}${brand.agencyPhone ? ` · ${esc(brand.agencyPhone)}` : ''}
  </p>
  ${
    brand.hideSmartGenBranding
      ? ''
      : `<p class="powered">Audit engine by <strong>SmartGen Tools</strong> · smartgentools.com/seo-audit-tool</p>`
  }
</section>`;
}

function renderDocument(report, brand, summary) {
  const title = `SEO Audit — ${report.site.domain}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root {
  --accent: ${esc(brand.accentColor)};
  --ink: #0f172a;
  --ink-soft: #475569;
  --line: #e2e8f0;
  --bg: #ffffff;
  --bg-soft: #f8fafc;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif;
  color: var(--ink);
  background: var(--bg-soft);
  line-height: 1.6;
  font-size: 15px;
}
.sheet { max-width: 900px; margin: 0 auto; background: var(--bg); }
.page, .block { padding: 3rem 3.5rem; }
.block { border-top: 1px solid var(--line); }
@media (max-width: 640px) { .page, .block { padding: 2rem 1.25rem; } }

/* cover */
.cover { background: linear-gradient(155deg, var(--ink) 0%, #1e293b 60%, var(--accent) 100%); color: #f8fafc; }
.cover-brand { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 3rem; }
.cover-logo { max-height: 48px; max-width: 220px; }
.cover-agency { font-size: 1.15rem; font-weight: 800; letter-spacing: -0.01em; }
.cover-kicker { font-size: .72rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #cbd5e1; }
.cover-domain { font-size: clamp(2rem, 5vw, 3.1rem); margin: 0 0 .4rem; color: #fff; letter-spacing: -0.02em; word-break: break-word; }
.cover-prepared { margin: 0 0 .2rem; color: #cbd5e1; }
.cover-date { margin: 0 0 2.5rem; color: #94a3b8; font-size: .9rem; }
.cover-score { display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
.dial {
  width: 150px; height: 150px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background:
    radial-gradient(closest-side, #1e293b 78%, transparent 79%),
    conic-gradient(var(--dial-color) calc(var(--dial-pct) * 1%), rgba(255,255,255,.16) 0);
  flex: 0 0 auto;
}
.dial-number { font-size: 2.9rem; font-weight: 800; color: var(--dial-color); line-height: 1; }
.dial-grade { font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; margin-top: .3rem; }
.cover-stats { display: grid; grid-template-columns: repeat(2, minmax(90px, 1fr)); gap: 1rem 2rem; }
.cover-stats div { display: flex; flex-direction: column; }
.cover-stats strong { font-size: 1.6rem; color: #fff; line-height: 1; }
.cover-stats span { font-size: .78rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }
.cover-summary { background: rgba(255,255,255,.07); border-left: 3px solid var(--accent); border-radius: 0 12px 12px 0; padding: 1.4rem 1.6rem; }
.cover-summary h2 { margin: 0 0 .5rem; font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; color: #cbd5e1; }
.cover-summary p { margin: 0; color: #e2e8f0; font-size: 1.02rem; }
.cover-footer { margin-top: 2.5rem; font-size: .8rem; color: #94a3b8; }

/* sections */
.section-title { font-size: 1.5rem; margin: 0 0 .6rem; letter-spacing: -0.01em; }
.section-lede { color: var(--ink-soft); margin: 0 0 1.6rem; }
.sub-title { font-size: 1.05rem; margin: 1.8rem 0 .7rem; display: flex; align-items: baseline; gap: .6rem; }
.sub-count { font-size: .78rem; font-weight: 600; color: var(--ink-soft); }

table.scorecard { width: 100%; border-collapse: collapse; font-size: .9rem; }
table.scorecard th { text-align: left; font-size: .7rem; letter-spacing: .09em; text-transform: uppercase; color: var(--ink-soft); padding: .6rem .8rem; background: var(--bg-soft); }
table.scorecard td { padding: .65rem .8rem; border-top: 1px solid var(--line); }
table.scorecard th:not(:first-child), table.scorecard td:not(:first-child) { text-align: center; }
.pill { display: inline-block; padding: .15rem .6rem; border-radius: 999px; font-weight: 700; font-size: .82rem; }
.rating-good { background: #dcfce7; color: #16a34a; }
.rating-needs-improvement { background: #fef3c7; color: #d97706; }
.rating-poor { background: #fee2e2; color: #dc2626; }

/* impact */
.impact-box { border: 1px solid var(--line); border-radius: 14px; padding: 1.5rem; background: var(--bg-soft); }
.impact-headline { margin: 0 0 1.2rem; font-size: 1.05rem; }
.impact-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.impact-stats div { display: flex; flex-direction: column; }
.impact-stats strong { font-size: 1.5rem; color: var(--accent); line-height: 1.1; }
.impact-stats span { font-size: .76rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: .06em; }
.disclaimer { font-size: .8rem; color: var(--ink-soft); margin: 0; font-style: italic; }

/* findings */
.finding { border: 1px solid var(--line); border-left: 4px solid var(--line); border-radius: 10px; padding: 1.1rem 1.3rem; margin-bottom: .9rem; break-inside: avoid; }
.finding.critical { border-left-color: #dc2626; }
.finding.high { border-left-color: #d97706; }
.finding header { display: flex; align-items: center; gap: .8rem; margin-bottom: .5rem; }
.finding-number { font-size: .82rem; font-weight: 800; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.finding h3 { margin: 0; font-size: 1.02rem; flex: 1; }
.severity { font-size: .64rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: .16rem .5rem; border-radius: 999px; background: var(--line); color: var(--ink-soft); }
.severity.critical { background: #fee2e2; color: #dc2626; }
.severity.high { background: #fef3c7; color: #d97706; }
.finding-detail { margin: 0 0 .6rem; color: var(--ink-soft); font-size: .92rem; }
.finding-fix { margin: 0; font-size: .88rem; background: color-mix(in srgb, var(--accent) 7%, transparent); border-radius: 8px; padding: .6rem .8rem; }

/* lighthouse */
.lighthouse-scores { display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 1.5rem; }
.ls-item { display: flex; flex-direction: column; }
.ls-value { font-size: 2rem; font-weight: 800; line-height: 1; }
.ls-label { font-size: .74rem; text-transform: capitalize; color: var(--ink-soft); letter-spacing: .05em; }
.opportunity-list { padding-left: 1.2rem; font-size: .9rem; color: var(--ink-soft); }
.opportunity-list li { margin-bottom: .5rem; }
.opportunity-list strong { color: var(--ink); }

/* competitor */
.versus { display: flex; align-items: center; justify-content: center; gap: 2rem; margin: 1.5rem 0; flex-wrap: wrap; }
.versus-side { display: flex; flex-direction: column; align-items: center; }
.versus-label { font-size: .82rem; color: var(--ink-soft); word-break: break-all; }
.versus-score { font-size: 3rem; font-weight: 800; line-height: 1; }
.versus-vs { font-size: .8rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft); }
.gap-list { padding-left: 1.2rem; font-size: .9rem; color: var(--ink-soft); }
.gap-list li::marker { color: #dc2626; }
.gap-list.win li::marker { color: #16a34a; }

/* roadmap */
.week { border: 1px solid var(--line); border-radius: 12px; padding: 1.2rem 1.4rem; margin-bottom: 1rem; break-inside: avoid; }
.week h3 { margin: 0 0 .4rem; font-size: 1.05rem; color: var(--accent); }
.week-focus { margin: 0 0 .8rem; color: var(--ink-soft); font-size: .9rem; }
.week-tasks { margin: 0; padding-left: 1.3rem; }
.week-tasks li { margin-bottom: .6rem; font-size: .92rem; }
.task-how { display: block; font-weight: 400; color: var(--ink-soft); font-size: .86rem; margin-top: .15rem; }
.week-outcome { margin: .9rem 0 0; font-size: .87rem; color: var(--ink-soft); border-top: 1px dashed var(--line); padding-top: .7rem; }

/* appendix */
.appendix-list { list-style: none; padding: 0; margin: 0; }
.appendix-item { display: grid; grid-template-columns: 1.3rem 1fr; gap: .7rem; padding: .5rem 0; border-top: 1px solid var(--line); font-size: .88rem; break-inside: avoid; }
.appendix-icon { font-weight: 800; text-align: center; }
.status-pass .appendix-icon { color: #16a34a; }
.status-warn .appendix-icon { color: #d97706; }
.status-fail .appendix-icon { color: #dc2626; }
.status-skip .appendix-icon { color: #94a3b8; }
.appendix-item strong { display: block; }
.appendix-item span { color: var(--ink-soft); font-size: .84rem; }

/* next steps */
.next-steps ol { padding-left: 1.2rem; }
.next-steps li { margin-bottom: .7rem; }
.contact { margin-top: 1.5rem; font-weight: 700; }
.powered { margin-top: .4rem; font-size: .8rem; color: var(--ink-soft); }

@page { size: A4; margin: 12mm; }
@media print {
  body { background: #fff; font-size: 11pt; }
  .sheet { max-width: none; }
  .page, .block { padding: 1.2rem 0; }
  .page-break { break-before: page; }
  .cover { break-after: page; padding: 2rem; border-radius: 0; }
  .finding, .week, .appendix-item { break-inside: avoid; }
}
</style>
</head>
<body>
<main class="sheet">
${renderCover(report, brand, summary)}
${renderScorecard(report)}
${renderImpact(report)}
${renderFindings(report)}
${renderCoreWebVitals(report)}
${renderCompetitor(report)}
${renderRoadmap(report)}
${renderAppendix(report)}
${renderNextSteps(report, brand)}
</main>
</body>
</html>
`;
}

/* ----------------------------------------------------------------- main */

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.input) {
  showHelp();
  process.exit(args.help ? 0 : 1);
}

const report = readInput(args.input);

const accent = typeof args.accent === 'string' && /^#[0-9a-f]{6}$/i.test(args.accent)
  ? args.accent
  : '#2563eb';

const logo = typeof args.logo === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(args.logo)
  ? args.logo
  : '';

if (args.logo && !logo) {
  console.warn('⚠ --logo ignored: must be an absolute https:// URL.');
}

const brand = {
  agencyName: (typeof args.agency === 'string' && args.agency) || 'SmartGen Tools',
  agencyWebsite: (typeof args.website === 'string' && args.website) || '',
  agencyEmail: (typeof args.email === 'string' && args.email) || '',
  agencyPhone: (typeof args.phone === 'string' && args.phone) || '',
  preparedFor: (typeof args['prepared-for'] === 'string' && args['prepared-for']) || '',
  logoUrl: logo,
  accentColor: accent,
  hideSmartGenBranding: Boolean(args['hide-smartgen']),
};

const summary = resolveSummary(args.summary, report);
const html = renderDocument(report, brand, summary);

const outputPath =
  (typeof args.output === 'string' && args.output) ||
  `${report.site.domain.replace(/[^a-z0-9.-]/gi, '_')}-seo-audit.html`;

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');

const roadmap = resolveRoadmap(report);
console.log(`
✓ Report written to ${outputPath}

  Site        ${report.site.domain}
  Tier        ${report.tier} (${report.results.length} checks)
  Score       ${report.score.overall}/100 — grade ${report.score.grade}
  Findings    ${report.score.failed} failed · ${report.score.warned} warnings · ${report.score.skipped} not applicable
  Roadmap     ${roadmap.weeks.length} weeks (${roadmap.source})
  Vitals      ${report.coreWebVitals ? (report.coreWebVitals.available ? 'included' : 'unavailable') : 'not requested'}
  Competitor  ${report.competitor ? (report.competitor.error ? 'failed' : report.competitor.domain) : 'not requested'}
  Branding    ${brand.agencyName}${brand.hideSmartGenBranding ? ' (SmartGen branding hidden)' : ''}

  Open it in a browser and print to PDF — A4, background graphics on.
`);
