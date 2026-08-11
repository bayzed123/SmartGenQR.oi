#!/usr/bin/env node
/**
 * Generates the SmartGen chatbot's knowledge index for the Cloudflare Worker.
 *
 * Sources of truth stay where they already are:
 *   assets/js/search-data.js  → the tool catalogue
 *   data/faq.json             → policy / general Q&A
 *   sitemap.xml               → every public URL
 *
 * This script compiles them into one committed module the Worker imports, so
 * the bot never has to fetch the site to know what exists — and, critically,
 * so every URL it hands out comes from a real page rather than the model's
 * imagination.
 *
 * Run it after adding a tool:  npm run build-chatbot
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'backend/smartgen-platforms/src/knowledge/site-index.js');
const SITE = 'https://smartgentools.com';

/* --------------------------------------------------------------- tools */

function readTools() {
  const source = fs.readFileSync(path.join(ROOT, 'assets/js/search-data.js'), 'utf8');
  // The terminator is indented inconsistently in the source file, so match any
  // whitespace before the closing bracket rather than assuming column zero.
  const match = source.match(/const TOOLS_INDEX\s*=\s*(\[[\s\S]*?\n[ \t]*\];)/);
  if (!match) throw new Error('Could not find TOOLS_INDEX in assets/js/search-data.js');

  // The catalogue is a plain array literal; evaluate just that expression.
  const tools = new Function(`return ${match[1].replace(/;\s*$/, '')}`)();

  // search-data.js currently lists nine html-code-library entries twice (once
  // with an absolute URL, once relative) pointing at the same page. Keep the
  // first of each id so the bot never offers the same page twice.
  const seen = new Set();
  const deduped = [];
  const duplicates = [];
  for (const tool of tools) {
    if (seen.has(tool.id)) {
      duplicates.push(tool.id);
      continue;
    }
    seen.add(tool.id);
    deduped.push(tool);
  }
  if (duplicates.length) {
    console.warn(
      `  note: skipped ${duplicates.length} duplicate id(s) in search-data.js: ${duplicates.join(', ')}`
    );
  }

  return deduped.map((tool) => ({
    id: tool.id,
    title: tool.title,
    category: tool.category,
    description: tool.description,
    url: normalizeUrl(tool.url),
    keywords: Array.isArray(tool.keywords) ? tool.keywords : [],
    icon: tool.icon || '',
  }));
}

function normalizeUrl(url) {
  const clean = String(url || '').replace(/^\.\//, '/');
  return clean.startsWith('http') ? clean : `${SITE}${clean.startsWith('/') ? '' : '/'}${clean}`;
}

/* ----------------------------------------------------------------- faq */

function readFaqs() {
  const raw = fs.readFileSync(path.join(ROOT, 'data/faq.json'), 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`data/faq.json is not valid JSON: ${err.message}`);
  }
  return (parsed.faqs || []).map((faq) => ({
    id: faq.id,
    category: faq.category,
    question: faq.question,
    answer: faq.answer,
  }));
}

/* ------------------------------------------------------------- sitemap */

/**
 * Every public URL, grouped so the bot can answer "where is your X page?"
 * for things that are not tools — blog posts, docs, legal pages.
 */
function readSitemap() {
  const file = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(file)) return [];

  const xml = fs.readFileSync(file, 'utf8');
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

  return urls.map((url) => {
    const pathname = new URL(url).pathname;
    return {
      url,
      path: pathname,
      section: sectionFor(pathname),
      title: titleFor(pathname),
    };
  });
}

/**
 * Section names must match a whole path segment. Matching on a prefix would
 * file /privacy-policy-generator/ (a tool) under "legal", and the assistant
 * would then offer the generator when someone asks for our privacy policy.
 */
function sectionFor(pathname) {
  if (pathname === '/') return 'home';
  if (/^\/blog(\/|$)/.test(pathname)) return 'blog';
  if (/^\/docs(\/|$)/.test(pathname)) return 'docs';
  if (/^\/html-code-library(\/|$)/.test(pathname)) return 'html-library';
  if (/^\/(privacy|terms|disclaimer|cookies|smartgen-legal-info|trust-center|review)\/?$/.test(pathname))
    return 'legal';
  if (/^\/(about|contact|help-center|updates|tools)\/?$/.test(pathname)) return 'company';
  return 'tool';
}

function titleFor(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return 'SmartGen Home';
  return parts[parts.length - 1]
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------------------------------------------------------------- emit */

function main() {
  const tools = readTools();
  const faqs = readFaqs();
  const pages = readSitemap();

  const categories = [...new Set(tools.map((t) => t.category))].sort();

  // Non-tool pages only: the tool catalogue already describes the tools better
  // than a URL slug ever could. Cross-check against the catalogue as well, so a
  // tool can never leak in through a section misclassification.
  const toolPaths = new Set(tools.map((t) => new URL(t.url).pathname));
  const keyPages = pages.filter(
    (p) => p.section !== 'tool' && p.section !== 'blog' && !toolPaths.has(p.path)
  );
  const blogCount = pages.filter((p) => p.section === 'blog').length;

  const banner = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Regenerate with:  npm run build-chatbot
 *
 * Source files:
 *   assets/js/search-data.js  (tool catalogue)
 *   data/faq.json             (policy / general Q&A)
 *   sitemap.xml               (public URLs)
 */`;

  const body = `${banner}

export const SITE = ${JSON.stringify(
    {
      name: 'SmartGen',
      url: SITE,
      docs: 'https://smartgentools.com/docs/',
      blog: 'https://smartgentools.com/blog/',
      tools: 'https://smartgentools.com/tools/',
      contact: 'https://smartgentools.com/contact/',
      founder: 'Sayad Md Bayezid Hosan',
      operator: 'Connect with Bayezid',
      toolCount: tools.length,
      blogPostCount: blogCount,
      categories,
      // Content hash, not a timestamp. CI regenerates this file on every run
      // and fails the build if it differs from the committed version — a
      // wall-clock timestamp would differ on every single run regardless of
      // whether the actual tools/FAQs/pages changed, so the check could never
      // pass. Hashing the emitted data instead makes the file byte-identical
      // whenever the source content is byte-identical.
      sourceHash: crypto
        .createHash('sha256')
        .update(JSON.stringify({ tools, faqs, keyPages }))
        .digest('hex')
        .slice(0, 12),
    },
    null,
    2
  )};

export const TOOLS = ${JSON.stringify(tools, null, 2)};

export const FAQS = ${JSON.stringify(faqs, null, 2)};

/** Non-tool pages (legal, company, docs, HTML library) for "where is X?" questions. */
export const KEY_PAGES = ${JSON.stringify(keyPages, null, 2)};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, 'utf8');

  console.log(`✓ ${path.relative(ROOT, OUT)}`);
  console.log(`  ${tools.length} tools · ${faqs.length} FAQs · ${keyPages.length} key pages · ${blogCount} blog posts`);
  console.log(`  categories: ${categories.join(', ')}`);
}

main();
