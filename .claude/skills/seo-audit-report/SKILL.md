---
name: seo-audit-report
description: Turn SmartGen SEO Audit JSON into the premium client deliverable — an executive-ready, white-label HTML/PDF report with a prioritised fix list, a 30-day roadmap, Core Web Vitals and competitor benchmark. Use when the user says "audit report", "premium report", "white-label report", "client SEO report", "deliver the audit", or hands over a report JSON / a URL to audit from the SmartGen Platforms API.
---

# SmartGen Premium SEO Audit Report

This skill produces the **$99 deliverable**: the document a client or agency
actually receives. The Worker (`backend/smartgen-platforms`) supplies the
findings; this skill turns them into a report someone would pay for.

A checklist is not a deliverable. The difference is *sequence, consequence and
ownership* — what to fix, what it costs to leave broken, who does it, and in
what order.

## When to use

- The user hands you an audit JSON payload from `/api/audit` or `/api/audit/premium`.
- The user gives you a URL and asks for a premium/client/white-label report.
- The user asks to re-render an existing report with different agency branding.

For a quick "is my site OK?" question, just read the JSON and answer in chat.
Reach for this skill when the output is a **document someone will send on**.

## Workflow

### 1. Get the report JSON

If you already have the JSON, skip ahead. Otherwise fetch it:

```bash
# Free — 27 checks
curl -s -X POST "$SMARTGEN_API/api/audit" \
  -H 'Content-Type: application/json' \
  -d '{"url":"client.com"}' > report.json

# Premium — 72 checks + Core Web Vitals + AI roadmap + competitor
curl -s -X POST "$SMARTGEN_API/api/audit/premium" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $UNLOCK_TOKEN" \
  -d '{"url":"client.com","competitorUrl":"rival.com","strategy":"mobile"}' > report.json
```

`$SMARTGEN_API` defaults to `https://smartgen-platforms.smartgentools.workers.dev`.

The response envelope is `{ ok, report }` — the renderer accepts either the
envelope or the bare `report` object.

### 2. Read the findings before you write anything

Never paraphrase the JSON mechanically. Read it and form a view:

- `score.overall` and `score.categories` — where is the damage concentrated?
- `topIssues` — already sorted by severity. This is your narrative spine.
- `impact` — the traffic range and projected score. Quote it as a range, always.
- `coreWebVitals.metrics` — field data (`source: "field"`) is the ranking
  signal; lab data is a diagnostic. Say which one you are quoting.
- `competitor.competitorWins` — the checks they pass and the client does not.
  This is the most persuasive section in the whole report; do not bury it.
- `ai.roadmap`, or `ai.fallbackRoadmap` / `roadmap` when Gemini was unavailable.

### 3. Write the executive summary yourself

The AI summary in `ai.executiveSummary` is a draft, not the deliverable. Rewrite
it against these rules:

- Lead with the single most expensive problem, not the score.
- One concrete consequence per claim: "the homepage carries a noindex directive,
  so it cannot rank at all" beats "indexation issues were found".
- No hype, no "leverage", no "unlock your potential".
- Four sentences maximum. Executives read this and nothing else.

### 4. Render

```bash
node .claude/skills/seo-audit-report/scripts/render-report.mjs \
  --input report.json \
  --output client-audit.html \
  --agency "Acme SEO" \
  --logo "https://acme.com/logo.png" \
  --accent "#0f172a" \
  --email "hello@acme.com" \
  --prepared-for "Client Ltd" \
  --hide-smartgen
```

Then open the HTML and print to PDF (A4, background graphics on). The stylesheet
is print-tuned: page breaks avoid splitting a finding, and interactive chrome is
hidden.

Run `--help` for the full flag list. Every branding flag is optional; with none
of them the report renders in SmartGen livery.

### 5. Quality gate — check before you hand it over

- [ ] Every claim traces to a check in the JSON. **Invent nothing.**
- [ ] Traffic impact is stated as a range and labelled as an estimate.
- [ ] Each finding names the file, tag or setting to change.
- [ ] The roadmap is sequenced by dependency, not by category.
- [ ] Competitor gaps are specific checks, not vibes.
- [ ] Client name and agency branding are correct everywhere.
- [ ] No SmartGen branding remains if `--hide-smartgen` was requested.

## Report structure

The renderer emits these sections in order. `references/report-structure.md`
explains what belongs in each and why.

1. **Cover** — client, domain, date, score, grade, agency branding
2. **Executive summary** — your four sentences
3. **Scorecard** — overall + per-category, with the weakest category called out
4. **What this is costing you** — the impact prediction, honestly framed
5. **Critical findings** — every `critical` and `high` issue, with fixes
6. **Core Web Vitals** — LCP / INP / CLS against Google's thresholds (premium)
7. **Competitor benchmark** — side by side, plus the exact gaps (premium)
8. **30-day roadmap** — week by week, with owners and expected outcomes
9. **Full check appendix** — all 72 results, grouped by category
10. **Next steps** — the strategy call and how to book it

## Writing rules

**Severity language.** `critical` = actively blocking rankings, fix this week.
`high` = costing real traffic, fix this month. `medium` = compounding, fix this
quarter. `low` = polish. Do not inflate — a missing RSS feed is not urgent, and
saying so is what makes the critical items believable.

**Numbers.** Traffic impact is always a range with a time horizon, always marked
as modelled. Never write "you will gain X%". A report that overpromises is worth
less than no report.

**Fixes.** Every finding carries a `fix` string from the registry. Expand it into
something a developer can act on without a follow-up question — the tag to add,
the redirect rule to write, the page to publish. `references/fix-playbook.md` has
platform-specific expansions for WordPress, Shopify, Next.js and static sites;
use `report.site.generator` to pick the right one.

**Skipped checks.** A `skip` is not a failure — it means the check did not apply
(no images on the page, too few external links to judge). Say so plainly rather
than hiding them, or the totals will not add up and the client will notice.

## Files

| Path | What it is |
|---|---|
| `scripts/render-report.mjs` | Report JSON + branding → print-ready HTML. No dependencies. |
| `references/report-structure.md` | Section-by-section guidance on what to write |
| `references/fix-playbook.md` | Platform-specific remediation for every check |
