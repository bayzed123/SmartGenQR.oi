/**
 * Lightweight HTML extraction.
 *
 * Workers have HTMLRewriter, but the audit needs ~70 different views of the
 * same document, so we parse once into a plain structure and let each check
 * read from it. Regex parsing is fine here: we are describing a page, not
 * rendering it, and every value is treated as untrusted text.
 */

const VOID_STRIP = /<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi;

export function parseDocument(html, baseUrl) {
  const doc = {
    html: html || '',
    baseUrl,
    lower: (html || '').toLowerCase(),
  };

  doc.head = sliceTag(doc.html, 'head');
  doc.body = sliceTag(doc.html, 'body') || doc.html;
  doc.footer = extractFooter(doc.html);
  doc.header = sliceTag(doc.html, 'header');
  doc.nav = collectTags(doc.html, 'nav').join('\n');

  doc.title = decodeEntities(textOf(match(doc.html, /<title[^>]*>([\s\S]*?)<\/title>/i)));
  doc.metas = parseMetas(doc.html);
  doc.links = parseAnchors(doc.html, baseUrl);
  doc.linkTags = parseLinkTags(doc.html, baseUrl);
  doc.images = parseImages(doc.html, baseUrl);
  doc.headings = parseHeadings(doc.html);
  doc.jsonLd = parseJsonLd(doc.html);
  doc.text = visibleText(doc.body);
  doc.footerText = visibleText(doc.footer);
  doc.wordCount = doc.text ? doc.text.split(/\s+/).filter(Boolean).length : 0;
  doc.forms = collectTags(doc.html, 'form');
  doc.inputs = [...doc.html.matchAll(/<input\b[^>]*>/gi)].map((m) => m[0]);
  doc.styleBlocks = [...doc.html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n');
  doc.scripts = [...doc.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m) => ({
    attrs: parseAttrs(m[1]),
    code: m[2],
  }));

  return doc;
}

/* ------------------------------------------------------------------ utils */

function match(str, re) {
  const m = str.match(re);
  return m ? m[1] : '';
}

function sliceTag(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  return match(html, re);
}

function collectTags(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
  return [...html.matchAll(re)].map((m) => m[0]);
}

/**
 * Prefer a real <footer>; fall back to elements that look like one, and as a
 * last resort the tail of the body (many themes still use a bare div).
 */
function extractFooter(html) {
  const semantic = collectTags(html, 'footer');
  if (semantic.length) return semantic.join('\n');

  const byRole = [
    ...html.matchAll(
      /<(div|section)\b[^>]*(?:id|class)\s*=\s*["'][^"']*\bfoot(?:er)?\b[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi
    ),
  ].map((m) => m[0]);
  if (byRole.length) return byRole.join('\n');

  const body = sliceTag(html, 'body') || html;
  return body.slice(Math.max(0, body.length - 6000));
}

export function parseAttrs(attrString) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(attrString || '')) !== null) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

function parseMetas(html) {
  const metas = [];
  for (const m of html.matchAll(/<meta\b([^>]*)>/gi)) {
    const attrs = parseAttrs(m[1]);
    metas.push({
      name: (attrs.name || '').toLowerCase(),
      property: (attrs.property || '').toLowerCase(),
      httpEquiv: (attrs['http-equiv'] || '').toLowerCase(),
      content: attrs.content || '',
      charset: attrs.charset || '',
    });
  }
  return metas;
}

export function metaContent(doc, key) {
  const k = key.toLowerCase();
  const hit = doc.metas.find((m) => m.name === k || m.property === k);
  return hit ? hit.content : '';
}

function absolutize(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function parseAnchors(html, baseUrl) {
  const links = [];
  let origin = '';
  try {
    origin = new URL(baseUrl).hostname.replace(/^www\./, '');
  } catch {
    /* ignore */
  }

  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = parseAttrs(m[1]);
    const raw = (attrs.href || '').trim();
    const abs = absolutize(raw, baseUrl);
    let host = '';
    try {
      host = abs ? new URL(abs).hostname.replace(/^www\./, '') : '';
    } catch {
      /* ignore */
    }
    links.push({
      raw,
      href: abs,
      host,
      external: Boolean(host && origin && host !== origin),
      text: visibleText(m[2]),
      html: m[2],
      rel: (attrs.rel || '').toLowerCase(),
      target: (attrs.target || '').toLowerCase(),
      className: (attrs.class || '').toLowerCase(),
      title: attrs.title || '',
      ariaLabel: attrs['aria-label'] || '',
      inFooter: false, // filled in by the crawler once the footer is known
    });
  }
  return links;
}

function parseLinkTags(html, baseUrl) {
  const tags = [];
  for (const m of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = parseAttrs(m[1]);
    tags.push({
      rel: (attrs.rel || '').toLowerCase(),
      href: attrs.href || '',
      abs: absolutize(attrs.href || '', baseUrl),
      type: (attrs.type || '').toLowerCase(),
      sizes: attrs.sizes || '',
      title: attrs.title || '',
    });
  }
  return tags;
}

function parseImages(html, baseUrl) {
  const images = [];
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = parseAttrs(m[1]);
    const src = attrs.src || attrs['data-src'] || attrs['data-lazy-src'] || '';
    images.push({
      src,
      abs: absolutize(src, baseUrl),
      alt: attrs.alt,
      hasAltAttr: Object.prototype.hasOwnProperty.call(attrs, 'alt'),
      className: (attrs.class || '').toLowerCase(),
      loading: (attrs.loading || '').toLowerCase(),
      width: attrs.width || '',
      height: attrs.height || '',
    });
  }
  return images;
}

function parseHeadings(html) {
  const headings = [];
  for (const m of html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)) {
    headings.push({
      level: Number(m[1]),
      text: visibleText(m[3]),
      index: m.index,
      attrs: parseAttrs(m[2]),
    });
  }
  return headings.sort((a, b) => a.index - b.index);
}

function parseJsonLd(html) {
  const blocks = [];
  for (const m of html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    const raw = m[1].trim().replace(/^<!--/, '').replace(/-->$/, '');
    try {
      const parsed = JSON.parse(raw);
      blocks.push(...flattenGraph(parsed));
    } catch {
      // Malformed JSON-LD still tells us the type they *tried* to use.
      const typeGuess = raw.match(/"@type"\s*:\s*"([^"]+)"/i);
      if (typeGuess) blocks.push({ '@type': typeGuess[1], __malformed: true });
    }
  }
  return blocks;
}

function flattenGraph(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => flattenGraph(n, out));
    return out;
  }
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  if (Array.isArray(node['@graph'])) flattenGraph(node['@graph'], out);
  return out;
}

/** True when any JSON-LD node (or microdata itemtype) declares `type`. */
export function hasSchemaType(doc, type) {
  const wanted = type.toLowerCase();
  const inJsonLd = doc.jsonLd.some((node) => {
    const t = node['@type'];
    if (!t) return false;
    return (Array.isArray(t) ? t : [t]).some(
      (v) => typeof v === 'string' && v.toLowerCase().replace(/^.*\//, '') === wanted
    );
  });
  if (inJsonLd) return true;
  return new RegExp(`itemtype\\s*=\\s*["']https?://schema\\.org/${type}["']`, 'i').test(doc.html);
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
};

export function decodeEntities(str) {
  if (!str) return '';
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, code) => {
    if (code[0] === '#') {
      const num =
        code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : full;
    }
    const key = code.toLowerCase();
    return ENTITIES[key] !== undefined ? ENTITIES[key] : full;
  });
}

/** Strip tags/scripts and collapse whitespace. */
export function visibleText(html) {
  if (!html) return '';
  return decodeEntities(
    html
      .replace(VOID_STRIP, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function textOf(html) {
  return visibleText(html);
}
