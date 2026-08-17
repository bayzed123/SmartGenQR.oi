const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext();
  await ctx.route('**/*', r => {
    const h = new URL(r.request().url()).hostname;
    return (h === '127.0.0.1' || h === 'localhost') ? r.continue() : r.abort();
  });
  for (const [url, w] of [['/terms/', 320], ['/html-code-library/', 320]]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: 800 });
    await p.goto('http://127.0.0.1:8099' + url, { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(800);
    const out = await p.evaluate((vw) => {
      const res = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        if (r.right > vw + 1 || r.left < -1) {
          res.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 60),
            left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
            sw: el.scrollWidth,
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45),
          });
        }
      });
      return res;
    }, w);
    console.log(`\n=== ${url} @ ${w}  (${out.length} overflowing)`);
    out.slice(0, 14).forEach(o =>
      console.log(`  <${o.tag}${o.id ? '#' + o.id : ''}${o.cls ? '.' + o.cls.split(/\s+/).join('.') : ''}>  L${o.left} R${o.right} w${o.w} sw${o.sw}  "${o.text}"`));
    await p.close();
  }
  await b.close();
})();
