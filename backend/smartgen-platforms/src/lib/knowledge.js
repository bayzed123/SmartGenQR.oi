/**
 * Retrieval over the SmartGen knowledge index.
 *
 * The chatbot's single most important property is that it never invents a tool
 * or a URL. That is enforced structurally, not by asking the model nicely:
 *
 *   1. We retrieve real entries from the committed site index.
 *   2. Only those entries go into the prompt.
 *   3. The model refers to them by id; the Worker resolves ids back to real
 *      URLs afterwards. An id the model made up simply resolves to nothing.
 *
 * No embeddings — a BM25-flavoured keyword score over 135 tools and 90 FAQs is
 * both accurate enough and fast enough to run inside the free plan's CPU budget.
 */

import { TOOLS, FAQS, KEY_PAGES, SITE } from '../knowledge/site-index.js';

/** Words too common in this corpus to carry signal. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'i', 'me', 'my', 'we',
  'you', 'your', 'it', 'its', 'to', 'of', 'in', 'on', 'at', 'for', 'with',
  'and', 'or', 'but', 'if', 'then', 'than', 'so', 'that', 'this', 'these',
  'those', 'there', 'here', 'what', 'which', 'who', 'whom', 'how', 'when',
  'where', 'why', 'can', 'could', 'would', 'should', 'will', 'shall', 'may',
  'might', 'must', 'about', 'from', 'into', 'by', 'as', 'not', 'no', 'yes',
  'please', 'help', 'want', 'need', 'use', 'using', 'get', 'give', 'tell',
  'smartgen', 'smartgentools', 'tool', 'tools', 'site', 'website', 'page',
]);

/** Everyday phrasings mapped onto the vocabulary the catalogue actually uses. */
const SYNONYMS = {
  qr: ['qr', 'barcode', 'scan'],
  barcode: ['qr'],
  password: ['password', 'passphrase', 'random'],
  seo: ['seo', 'search', 'ranking', 'audit', 'meta', 'keyword'],
  audit: ['audit', 'seo', 'check', 'analyze'],
  compress: ['compressor', 'compress', 'reduce', 'optimize', 'shrink'],
  shrink: ['compressor', 'compress'],
  resize: ['compressor', 'resize', 'image'],
  convert: ['converter', 'convert'],
  calculate: ['calculator', 'calculate'],
  calculator: ['calculator', 'calculate'],
  json: ['json', 'formatter', 'validator'],
  hash: ['hash', 'md5', 'sha'],
  encrypt: ['hash', 'encode', 'password'],
  photo: ['image', 'picture'],
  picture: ['image'],
  logo: ['image', 'favicon', 'color'],
  colour: ['color', 'palette'],
  color: ['color', 'palette', 'gradient'],
  font: ['font', 'text', 'typography'],
  whatsapp: ['whatsapp', 'chat', 'link'],
  youtube: ['youtube', 'thumbnail', 'video'],
  facebook: ['facebook', 'id'],
  sitemap: ['sitemap', 'xml'],
  robots: ['robots', 'txt'],
  schema: ['schema', 'structured', 'json-ld', 'markup'],
  privacy: ['privacy', 'policy', 'gdpr'],
  terms: ['terms', 'conditions', 'legal'],
  age: ['age', 'birthday', 'date'],
  loan: ['emi', 'loan', 'interest'],
  bmi: ['bmi', 'bmr', 'weight', 'health'],
  timer: ['pomodoro', 'timer', 'focus'],
  uuid: ['uuid', 'guid', 'identifier'],
  base64: ['base64', 'encode', 'decode'],
  url: ['url', 'encoder', 'decoder', 'link'],
  word: ['word', 'counter', 'character'],
  blog: ['blog', 'article', 'post', 'title'],
  price: ['price', 'free', 'cost', 'premium', 'paid'],
  cost: ['price', 'free', 'cost'],
  free: ['free', 'price', 'cost'],
};

/** The visitor's own meaningful words, with no synonym expansion. */
export function tokenizeRaw(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function tokenize(text) {
  const base = tokenizeRaw(text);

  // Stem first, then expand synonyms over stems as well as originals —
  // otherwise "colours" stems to "colour" but never reaches the colour→color
  // synonym and the palette tools stay hidden.
  const stemmed = new Set(base);
  for (const word of base) {
    if (word.endsWith('s') && word.length > 3) stemmed.add(word.slice(0, -1));
    if (word.endsWith('es') && word.length > 4) stemmed.add(word.slice(0, -2));
    if (word.endsWith('ing') && word.length > 5) stemmed.add(word.slice(0, -3));
  }

  const expanded = new Set(stemmed);
  for (const word of stemmed) {
    for (const synonym of SYNONYMS[word] || []) expanded.add(synonym);
  }
  return [...expanded];
}

/**
 * Terms that appear nowhere in the index at all. Used to judge whether a
 * question is about SmartGen — see `searchKnowledge().coverage`.
 */
function isKnownTerm(term) {
  return VOCABULARY.has(term);
}

/* ------------------------------------------------- searchable documents */

/**
 * Field-weighted documents, built once per isolate. Titles and keywords are
 * worth more than descriptions because they are what people actually type.
 */
const DOCUMENTS = (() => {
  const docs = [];

  for (const tool of TOOLS) {
    docs.push({
      kind: 'tool',
      id: tool.id,
      title: tool.title,
      url: tool.url,
      category: tool.category,
      body: tool.description,
      terms: weighted([
        [tool.title, 5],
        [tool.keywords.join(' '), 4],
        [tool.id.replace(/-/g, ' '), 3],
        [tool.description, 1],
        [tool.category, 1],
      ]),
    });
  }

  for (const faq of FAQS) {
    docs.push({
      kind: 'faq',
      id: `faq-${faq.id}`,
      title: faq.question,
      url: null,
      category: faq.category,
      body: faq.answer,
      terms: weighted([
        [faq.question, 4],
        [faq.category, 2],
        [faq.answer, 1],
      ]),
    });
  }

  for (const page of KEY_PAGES) {
    docs.push({
      kind: 'page',
      id: `page-${page.path}`,
      title: page.title,
      url: page.url,
      category: page.section,
      body: `${page.title} page`,
      terms: weighted([
        [page.title, 4],
        [page.path.replace(/[/-]/g, ' '), 3],
        [page.section, 2],
      ]),
    });
  }

  return docs;
})();

function weighted(fields) {
  const terms = new Map();
  for (const [text, weight] of fields) {
    for (const token of tokenize(text)) {
      terms.set(token, (terms.get(token) || 0) + weight);
    }
  }
  return terms;
}

/** Inverse document frequency, so "generator" counts for less than "pomodoro". */
const IDF = (() => {
  const counts = new Map();
  for (const doc of DOCUMENTS) {
    for (const term of doc.terms.keys()) counts.set(term, (counts.get(term) || 0) + 1);
  }
  const total = DOCUMENTS.length;
  const idf = new Map();
  for (const [term, count] of counts) idf.set(term, Math.log(1 + total / (1 + count)));
  return idf;
})();

/** Every term the site index knows about. */
const VOCABULARY = new Set(IDF.keys());

/* --------------------------------------------------------------- search */

/**
 * @returns {{tools:Array, faqs:Array, pages:Array, topScore:number,
 *            coverage:number, queryTerms:string[]}}
 *
 * `coverage` is the share of the question's meaningful words that exist
 * anywhere in the site index. It is the honest signal for "is this about
 * SmartGen?" — unlike the raw score, it does not grow with question length,
 * so one incidental word ("list", "code") cannot drag an unrelated question
 * over the line.
 */
export function searchKnowledge(query, options = {}) {
  const { toolLimit = 6, faqLimit = 4, pageLimit = 3 } = options;
  const rawTerms = tokenizeRaw(query);
  const queryTerms = tokenize(query);

  if (!queryTerms.length) {
    return { tools: [], faqs: [], pages: [], topScore: 0, coverage: 0, queryTerms };
  }

  // Measure coverage on the words the visitor actually typed, not on the
  // synonym expansion — expansions only ever add known vocabulary and would
  // make every question look on-topic.
  const known = rawTerms.filter(isKnownTerm).length;
  const coverage = rawTerms.length ? known / rawTerms.length : 0;

  const scored = [];
  for (const doc of DOCUMENTS) {
    let score = 0;
    let matched = 0;
    for (const term of queryTerms) {
      const weight = doc.terms.get(term);
      if (weight) {
        score += weight * (IDF.get(term) || 1);
        matched++;
      }
    }
    if (!score) continue;
    // Reward documents that cover more of the question, not just one rare word.
    score *= 1 + matched / queryTerms.length;
    scored.push({ ...doc, score, matched });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    tools: scored.filter((d) => d.kind === 'tool').slice(0, toolLimit),
    faqs: scored.filter((d) => d.kind === 'faq').slice(0, faqLimit),
    pages: scored.filter((d) => d.kind === 'page').slice(0, pageLimit),
    topScore: scored.length ? scored[0].score : 0,
    coverage,
    queryTerms,
  };
}

/** Resolve a tool id the model referenced back to a real catalogue entry. */
export function resolveTool(id) {
  if (!id) return null;
  const wanted = String(id).trim().toLowerCase();
  return TOOLS.find((t) => t.id === wanted) || null;
}

/** An exact/near-exact FAQ hit we can answer with zero model tokens. */
export function directFaqMatch(query, hits) {
  const best = hits.faqs[0];
  if (!best) return null;

  const queryTerms = new Set(tokenize(query));
  const questionTerms = tokenize(best.title);
  if (!questionTerms.length) return null;

  const overlap = questionTerms.filter((t) => queryTerms.has(t)).length / questionTerms.length;
  // Both directions must agree, otherwise a two-word question matches everything.
  const reverse = [...queryTerms].filter((t) => questionTerms.includes(t)).length / queryTerms.size;

  return overlap >= 0.8 && reverse >= 0.6 ? best : null;
}

/**
 * Compact grounding block. Only what retrieval found goes in — the model is
 * given no other facts to work from.
 */
export function buildContextBlock(hits) {
  const sections = [];

  if (hits.tools.length) {
    sections.push(
      'MATCHING TOOLS (refer to these by id):\n' +
        hits.tools
          .map((t) => `- id:${t.id} | ${t.title} | ${t.category} | ${t.body}`)
          .join('\n')
    );
  }

  if (hits.faqs.length) {
    sections.push(
      'RELEVANT FAQ ANSWERS:\n' +
        hits.faqs.map((f) => `Q: ${f.title}\nA: ${f.body}`).join('\n\n')
    );
  }

  if (hits.pages.length) {
    sections.push(
      'RELEVANT PAGES:\n' + hits.pages.map((p) => `- ${p.title} → ${p.url}`).join('\n')
    );
  }

  return sections.join('\n\n');
}

/** Stable facts that belong in every prompt. */
export function siteFacts() {
  return `SmartGen (${SITE.url}) is a privacy-first web utility platform.
- ${SITE.toolCount} free tools, no login, no signup, no credit card.
- Most tools run entirely client-side in the browser; nothing is uploaded.
- Categories: ${SITE.categories.join(', ')}.
- Blog: ${SITE.blog} (${SITE.blogPostCount} posts) · Docs: ${SITE.docs} · All tools: ${SITE.tools}
- Contact: ${SITE.contact}
- Built by ${SITE.founder}, operated by ${SITE.operator}.
- The SEO Audit Tool is the one tool with a paid tier: 27 checks free (3 audits/day, no signup), 72 checks in the $99 premium report.`;
}

export { TOOLS, FAQS, KEY_PAGES, SITE };
