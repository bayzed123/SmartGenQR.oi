# Report structure — what belongs in each section

The renderer produces the layout. This document is about the *judgement*: what
to write, what to leave out, and how to make each section earn its place.

---

## 1. Cover

Client name, domain, date, score, grade, agency branding. Nothing else.

The score is the hook. Do not soften it — a 39 printed large is what gets the
document read. If the score is high (85+), the cover still works: it becomes
proof the client's investment is paying off, and the report justifies the
retainer instead of the emergency.

---

## 2. Executive summary

**Four sentences. Written by you, not pasted from `ai.executiveSummary`.**

The pattern that works:

> [Single most expensive problem, stated as a consequence]. [Second problem,
> connected to the first if they share a root cause]. [What changes once both
> are fixed, with the modelled range]. [The one thing to do this week].

What kills an executive summary:

- Opening with the score. They can see the score.
- Listing categories. That is the scorecard's job.
- Hedging every claim. "May potentially impact" reads as "we are not sure".
- Any sentence that would be true of any website.

---

## 3. Scorecard

Per-category scores with pass/fail counts. Call out the weakest category in the
lede — the renderer does this automatically, but check it makes sense. A 0% in
*Social Presence* is not the story if *Authority & Technical* is at 27%.

Explain the weighting once: categories are weighted by ranking impact, so the
overall score is not the average of the category scores. Clients ask.

---

## 4. What this is costing you

The `impact` object, framed honestly.

Rules that are not negotiable:

- Always a **range**, never a point estimate.
- Always a **time horizon** (3–6 months).
- Always labelled as **modelled**, with the disclaimer visible on the page.
- Never "you will gain X%".

The credibility of the whole document rests here. A report that promises 300%
growth is a report nobody acts on.

If `impact.issueCount` is 0, drop the section entirely rather than writing a
paragraph about how there is nothing to say.

---

## 5. Critical findings

Every `critical` and `high` issue that failed or warned, in severity order.

Each finding needs three things:

1. **What is wrong** — from `detail`, which already quotes the real evidence
   ("2 URL variants each return 200 without redirecting").
2. **Why it costs money** — the consequence, in the client's terms. Not
   "duplicate content" but "Google is splitting your homepage authority across
   two URLs and picking one at random".
3. **How to fix it** — from `fix`, expanded with the platform specifics from
   `references/fix-playbook.md` using `report.site.generator`.

Do not include medium and low findings here. They go in the appendix. A
"critical findings" section with 40 items has no critical findings.

---

## 6. Core Web Vitals *(premium)*

Say which data source you are quoting, every time:

- `source: "field"` — real Chrome users over 28 days. **This is the ranking
  signal.** Quote it with confidence.
- `source: "lab"` — a single simulated load. A diagnostic that tells you where
  to look, not what Google sees. Say so.

If `hasFieldData` is false, the site has too little traffic for CrUX. That is
worth stating plainly — it is also a signal about the site's current reach.

Pair each poor metric with the matching opportunity from `opportunities`. A
poor LCP next to "eliminate render-blocking resources, saves ~1.9s" is
actionable; a poor LCP on its own is just bad news.

---

## 7. Competitor benchmark *(premium)*

The most persuasive section in the report. Do not bury it.

`competitorWins` is the list that matters: checks the competitor passes and the
client fails. These are not opinions — they are observable facts about two live
websites, which is exactly why they land.

Framing by gap size:

- **Behind by 10+**: name the gap directly. "They pass 17 checks you fail."
- **Within 10**: frame it as a race that is still open.
- **Ahead by 10+**: frame it as a lead to defend, and use `competitorWins` to
  show where the lead is thinnest.

Never editorialise about the competitor's business. Stick to the checks.

---

## 8. 30-day roadmap

Four weeks, sequenced by **dependency**, not by category:

1. **Week 1 — crawlability and indexation.** Nothing downstream matters if
   Google cannot reach or canonicalise the site.
2. **Week 2 — trust pages.** About, Contact, Privacy, Terms. Content work
   without these underperforms.
3. **Week 3 — structured data and footer signals.** Now that the pages exist,
   make them machine-readable.
4. **Week 4 — on-page polish.** Headings, anchors, images, cleanup.

Every task must be something one person can finish in a sitting. "Improve SEO"
is not a task. "Add a self-referencing canonical tag to the page template" is.

If `ai.available` is false, use `ai.fallbackRoadmap` or `roadmap` — the
deterministic version is already sequenced the same way. Do not tell the client
which one they got.

---

## 9. Appendix — all checks

Every result, grouped by category, with its status and detail. This is the
receipts section: it proves the score was earned rather than asserted.

Include `skip` results. A skip means the check did not apply — no images on the
page, too few external links to judge. Hiding them makes the totals fail to
add up, and clients do add them up.

---

## 10. Next steps

Three actions, the first of which is booking the strategy call. Then agency
contact details.

If `--hide-smartgen` was passed, verify no SmartGen string survives anywhere in
the output before sending.
