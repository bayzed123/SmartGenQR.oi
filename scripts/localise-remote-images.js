#!/usr/bin/env node
/**
 * Mirror externally hosted article images onto this repo and rewrite the
 * sources that point at them.
 *
 * Why: 24 blog images are served from i.ibb.co. That host is a third party we
 * do not control -- it can rate-limit, reorganise, or disappear, and every one
 * of those images is an extra DNS lookup plus TLS handshake on the critical
 * path of a page we want ranking. Self-hosted images also let the sitemap's
 * <image:image> entries point at URLs Google can attribute to this domain.
 *
 * What it deliberately does NOT do, per image-fix-map.md: it never swaps in a
 * *different* image. Each file is a byte-for-byte copy of what already renders,
 * so topic and visual content are unchanged by construction. Any URL that does
 * not return an image is reported and left alone -- a dead remote image stays
 * visibly dead rather than being silently replaced with something else.
 *
 * Only hand-authored sources are rewritten (markdown under blog-posts/ and
 * docs-posts/, plus the two static tool pages). Generated pages under blog/
 * and docs/ pick the change up on the next build.
 *
 * Run it where outbound HTTPS to the image host is available -- the sandboxed
 * dev container cannot reach i.ibb.co, which is why .github/workflows/
 * localise-images.yml exists.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DEST_DIR = path.join(ROOT, 'assets/images/blog-mirror');
const PUBLIC_PREFIX = '/assets/images/blog-mirror';
const URL_RE = /https?:\/\/i\.ibb\.co\/[A-Za-z0-9._~/-]+/g;

const EXT_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

/** Every file whose text we are allowed to rewrite. */
function sourceFiles() {
  const out = [];
  for (const dir of ['blog-posts', 'docs-posts']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith('.md')) out.push(path.join(abs, f));
    }
  }
  for (const f of ['schema-generator/index.html', 'blog-title-generator/index.html']) {
    const abs = path.join(ROOT, f);
    if (fs.existsSync(abs)) out.push(abs);
  }
  return out;
}

/**
 * A stable local name for a remote URL.
 *
 * The remote basename alone is not safe -- ibb serves several different
 * images called IMG-4288.webp -- so the name carries a short hash of the full
 * URL. Same URL always maps to the same file, which keeps the script
 * idempotent and the diff empty on a second run.
 */
function localName(url, contentType) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
  const remote = path.basename(new URL(url).pathname);
  const stem = remote.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
  const ext = EXT_BY_TYPE[(contentType || '').split(';')[0].trim()] || path.extname(remote).toLowerCase() || '.jpg';
  return `${stem}-${hash}${ext}`;
}

async function main() {
  const files = sourceFiles();
  const urls = new Set();
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(URL_RE)) urls.add(m[0]);
  }

  if (!urls.size) {
    console.log('No externally hosted article images left to mirror.');
    return;
  }
  console.log(`Found ${urls.size} remote image URL(s) across ${files.length} source file(s).`);

  fs.mkdirSync(DEST_DIR, { recursive: true });

  const mapping = new Map();
  const failures = [];

  for (const url of [...urls].sort()) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!type.startsWith('image/')) throw new Error(`content-type ${type || 'missing'}`);

      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length < 100) throw new Error(`suspiciously small (${bytes.length} bytes)`);

      const name = localName(url, type);
      fs.writeFileSync(path.join(DEST_DIR, name), bytes);
      mapping.set(url, `${PUBLIC_PREFIX}/${name}`);
      console.log(`  ok    ${(bytes.length / 1024).toFixed(0).padStart(5)} KB  ${name}  <-  ${url}`);
    } catch (err) {
      failures.push({ url, reason: err.message });
      console.log(`  FAIL  ${url}  (${err.message})`);
    }
  }

  let rewritten = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    let after = before;
    for (const [remote, local] of mapping) after = after.split(remote).join(local);
    if (after !== before) {
      fs.writeFileSync(file, after);
      rewritten++;
      console.log(`  rewrote ${path.relative(ROOT, file)}`);
    }
  }

  console.log(`\nmirrored ${mapping.size}/${urls.size}   rewrote ${rewritten} source file(s)`);

  if (failures.length) {
    console.error(`\n${failures.length} URL(s) could not be mirrored and were left pointing at the remote host:`);
    for (const f of failures) console.error(`  ${f.url}  -- ${f.reason}`);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
