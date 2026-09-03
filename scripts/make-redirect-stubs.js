#!/usr/bin/env node
/**
 * Create redirect stubs for URLs that still receive real traffic but no longer
 * resolve.
 *
 * Where the list came from: every page path GA4 recorded over Jun 1 - Aug 31
 * with three or more views, checked against the files actually on main. 31 of
 * 101 were gone -- roughly 250 pageviews landing on a 404 in three months.
 * Almost all are posts and docs whose slug changed after the URL had already
 * been shared, so every LinkedIn post and inbound link pointing at the old
 * address now goes nowhere.
 *
 * Every mapping below was checked by hand against the live file tree. Fuzzy
 * matching proposed several confident wrong answers -- it wanted to send the
 * LinkedIn marketing guide to the Instagram one, and /sitemap.xml/ to a CSS
 * templates page -- so nothing here is machine-guessed.
 *
 * The stub shape matches the ones already in the repo: meta refresh, a
 * canonical pointing at the destination, and a JS location.replace. It
 * deliberately carries no `noindex` -- see
 * /blog/canonical-tag-conflicts-that-deindex-pages/ for why a noindex on a
 * URL Google may elect as the cluster canonical can suppress the real page.
 *
 *   node scripts/make-redirect-stubs.js          # write the stubs
 *   node scripts/make-redirect-stubs.js --dry    # list what it would write
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://smartgentools.com';

// dead path -> live destination. Views are the GA4 count for Jun 1 - Aug 31.
const REDIRECTS = [
  // Blog posts renamed after the URL was shared
  ['/blog/module-7-linkedin-marketing-the-complete-a-to-z-mega-guide-for-beginners/', '/blog/linkedin-marketing-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/', 19],
  ['/blog/module-8-pinterest-marketing-the-complete-a-to-z-mega-guide-for-beginners/', '/blog/pinterest-marketing-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/', 14],
  ['/blog/ui-ux-design-course-class-02-figma-essentials/', '/blog/uiux-design-course-class-02-figma-essentials/', 12],
  ['/blog/module-9-creating-a-wordpress-website-the-complete-a-to-z-mega-guide-for-beginners/', '/blog/creating-a-wordpress-website-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/', 7],
  ['/blog/module-9-youtube-marketing-the-complete-a-to-z-mega-guide-for-beginners/', '/blog/youtube-marketing-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/', 6],
  ['/blog/pyprojecttoml-guide-write-configure-and-fix-common-errors-2026/', '/blog/pyproject-toml-guide-write-configure-and-fix-common-pypi-errors2026/', 5],
  ['/blog/upwork-beginner-guide-2026-profile-connects-cover-letters-and-top-rated-tips/', '/blog/upwork-for-beginners-complete-guide-2026/', 5],
  ['/blog/module-10-search-engine-optimization-seo-the-complete-a-to-z-mega-guide-for-beginners/', '/blog/search-engine-optimization-seo-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/', 4],
  ['/blog/upwork-for-beginners-the-complete-guide-to-your-first-client-in-2026/', '/blog/upwork-for-beginners-complete-guide-2026/', 4],

  // Docs renamed. The portfolio set accounts for 83 views on its own.
  ['/docs/portfolio-website-deployment-blog-system-guide/', '/docs/portfolio-website-deployment-and-blog-system-guide/', 21],
  ['/docs/portfolio-getting-started/', '/docs/portfolio-website-getting-started-guide/', 18],
  ['/docs/portfolio-deployment-and-blog-system/', '/docs/portfolio-website-deployment-and-blog-system-guide/', 14],
  ['/docs/portfolio-customization/', '/docs/portfolio-website-customization-guide/', 13],
  ['/docs/portfolio-website-api-script-reference/', '/docs/portfolio-website-api-and-script-reference/', 8],
  ['/docs/portfolio-api-reference/', '/docs/portfolio-website-api-and-script-reference/', 5],
  ['/docs/portfolio-deployment/', '/docs/portfolio-website-deployment-and-blog-system-guide/', 4],

  // A whole legacy subtree from before the docs moved under /docs/
  ['/smartgendocshub/', '/docs/', 10],
  ['/smartgendocshub/docs/', '/docs/', 7],
  ['/smartgendocshub/docs/deployment.html', '/docs/', 6],
  ['/smartgendocshub/terms-conditions-generator/', '/terms-conditions-generator/', 4],

  // Renamed or misspelled tool URLs still being linked
  ['/base64-to-image-decoder/', '/base64-to-image/', 4],
  ['/dev-tools/', '/tools/', 4],
  ['/html-code-libery/', '/html-code-library/', 4],
];

/**
 * Deliberately NOT redirected, and why -- so nobody adds them later by
 * pattern-matching the list above:
 *
 *   /src/                      dev artifact, never a public page
 *   /tool-content-template/    internal scaffold
 *   /privacy-eeat-enhanced/    no current equivalent; /privacy/ is a different
 *                              document, so redirecting would be a lie
 *   /blog/testingandreview/    a test page that should stay gone
 *   /blog/understanding-seo-latest/  the source file exists but its title now
 *                              produces a different slug; needs an author
 *                              decision on which URL is canonical, not a guess
 *   /sitemap.xml/              malformed request, not a page
 *   *.png, *.md paths          asset requests, not pages
 */

function stub(from, to) {
  const url = `${SITE}${to}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page moved | SmartGen</title>
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${url}">
<script>location.replace(${JSON.stringify(url)});</script>
</head>
<body>
<p>This page has moved to <a href="${url}">${url}</a>.</p>
</body>
</html>
`;
}

const dry = process.argv.includes('--dry');
let written = 0, skipped = 0, missing = 0;

for (const [from, to, views] of REDIRECTS) {
  // Refuse to point at a destination that does not exist -- a redirect to a
  // 404 is worse than the 404 it replaces.
  const destFile = to.endsWith('.html') ? to.slice(1) : path.join(to.slice(1), 'index.html');
  if (!fs.existsSync(destFile)) {
    console.error(`  MISSING DEST  ${to}  (from ${from})`);
    missing++;
    continue;
  }

  const file = from.endsWith('.html') ? from.slice(1) : path.join(from.slice(1), 'index.html');
  if (fs.existsSync(file)) {
    console.log(`  exists, left alone   ${from}`);
    skipped++;
    continue;
  }

  if (!dry) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, stub(from, to));
  }
  console.log(`  ${String(views).padStart(3)} views  ${from}\n            -> ${to}`);
  written++;
}

console.log(`\n${dry ? 'would write' : 'wrote'} ${written} stub(s), skipped ${skipped} existing, ${missing} with a missing destination`);
if (missing) process.exitCode = 1;
