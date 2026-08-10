/**
 * Gemini-generated narrative for the premium report: an executive summary and
 * a 30-day action roadmap written from the real findings.
 *
 * The deterministic roadmap from checks/runner.js is always computed first and
 * passed in as the fallback, so an AI outage never produces an empty report.
 */

/**
 * The roadmap is the one place worth spending a stronger model on — it has to
 * sequence real findings into a plan someone will follow. `-latest` tracks the
 * current Flash release rather than pinning to a version that gets retired.
 * Override with the ROADMAP_MODEL var.
 *
 * Newer Flash models spend output tokens on internal reasoning before writing,
 * so the budget is well above what the JSON itself needs — too low and the
 * response comes back empty with finishReason MAX_TOKENS.
 */
const DEFAULT_MODEL = 'gemini-flash-latest';
const endpointFor = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const TIMEOUT_MS = 40_000;
const MAX_OUTPUT_TOKENS = 6144;

/**
 * @param {object} input
 * @param {string} input.domain
 * @param {number} input.score
 * @param {Array}  input.issues       prioritised failing checks
 * @param {object} input.psi          Core Web Vitals payload (may be unavailable)
 * @param {Array}  input.fallback     deterministic roadmap
 * @param {object|null} input.competitor
 * @param {object} env  Worker env — supplies GEMINI_API_KEY and ROADMAP_MODEL
 */
export async function generateRoadmap(input, env) {
  const apiKey = env.GEMINI_API_KEY;
  const model = env.ROADMAP_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return { available: false, source: 'deterministic', reason: 'No GEMINI_API_KEY configured.' };
  }

  const prompt = buildPrompt(input);

  let text;
  try {
    // Header rather than ?key= so the secret never lands in a URL.
    const res = await fetch(endpointFor(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return {
        available: false,
        source: 'deterministic',
        reason: `Gemini ${model} returned ${res.status}. ${detail.slice(0, 200)}`,
      };
    }

    const json = await res.json();
    text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  } catch (err) {
    return {
      available: false,
      source: 'deterministic',
      reason:
        err?.name === 'TimeoutError' ? 'Gemini timed out.' : `Gemini request failed: ${err.message}`,
    };
  }

  const parsed = safeJson(text);
  if (!parsed || !Array.isArray(parsed.roadmap)) {
    return { available: false, source: 'deterministic', reason: 'Gemini returned an unparseable plan.' };
  }

  return {
    available: true,
    source: 'gemini',
    model,
    executiveSummary: String(parsed.executiveSummary || '').slice(0, 1200),
    quickWins: toStringArray(parsed.quickWins).slice(0, 5),
    roadmap: parsed.roadmap.slice(0, 4).map((week, i) => ({
      week: Number(week.week) || i + 1,
      title: String(week.title || `Week ${i + 1}`).slice(0, 120),
      focus: String(week.focus || '').slice(0, 300),
      tasks: toStringArray(week.tasks).slice(0, 8),
      expectedOutcome: String(week.expectedOutcome || '').slice(0, 300),
    })),
    competitorTakeaway: String(parsed.competitorTakeaway || '').slice(0, 600),
  };
}

function buildPrompt({ domain, score, issues, psi, competitor }) {
  const issueLines = issues
    .slice(0, 25)
    .map((r) => `- [${r.impact.toUpperCase()}] ${r.label}: ${r.detail} (Fix: ${r.fix})`)
    .join('\n');

  const cwv =
    psi?.available && psi.metrics
      ? Object.entries(psi.metrics)
          .filter(([, m]) => m)
          .map(([k, m]) => `${k}=${m.display} (${m.rating})`)
          .join(', ')
      : 'not available';

  const competitorLine = competitor
    ? `Competitor ${competitor.domain} scores ${competitor.score}/100 (client scores ${score}/100). Competitor beats the client on: ${
        competitor.competitorWins.join(', ') || 'nothing notable'
      }.`
    : 'No competitor was supplied.';

  return `You are a senior technical SEO consultant writing the action plan section of a paid audit report for the website ${domain}.

AUDIT DATA
Overall health score: ${score}/100
Performance score: ${psi?.scores?.performance ?? 'n/a'}
Core Web Vitals: ${cwv}
${competitorLine}

ISSUES FOUND (highest impact first):
${issueLines || '- No issues found.'}

TASK
Write a 30-day remediation plan split into 4 weeks. Ground every task in the issues above — never invent a problem that is not listed. Be specific and technical: name the file, tag, or setting to change. Write for a site owner who is competent but not an SEO specialist.

Return ONLY JSON matching this shape:
{
  "executiveSummary": "3-4 sentences: what is holding this site back and what changes after the fixes. Plain, direct, no hype.",
  "quickWins": ["3-5 fixes that take under 30 minutes each"],
  "roadmap": [
    {
      "week": 1,
      "title": "Short title",
      "focus": "One sentence on the theme of this week",
      "tasks": ["Specific, actionable task", "..."],
      "expectedOutcome": "What measurably improves by the end of this week"
    }
  ],
  "competitorTakeaway": "One paragraph on the competitor gap, or an empty string if no competitor was supplied."
}`;
}

function safeJson(text) {
  if (!text) return null;
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === 'string' ? v : String(v?.task || v?.title || ''))).filter(Boolean);
}
