const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pages = ['/', '/blog/', '/blog/upwork-for-beginners-complete-guide-2026/',
                 '/picture-url-generator/', '/serp-preview-tool/', '/tools/',
                 '/docs/quickstart-guide/', '/about/', '/contact/', '/terms/',
                 '/html-code-library/', '/seo-audit-tool/', '/hash-generator/'];
  const widths = [320, 360, 412, 768, 1024];
  let fails = 0;
  const ctx = await b.newContext();
  // Third-party requests (fonts, ads, analytics) cannot resolve through the
  // sandbox proxy and each one stalls until it times out, which turned a
  // two-minute sweep into a twenty-minute one. They contribute nothing to
  // layout width, so block them and measure the page's own boxes.
  await ctx.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return (host === '127.0.0.1' || host === 'localhost') ? route.continue() : route.abort();
  });
  console.log('page'.padEnd(52) + widths.map(w => String(w).padStart(7)).join(''));
  for (const url of pages) {
    const row = [];
    for (const w of widths) {
      const p = await ctx.newPage();
      await p.setViewportSize({ width: w, height: 800 });
      let v = '?';
      try {
        await p.goto('http://127.0.0.1:8099' + url, { waitUntil: 'load', timeout: 20000 });
        await p.waitForTimeout(900);
        const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        v = o > 1 ? `+${o}` : 'ok';
        if (o > 1) fails++;
      } catch (e) { v = 'ERR'; }
      row.push(v.padStart(7));
      await p.close();
    }
    console.log(url.padEnd(52) + row.join(''));
  }
  console.log(`\nviewports with horizontal overflow: ${fails} / ${pages.length * widths.length}`);
  await b.close();
})();
