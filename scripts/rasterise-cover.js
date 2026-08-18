#!/usr/bin/env node
/**
 * Render an SVG cover to a 1200x630 JPEG.
 *
 * Why this exists: LinkedIn does not render SVG. Its native image upload
 * accepts raster formats only, so a post whose `image:` front matter points at
 * an .svg either shares with no thumbnail or, since the readiness gate in
 * scripts/share-new-blog-posts-linkedin.js started requiring a raster
 * content-type, does not share at all. Open Graph previews on Facebook, X and
 * Slack have the same limitation.
 *
 * The site keeps the SVG as the on-page cover -- it is sharper and a fraction
 * of the weight. This produces the social twin beside it.
 *
 *   node scripts/rasterise-cover.js blog-posts/images/foo.svg
 *   node scripts/rasterise-cover.js blog-posts/images/*.svg
 *
 * Writes <name>.jpg next to the source. Requires the Chromium that Playwright
 * already provides; no image library needed.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const WIDTH = 1200;
const HEIGHT = 630;
const QUALITY = 88;

const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function main() {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    console.error('usage: node scripts/rasterise-cover.js <cover.svg> [...]');
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: EXECUTABLE });
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  for (const input of inputs) {
    if (!fs.existsSync(input)) {
      console.error(`  skip (missing): ${input}`);
      continue;
    }
    const svg = fs.readFileSync(input, 'utf8');

    // The SVG is inlined rather than loaded via file:// so it cannot pull in
    // anything from disk, and the white ground keeps JPEG (which has no alpha)
    // from compositing transparent regions to black.
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <style>
         html,body{margin:0;padding:0;background:#fff;}
         svg{display:block;width:${WIDTH}px;height:${HEIGHT}px;}
       </style>
       ${svg}`,
      { waitUntil: 'load' },
    );
    await page.waitForTimeout(250); // let webfont fallbacks settle

    const out = input.replace(/\.svg$/i, '.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: QUALITY });

    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`  ${path.basename(out).padEnd(46)} ${kb.padStart(5)} KB`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
