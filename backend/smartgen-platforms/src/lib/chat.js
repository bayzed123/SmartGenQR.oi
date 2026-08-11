/**
 * The SmartGen AI Assistant.
 *
 * Three properties this module guarantees, in priority order:
 *
 *   1. The Gemini key never reaches the browser. It lives in Cloudflare's
 *      secret store and is read here, server-side, only.
 *   2. The bot cannot invent a tool or a URL. The model picks ids from a
 *      retrieved shortlist; this module resolves those ids against the real
 *      catalogue and drops anything that does not exist.
 *   3. The bot stays on topic. Questions with no SmartGen footing are answered
 *      with a redirect *before* any model call, which also protects the quota.
 */

import {
  searchKnowledge,
  buildContextBlock,
  siteFacts,
  directFaqMatch,
  resolveTool,
  TOOLS,
  FAQS,
  SITE,
} from './knowledge.js';

/**
 * Flash-lite is the right size for this job — short, grounded answers with a
 * fixed JSON shape — and it has the most generous free-tier quota, which is
 * what actually decides whether the bot answers or errors. Override with the
 * CHAT_MODEL var if quotas or model names change.
 */
const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const endpointFor = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const TIMEOUT_MS = 20_000;

const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY_TURNS = 6;

/**
 * Scope gate, calibrated against the real index (see test/chat.test.js).
 *
 * Measured on this corpus: genuine SmartGen questions score 69–800, while
 * off-topic ones top out around 39 ("write me a python script to sort a list"
 * picks up stray points from "script" and "list"). A floor of 50 sits in the
 * gap with margin on both sides.
 *
 * Coverage is required alongside it because score alone grows with question
 * length — a rambling off-topic question could otherwise accumulate enough
 * weak matches to sneak through.
 */
const MIN_SCORE = 50;
const MIN_COVERAGE = 0.34;

/** Only surface a tool if it is genuinely related, not merely the least bad match. */
const MIN_SOURCE_SCORE = 40;

/**
 * Questions about SmartGen itself. These often consist almost entirely of
 * stop words ("what can you do?"), so retrieval scores them at zero — the
 * pattern rescues them before the scope gate rejects them.
 *
 * Deliberately NOT included: a bare "are you" — that substring also matches
 * plain small talk like "how are you", which SMALL_TALK_INTENT below handles
 * with a friendly reply instead of dumping the tool catalogue on someone who
 * was just being polite. Self-referential questions ("are you a bot?") are
 * their own pattern, SELF_REFERENTIAL_INTENT.
 */
const SITE_INTENT = /\b(smartgen|smartgentools|your (site|website|tools|company|team|price|pricing)|this (site|website|tool)|who (made|built|owns|runs)|what can (you|i) do)\b/i;

/**
 * "What is SmartGen?" and its phrasings. Handled as its own intent rather than
 * through retrieval because "smartgen"/"smartgentools" are deliberately in
 * knowledge.js's STOP_WORDS (they appear in almost every tool description, so
 * keeping them would drown out real signal) — which means these questions
 * tokenize to nothing and retrieval alone can never find the matching FAQ.
 */
const ABOUT_INTENT =
  /\bwhat\s+(is|are)\s+smartgen(tools)?\b|\bwho\s+(is|are)\s+smartgen(tools)?\b|\bwhat\s+does\s+smartgen(tools)?\s+do\b|\btell\s+me\s+about\s+smartgen(tools)?\b/i;

/** "Are you a real person / a bot / an AI?" — answered directly, not as small talk. */
const SELF_REFERENTIAL_INTENT = /\bare\s+you\s+(a\s+|an\s+)?(bot|ai|robot|human|real|person|smartgen)\b/i;

/** "Who built/runs/owns this?" — answered with the real founder, not the catalogue. */
const WHO_BUILT_INTENT =
  /\bwho\s+(built|made|owns|runs|created|develops?|develop(ed|s)|is\s+behind)\s+(smartgen(tools)?|you|this(\s+(site|tool|platform))?)\b/i;

/**
 * Plain conversational noise: greetings, thanks, farewells, "how are you".
 * None of these carry retrieval signal (the words simply are not in the tool
 * catalogue), so without this check they fall straight through to the
 * off-topic refusal — which reads as broken on the very first thing most
 * visitors type. Gated on a low retrieval score in answerQuestion() so it
 * never swallows a real question that happens to open with "hi".
 */
const SMALL_TALK_INTENT =
  /^\s*(hi+|hello+|hey+|hiya|yo|howdy|greetings|good\s?(morning|afternoon|evening|day))(\s+(there|smartgen|team))?[\s!.,]*$|\bhow\s*('s|\s+is)?\s*it\s*going\b|\bhow\s+are\s+you\b|\bwhat'?s\s+up\b/i;
const THANKS_INTENT = /\b(thanks|thank\s*you|thx|ty|appreciate\s*it|cheers)\b/i;
const FAREWELL_INTENT = /^\s*(bye+|goodbye|see\s*y(a|ou)|later|take\s*care|good\s?night)[\s!.,]*$/i;

/** "Show me everything you've got" — answered from the catalogue, no model. */
const BROWSE_INTENT =
  /\b(what|which|list|show|browse|see|all|any)\b[^?]*\b(tools?|utilities|features|offer|have|do you do|available)\b|^\s*(tools?|help|menu|options)\s*\??$/i;

/** Questions about SmartGen's own pages rather than its tools. */
const OUR_PAGE_INTENT = /\b(your|smartgen'?s|the site'?s|this site'?s)\b/i;

const OFF_TOPIC_REPLY = `I'm the SmartGen assistant, so I can only help with SmartGen Tools — our ${SITE.toolCount} free utilities, how they work, privacy, or where to find something on the site.

Try asking me things like "how do I compress an image?", "do you have an SEO audit tool?", or "is my data safe?"`;

const ALL_TOOLS_SOURCE = {
  id: 'all-tools',
  title: `All ${SITE.toolCount} SmartGen tools`,
  url: SITE.tools,
  category: 'Directory',
  description: 'Browse every tool by category.',
};

/**
 * @param {object} input
 * @param {string} input.message
 * @param {Array<{role:'user'|'assistant', content:string}>} [input.history]
 * @param {string} [input.page]  path the visitor is currently on
 * @param {object} env
 */
export async function answerQuestion(input, env) {
  const message = String(input.message || '').trim().slice(0, MAX_MESSAGE_CHARS);
  if (!message) {
    return reply('Ask me anything about SmartGen Tools.', { kind: 'empty' });
  }

  const hits = searchKnowledge(message);
  const looksLikeSiteQuestion = SITE_INTENT.test(message);
  const weakRetrieval = hits.topScore < MIN_SCORE;

  // ---- conversational noise: greetings, thanks, farewells, "how are you" -
  // Gated on weak retrieval so a real question that happens to open with "hi"
  // (e.g. "hi, how do I compress an image") still gets answered properly —
  // that query's score comes from "compress"/"image", well above the floor.
  if (weakRetrieval) {
    if (SELF_REFERENTIAL_INTENT.test(message)) {
      return reply(
        "I'm the SmartGen AI Assistant — software, not a person, but I know this site well. What are you trying to do? I can point you at the right tool.",
        { kind: 'small_talk', followUps: defaultFollowUps() }
      );
    }
    if (FAREWELL_INTENT.test(message)) {
      return reply('Take care! Come back anytime you need a free tool. 👋', {
        kind: 'small_talk',
        followUps: [],
      });
    }
    if (THANKS_INTENT.test(message)) {
      return reply("You're welcome! Let me know if you need help finding anything else.", {
        kind: 'small_talk',
        followUps: defaultFollowUps(),
      });
    }
    if (SMALL_TALK_INTENT.test(message)) {
      return reply(
        `👋 Hi there! I'm doing well, thanks for asking. I'm here to help you find the right tool among our ${SITE.toolCount} free utilities — what are you working on?`,
        { kind: 'small_talk', followUps: defaultFollowUps() }
      );
    }
  }

  // ---- "who built/runs this?" — answer with the real founder, not the
  // catalogue. Checked before SITE_INTENT's generic fallback, which would
  // otherwise catch the same "who built|made|owns|runs" wording and dump the
  // tool list on someone who asked a simple factual question.
  if (WHO_BUILT_INTENT.test(message)) {
    return reply(
      `SmartGen is built by **${SITE.founder}** and operated by **${SITE.operator}**. It's a privacy-first platform with ${SITE.toolCount} free tools — no login required, everything runs in your browser.`,
      { kind: 'about', sources: [ALL_TOOLS_SOURCE], followUps: defaultFollowUps() }
    );
  }

  // ---- "what is smartgen?" — its own intent; see ABOUT_INTENT for why ----
  if (ABOUT_INTENT.test(message)) {
    // Raw FAQS entries (unlike the scored documents searchKnowledge returns)
    // carry the text in `answer`, not `body` — easy to mix up between the two.
    const about = FAQS.find((f) => /^what is smartgen\??$/i.test(f.question.trim()));
    return reply(about ? about.answer : catalogueOverview(), {
      kind: 'about',
      sources: [ALL_TOOLS_SOURCE],
      followUps: ['What tools do you have?', 'Is SmartGen really free?', 'Is my data safe?'],
    });
  }

  // ---- "what have you got?" is answered from the catalogue --------------
  if (BROWSE_INTENT.test(message) && hits.topScore < 150) {
    return reply(catalogueOverview(), {
      kind: 'catalogue',
      sources: [ALL_TOOLS_SOURCE],
      followUps: ['Do you have an SEO audit tool?', 'How do I compress an image?', 'Is my data safe?'],
    });
  }

  // ---- scope gate, before we spend a single token -----------------------
  const onTopic = hits.topScore >= MIN_SCORE && hits.coverage >= MIN_COVERAGE;
  if (!onTopic && !looksLikeSiteQuestion) {
    return reply(OFF_TOPIC_REPLY, {
      kind: 'off_topic',
      followUps: defaultFollowUps(),
    });
  }

  // "Who built you?", "what's your pricing?" and friends: about us, but
  // matching no document. The catalogue tour is a better answer than
  // anything a model would improvise with an empty context block.
  if (!onTopic && looksLikeSiteQuestion) {
    return reply(catalogueOverview(), {
      kind: 'catalogue',
      sources: [ALL_TOOLS_SOURCE],
      followUps: defaultFollowUps(),
    });
  }

  // ---- exact FAQ hit: answer verbatim, no model call --------------------
  const faqHit = directFaqMatch(message, hits);
  if (faqHit) {
    return reply(faqHit.body, {
      kind: 'faq',
      sources: sourcesFor(message, hits, 3),
      followUps: followUpsFor(hits),
    });
  }

  // ---- grounded model answer -------------------------------------------
  if (!env.GEMINI_API_KEY) {
    return reply(fallbackAnswer(hits), {
      kind: 'retrieval_only',
      sources: sourcesFor(message, hits, 4),
      followUps: followUpsFor(hits),
    });
  }

  try {
    const generated = await callGemini(message, hits, input, env);
    if (!generated) throw new Error('empty generation');

    if (generated.onTopic === false) {
      return reply(OFF_TOPIC_REPLY, { kind: 'off_topic', followUps: defaultFollowUps() });
    }

    // The model names tool ids; we turn them into links. Anything it made up
    // resolves to null and is silently dropped.
    const resolved = (generated.toolIds || [])
      .map(resolveTool)
      .filter(Boolean)
      .slice(0, 4);

    const sources = resolved.length ? toolSources(resolved) : sourcesFor(message, hits, 3);

    return reply(generated.answer, {
      kind: 'ai',
      sources,
      followUps: generated.followUps?.length ? generated.followUps.slice(0, 3) : followUpsFor(hits),
    });
  } catch (err) {
    // A model outage must not leave the visitor with nothing — retrieval alone
    // still answers "which tool do I need?" perfectly well.
    return reply(fallbackAnswer(hits), {
      kind: 'retrieval_fallback',
      sources: sourcesFor(message, hits, 4),
      followUps: followUpsFor(hits),
      note: err.message,
    });
  }
}

/* ------------------------------------------------------------- gemini */

async function callGemini(message, hits, input, env) {
  const model = env.CHAT_MODEL || DEFAULT_MODEL;
  const context = buildContextBlock(hits);
  const currentPage = typeof input.page === 'string' ? input.page.slice(0, 120) : '';

  const system = `You are the SmartGen AI Assistant on ${SITE.url}.

${siteFacts()}

SCOPE — this is absolute:
Answer ONLY questions about SmartGen Tools: our tools, how to use them, privacy,
pricing, the blog, the docs, the company, or where to find something on the site.
For anything else (general knowledge, coding help unrelated to our tools, news,
maths, other companies) set "onTopic" to false and leave "answer" empty.

GROUNDING — this is absolute:
The CONTEXT block below is the only source of truth about what exists on
SmartGen. Never mention a tool that is not in it. Never write a URL yourself —
instead put the tool's id in "toolIds" and the interface will render the real
link. If the context does not answer the question, say so plainly and point the
visitor at ${SITE.tools} or ${SITE.contact}.

STYLE:
- 2-4 sentences. Direct, warm, no filler, no "great question!".
- Lead with the answer, then the how.
- Name tools by their real title.
- If several tools fit, name the best one and mention the alternative.
- British/neutral English. Never mention Gemini, Google or that you are an LLM.

CONTEXT
${context || '(no matching entries found)'}
${currentPage ? `\nThe visitor is currently on: ${currentPage}` : ''}

Reply with JSON only:
{
  "onTopic": true,
  "answer": "your reply",
  "toolIds": ["exact-ids-from-context"],
  "followUps": ["short follow-up question the visitor might ask next"]
}`;

  const contents = [];
  for (const turn of (input.history || []).slice(-MAX_HISTORY_TURNS)) {
    const role = turn.role === 'assistant' ? 'model' : 'user';
    const text = String(turn.content || '').slice(0, MAX_MESSAGE_CHARS);
    if (text) contents.push({ role, parts: [{ text }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  // Header rather than ?key= so the secret never lands in a URL, where it
  // could end up in a log or an error message.
  const response = await fetch(endpointFor(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`gemini ${model} ${response.status}: ${(await response.text()).slice(0, 160)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const parsed = safeJson(text);
  if (!parsed) throw new Error('unparseable model response');

  return {
    onTopic: parsed.onTopic !== false,
    answer: String(parsed.answer || '').trim().slice(0, 1200),
    toolIds: Array.isArray(parsed.toolIds) ? parsed.toolIds.map(String) : [],
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.map((f) => String(f).slice(0, 80)).filter(Boolean)
      : [],
  };
}

function safeJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
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

/* -------------------------------------------------------- retrieval-only */

/**
 * Written answer assembled from retrieval alone. Used when Gemini is
 * unconfigured or unavailable — still genuinely useful, not an error message.
 */
function fallbackAnswer(hits) {
  const bestFaq = hits.faqs[0];
  const bestTool = hits.tools[0];

  // Only lead with an FAQ when it actually beats the tool match. "How do I
  // compress an image?" should name the Image Compressor, not a general
  // paragraph about client-side processing that happened to share a word.
  if (bestFaq && (!bestTool || bestFaq.score > bestTool.score)) {
    return bestFaq.body;
  }

  const strongTools = hits.tools.filter((t) => t.score >= MIN_SOURCE_SCORE);
  if (strongTools.length === 1) {
    const tool = strongTools[0];
    return `That sounds like our **${tool.title}** — ${tool.body} It's free and runs in your browser.`;
  }
  if (strongTools.length > 1) {
    const names = strongTools.slice(0, 3).map((t) => t.title);
    return `A few SmartGen tools cover that: **${names.join('**, **')}**. Pick whichever matches what you're doing — all of them are free and need no signup.`;
  }
  if (bestFaq) {
    return bestFaq.body;
  }
  if (hits.pages.length) {
    return `You'll find that on our ${hits.pages[0].title} page.`;
  }
  return `I couldn't find a clear match for that. Browse all ${SITE.toolCount} tools at ${SITE.tools}, or get in touch at ${SITE.contact} and we'll point you in the right direction.`;
}

/* ------------------------------------------------------------- helpers */

/**
 * Tools worth showing as links. A question like "is my data safe" retrieves a
 * weak top match; offering it as a suggestion would look like a non-sequitur,
 * so anything below the floor is dropped rather than padded in.
 */
function relevantTools(hits, limit) {
  return toolSources(hits.tools.filter((t) => t.score >= MIN_SOURCE_SCORE).slice(0, limit));
}

/**
 * Pick the links to show beneath an answer.
 *
 * "Where is your privacy policy?" must link to /privacy/, not to the Privacy
 * Policy Generator tool — the words overlap almost completely, so retrieval
 * alone cannot tell them apart. The possessive ("your", "SmartGen's") is the
 * signal that the visitor means our page rather than our tool.
 */
function sourcesFor(message, hits, limit) {
  const pages = hits.pages
    .filter((p) => p.score >= MIN_SOURCE_SCORE)
    .slice(0, 2)
    .map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      category: 'SmartGen page',
      description: p.body,
    }));

  const tools = relevantTools(hits, limit);

  if (OUR_PAGE_INTENT.test(message) && pages.length) {
    return [...pages, ...tools].slice(0, limit);
  }
  return [...tools, ...pages].slice(0, limit);
}

/** A short tour of the catalogue, built from the real category list. */
function catalogueOverview() {
  const byCategory = new Map();
  for (const category of SITE.categories) byCategory.set(category, 0);
  for (const tool of TOOLS) {
    byCategory.set(tool.category, (byCategory.get(tool.category) || 0) + 1);
  }

  // Lead with what people come for, not with whichever bucket happens to be
  // biggest — the HTML Code Library dwarfs the rest on count alone.
  const priority = [
    'SEO & Content',
    'Developer & Technical',
    'Daily Utilities & Calculators',
    'Marketing & Social Media',
    'HTML Code Library',
    'Resources',
  ];
  const rank = (name) => {
    const index = priority.indexOf(name);
    return index === -1 ? priority.length : index;
  };

  const lines = [...byCategory.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1])
    .map(([category, count]) => `- **${category}** — ${count} tools`)
    .join('\n');

  return `We have ${SITE.toolCount} free tools, all no-signup and most running entirely in your browser:

${lines}

Tell me what you're trying to do and I'll point you at the right one.`;
}

function toolSources(tools) {
  return tools.map((t) => ({
    id: t.id,
    title: t.title,
    url: t.url,
    category: t.category,
    description: t.body || t.description || '',
  }));
}

function followUpsFor(hits) {
  const suggestions = [];
  if (hits.tools[0]) suggestions.push(`How do I use the ${hits.tools[0].title}?`);
  if (hits.tools[1]) suggestions.push(`What is the ${hits.tools[1].title} for?`);
  suggestions.push('Is my data safe?');
  return suggestions.slice(0, 3);
}

function defaultFollowUps() {
  return ['What tools do you have?', 'Is SmartGen really free?', 'Is my data safe?'];
}

function reply(answer, extra = {}) {
  return {
    answer,
    sources: [],
    followUps: [],
    ...extra,
  };
}
