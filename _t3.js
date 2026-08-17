const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport:{width:412,height:1000} });
  const reqs=[];
  p.on('request',r=>{ if(/api\//.test(r.url())) reqs.push(r.method()+' '+r.url().split('?')[0]); });
  await p.goto('http://127.0.0.1:8099/blog/upwork-for-beginners-complete-guide-2026/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);

  // 1. no rating -> should show validation error
  await p.click('#reviewSubmitBtn');
  await p.waitForTimeout(400);
  console.log('no-rating validation :', await p.textContent('#reviewFeedback'));

  // 2. rating but empty comment
  await p.click('#reviewStarInput button[data-v="5"]');
  await p.waitForTimeout(200);
  const starsActive = await p.evaluate(()=>document.querySelectorAll('#reviewStarInput button.active').length);
  console.log('stars active after click 5 :', starsActive);
  await p.click('#reviewSubmitBtn');
  await p.waitForTimeout(400);
  console.log('empty-comment validation:', await p.textContent('#reviewFeedback'));

  // 3. full valid submit
  await p.fill('#reviewName','Test User');
  await p.fill('#reviewComment','Really useful guide, the proposal section helped a lot.');
  await p.click('#reviewSubmitBtn');
  await p.waitForTimeout(3000);
  console.log('valid submit result   :', await p.textContent('#reviewFeedback'));
  console.log('review list text      :', (await p.textContent('#reviewList')).trim().slice(0,80));
  console.log('\nAPI calls:'); reqs.forEach(r=>console.log('   ',r));
  await b.close();
})();
