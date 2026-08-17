const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pages = ['/', '/blog/', '/blog/upwork-for-beginners-complete-guide-2026/',
                 '/picture-url-generator/', '/serp-preview-tool/', '/tools/',
                 '/docs/quickstart-guide/', '/about/', '/contact/', '/terms/',
                 '/html-code-library/'];
  const widths = [320, 360, 412, 768, 1024];
  let fails = 0;
  console.log('page'.padEnd(52) + widths.map(w => String(w).padStart(7)).join(''));
  for (const url of pages) {
    const row = [];
    for (const w of widths) {
      const p = await b.newPage({ viewport: { width: w, height: 800 } });
      let v = '?';
      try {
        await p.goto('http://127.0.0.1:8099' + url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await p.waitForTimeout(1100);
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
