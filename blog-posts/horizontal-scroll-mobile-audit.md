---
title: "Horizontal Scroll on Mobile: Five Real Causes Found Across 65 Measured Viewports"
seo_title: "Horizontal Scroll on Mobile: 5 Real Causes"
date: "2026-08-18"
author: "Sayad Md Bayezid Hosan"
description: "We measured 13 page templates at five widths and found five distinct causes of horizontal scroll. Here is how to locate the element and fix each one."
image: "https://smartgentools.com/blog-posts/images/horizontal-overflow-audit-cover.jpg"
tags: ["CSS", "Responsive Design", "Mobile Usability", "Technical SEO", "Core Web Vitals"]
category: "SEO Blog"
slug: "horizontal-scroll-mobile-five-causes-65-viewports"
---
> ✅ **Written by Sayad Md Bayezid Hosan** — Founder of SmartGen Tools | Last Updated: August 18, 2026

---

## Quick Answer

**Horizontal scroll on mobile is almost never caused by the element you are looking at.** It is caused by something further up the tree that cannot shrink — a grid column with a fixed floor, a flex child at its default `min-width: auto`, or a single unbreakable string of text.

We measured 13 page templates at five widths — 65 combinations — and found **five distinct causes**. Not one of them was visible by eyeballing the page. Every one was found by measuring `scrollWidth - clientWidth` and then asking the browser which element sat past the right edge.

The one-line diagnostic, paste into any console:

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth
```

Anything above `0` means the page scrolls sideways. This article shows how to find the culprit and fix each of the five causes.

---

## 📖 Table of Contents

1. [Why "it looks fine on my phone" is not a test](#not-a-test)
2. [The measurement setup](#measurement-setup)
3. [Finding the element that actually causes it](#finding-the-element)
4. [Cause 1: a grid column with a fixed floor](#cause-grid)
5. [Cause 2: a flex child that will not shrink](#cause-flex)
6. [Cause 3: an unbreakable string](#cause-unbreakable)
7. [Cause 4: nowrap on a block that contains a second line](#cause-nowrap)
8. [Cause 5: percentage width plus padding](#cause-boxsizing)
9. [Why 320px and not 375px](#why-320)
10. [Putting the check in CI](#ci-check)
11. [FAQ](#faq)

---

<h2 id="not-a-test">Why "it looks fine on my phone" is not a test</h2>

Three reasons opening the site on your own phone will miss this.

**Your phone is probably wide.** A modern flagship reports 390–430 CSS pixels. Plenty of real traffic arrives at 360, and the narrowest device still in meaningful circulation reports 320. A layout can be perfect at 412 and broken at 320.

**Overflow is often invisible.** If the element hanging past the right edge has no background and no border — a transparent wrapper, an off-canvas menu, an absolutely positioned decoration — you see nothing. The page just feels slightly loose, and swiping left reveals a strip of empty background.

**Your eye is not a measuring instrument.** A 5px overflow is real, breaks the page, and is impossible to spot by looking. Our worst offender was 487px, but the ones that survived longest were 5px and 16px, precisely because nobody could see them.

Google's mobile usability signals treat content wider than the screen as a defect, and it is a genuine usability failure regardless: horizontal scroll fights the reader's thumb on every vertical swipe.

---

<h2 id="measurement-setup">The measurement setup</h2>

The whole test is one number per page per width. If `scrollWidth` exceeds `clientWidth` on the root element, the document is wider than the viewport.

```js
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Third-party requests -- fonts, ads, analytics -- contribute nothing to
  // layout width, and in a sandboxed environment each one stalls until it
  // times out. Blocking them took our run from twenty minutes to two.
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' ? route.continue() : route.abort();
  });

  const pages  = ['/', '/blog/', '/about/', '/contact/', '/terms/'];
  const widths = [320, 360, 412, 768, 1024];
  let failures = 0;

  for (const path of pages) {
    const row = [];
    for (const width of widths) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 800 });
      await page.goto('http://127.0.0.1:8099' + path, { waitUntil: 'load' });
      await page.waitForTimeout(900);          // let late layout settle

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      );

      row.push(overflow > 1 ? `+${overflow}` : 'ok');
      if (overflow > 1) failures++;
      await page.close();
    }
    console.log(path.padEnd(28) + row.map((v) => v.padStart(7)).join(''));
  }

  console.log(`\noverflow: ${failures} / ${pages.length * widths.length}`);
  await browser.close();
})();
```

**Test one page per template, not every page.** Thirteen templates covered our whole site — homepage, blog index, an article, three tool layouts, docs, and the static pages. Pages sharing a template share their bugs.

Our first run came back like this:

```
page                    320    360    412    768   1024
/                        ok     ok     ok     ok     ok
/docs/quickstart/      +487   +447   +395    +39    +93
/terms/                 +45     +5     ok     ok     ok
/html-code-library/     +36     ok     ok     ok     ok
```

Note `/terms/` at 360: **+5 pixels**. That is a real defect and there is no chance of seeing it by looking.

---

<h2 id="finding-the-element">Finding the element that actually causes it</h2>

Knowing the page overflows is half the job. This walks every element and reports the ones whose right edge is past the viewport:

```js
const culprits = await page.evaluate((viewportWidth) => {
  const found = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    if (r.right > viewportWidth + 1) {
      const cs = getComputedStyle(el);
      found.push({
        tag:   el.tagName.toLowerCase(),
        id:    el.id,
        cls:   String(el.className || '').slice(0, 40),
        right: Math.round(r.right),
        width: Math.round(r.width),
        position: cs.position,
        overflowX: cs.overflowX,
        text: (el.textContent || '').trim().slice(0, 40),
      });
    }
  });
  return found;
}, width);
```

**Two things to know when reading its output.**

Filter to `r.right > viewportWidth`, not `r.left < 0`. In a left-to-right document, an element hanging off the *left* edge does not create scrollable width. Our first version flagged the off-canvas mobile menu sitting at `left: -281px` — noise, every time.

An element inside a scroll container is a false positive. If an ancestor has `overflow-x: auto`, its children legitimately extend beyond the viewport; they scroll inside their own box and the document stays put. Check the ancestors before chasing a child.

---

<h2 id="cause-grid">Cause 1: a grid column with a fixed floor</h2>

**Our count: 139 rules.** This was by far the most common, and the most invisible.

```css
/* Looks responsive. Is not. */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

`auto-fit` handles the *number* of columns beautifully. But `minmax(300px, 1fr)` sets a hard floor: each column is at least 300px wide no matter what. Inside a 320px viewport with 16px of padding either side you have 288px of usable space, so a 300px column overflows by 12px plus the gap. The grid collapses to one column exactly as designed — and that single column is still too wide.

**The fix** is to make the floor conditional:

```css
grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
```

`min(100%, 300px)` resolves to 300px when there is room and to 100% of the container when there is not. Above 300px nothing changes; below it, the column shrinks instead of overflowing. It is a drop-in replacement.

You can find every instance with one search:

```bash
grep -rn "minmax([0-9]" assets/css/
```

**Do not fix this by forcing one column at a breakpoint.** We had `grid-template-columns: 1fr` at `max-width: 768px` in places, which hides the overflow at 768 and leaves it at 320 — and throws away the two-column layout on a 700px tablet that could easily hold it. `min()` fixes the actual bug at every width.

---

<h2 id="cause-flex">Cause 2: a flex child that will not shrink</h2>

**Our worst case: +487px on the docs template.**

This is the least intuitive rule in flexbox. A flex item's default is `min-width: auto`, which means *do not shrink below my content's intrinsic minimum size*. So `flex: 1` does not guarantee the item will shrink — if it contains a wide table, a long code block, or an ad slot with a fixed width, the item refuses to go below that and pushes the container open.

```css
/* The item still overflows */
.main-content { flex: 1; }

/* Now it can actually shrink */
.main-content { flex: 1; min-width: 0; }
```

`min-width: 0` overrides the intrinsic floor and lets the item shrink to its share of the container. Its own children then handle their own overflow — which is why the second half matters:

```css
/* Wide children scroll inside their own box, not the document */
.main-content pre,
.main-content table { overflow-x: auto; max-width: 100%; }
.main-content img   { max-width: 100%; height: auto; }
.main-content .ad-slot { max-width: 100%; overflow: hidden; }
```

The docs template had three compounding causes: the flex child at `min-width: auto`, an uncapped 728px ad slot, and a table-of-contents sidebar that stayed visible far below the width it needed. The TOC now hides under 1100px, where it stopped being usable anyway.

> **Rule of thumb:** any flex or grid child that contains user-generated or variable-width content wants `min-width: 0`. It costs nothing when there is room.

---

<h2 id="cause-unbreakable">Cause 3: an unbreakable string</h2>

**Our case: +45px at 320, +5px at 360.**

Our terms page listed its contact link with the bare URL as the anchor text:

```html
<a href="/contact/">https://smartgentools.com/contact/</a>
```

That string is 244px wide and contains no space, hyphen or other break opportunity. Text wrapping needs somewhere to break; with none available, the word sets the paragraph's minimum width, and the paragraph sets the page's.

The same thing happens with long code tokens, API keys, hashes, file paths and — very often — German compound nouns.

```css
p, li, dd, td, th, blockquote, figcaption {
  overflow-wrap: break-word;
}
```

**Use `break-word`, not `anywhere`.** `break-word` only splits a word that genuinely cannot fit on a line of its own, so ordinary prose is untouched. `overflow-wrap: anywhere` also affects the intrinsic minimum size calculation and will break words in flex and grid contexts where you did not want it.

For code specifically, choose per element:

```css
code, kbd, samp { overflow-wrap: break-word; }   /* inline: wrap it   */
pre { overflow-x: auto; max-width: 100%; }       /* block: scroll it  */
```

Inline code inside a sentence should wrap. A block of code should scroll inside its own box — breaking lines mid-token makes it unreadable and unusable to copy.

---

<h2 id="cause-nowrap">Cause 4: nowrap on a block that contains a second line</h2>

**Our case: +36px at 320.**

Our code library header had a brand block written like this:

```html
<a class="brand" href="/">
  <span class="mark">…</span>
  <span>SmartGen<span class="sub">Free copy-paste HTML &amp; CSS snippets</span></span>
</a>
```

```css
.brand { white-space: nowrap; }
.brand .sub { display: block; font-size: 0.68rem; }
```

`white-space: nowrap` on the brand keeps the wordmark and icon on one line — sensible. But it inherits, and `.sub` is a `display: block` child *inside* it. So the tagline could not wrap either. A 35-character tagline that must render on one line put a ~200px floor under the header, and at 320px the GitHub button was pushed off the edge.

The fix is to decide what the small screen actually needs:

```css
@media (max-width: 620px) {
  .brand { min-width: 0; }
  .brand .sub { display: none; }   /* the wordmark identifies the site */
}
```

**The general lesson:** `white-space: nowrap` on a container affects every descendant. Put it on the specific element that must not wrap — usually a single `<span>` — never on a wrapper that contains other text.

The same page taught us a related one earlier. A header had to fit a 169px logo, a 32px gap and 99px of actions — 300px of content inside 272px of usable width, with the logo at `nowrap` so flex could not shrink it. Reclaiming the gutters and gaps got it back under, without hiding anything:

```css
@media (max-width: 480px) {
  .container      { padding: 0 1rem; }
  .header-content { gap: 0.75rem; }
  .header-actions { gap: 0.5rem; }
  .logo           { font-size: 1.05rem; min-width: 0; }
  .logo span      { overflow: hidden; text-overflow: ellipsis; }
}
```

---

<h2 id="cause-boxsizing">Cause 5: percentage width plus padding</h2>

The oldest bug in CSS, and it still appears in anything injected by JavaScript that does not inherit the page's reset.

```css
/* 100% + 40px of padding = 100% + 40px */
.cookie-banner { width: 100%; padding: 20px; }
```

Under the default `box-sizing: content-box`, padding is added *outside* the declared width. Our cookie banner and chatbot panel were both built in JS and both missed the global reset, so each was 40px wider than the viewport.

```css
.cookie-banner { box-sizing: border-box; }
```

If you inject DOM from JavaScript, set `box-sizing` explicitly on it. A global `*, *::before, *::after { box-sizing: border-box; }` in your stylesheet covers markup that exists at parse time, but anything appended later still gets it — *unless* the component ships its own scoped styles, which is exactly when people forget.

---

<h2 id="why-320">Why 320px and not 375px</h2>

We test at **320, 360, 412, 768 and 1024**, and each earns its place:

| Width | Why it is in the set |
|---:|---|
| **320** | The narrowest viewport still in real circulation. Also what you get on a 640px screen zoomed to 200%, which is an accessibility requirement, not an edge case. |
| **360** | Extremely common on mid-range Android. Our `/terms/` bug showed up here at just 5px. |
| **412** | Typical large Android. Catches layouts tuned only for iPhone widths. |
| **768** | The tablet boundary where two-column layouts start. Bugs cluster right at breakpoints. |
| **1024** | Small laptop. Catches the sidebar that needs more room than it admits. |

**320 is the one people skip and the one that finds the most.** Testing at 375 because that is your phone means every bug between 320 and 374 ships. And the zoom case makes 320 a genuine accessibility requirement — WCAG expects content to reflow at 400% zoom on a 1280px screen, which is 320 CSS pixels.

---

<h2 id="ci-check">Putting the check in CI</h2>

Fixing 65 viewports once is worth little if the next stylesheet edit reintroduces it. The measurement script exits non-zero when anything overflows, so it drops straight into a workflow:

```yaml
- name: Check for horizontal overflow
  run: |
    python3 -m http.server 8099 &
    sleep 2
    node scripts/checks/responsive-sweep.js
```

Two practical notes from running this in anger.

**Block third-party requests.** Fonts, ad scripts and analytics do not affect layout width, and on a restricted runner each one stalls until it times out. Blocking them took our run from twenty minutes to two.

**Allow a 1px tolerance.** Sub-pixel rounding produces a spurious 1px on some layouts. `overflow > 1` avoids a permanently red build over nothing real.

Our sweep now reports:

```
viewports with horizontal overflow: 0 / 65
```

---

<h2 id="faq">FAQ</h2>

### Why not just add `overflow-x: hidden` to the body?

Because it hides the symptom and leaves the bug. The element is still too wide — now the content is clipped and unreachable instead of scrollable, which is worse for the reader. It also silently breaks `position: sticky` in many browsers, since `overflow-x: hidden` makes the element a scroll container. Use it as a deliberate clip on a specific decorative element, never as a page-level fix.

### How do I find horizontal overflow without writing a script?

Paste this in the console to outline every element past the right edge:

```js
document.querySelectorAll('*').forEach(el => {
  if (el.getBoundingClientRect().right > document.documentElement.clientWidth + 1) {
    el.style.outline = '2px solid red';
    console.log(el);
  }
});
```

Chrome DevTools device toolbar with a custom 320px width will also show the scrollbar appear.

### Does horizontal scroll affect SEO?

Indirectly but really. Google evaluates mobile usability, and content wider than the screen is a recognised defect. More importantly it is a genuine usability problem — a page that slides sideways under the thumb on every vertical swipe gets abandoned, and the engagement signals follow.

### Is `min-width: 0` safe to apply everywhere?

On flex and grid children that hold variable-width content, yes — it only removes a floor that was rarely wanted. Be deliberate where an item genuinely must not shrink below a size, such as a fixed-width icon column; there, set an explicit `min-width` rather than leaving `auto` to guess.

### What about `100vw`?

`100vw` includes the vertical scrollbar's width on desktop browsers that reserve space for it, so `width: 100vw` on a page with a scrollbar is 15–17px wider than the viewport. Use `100%` for block-level width, or `100dvw` where support allows.

### My page only overflows after images load. Why?

An image with no `width` and `height` attributes has no intrinsic size until it loads, so the layout is computed twice — and the second computation can overflow. Set the attributes (which also prevents layout shift) and give images `max-width: 100%; height: auto;`.

---

## Key Takeaways

- **Measure, do not look.** `scrollWidth - clientWidth` is the whole test. Our smallest real bug was 5px and no human would have caught it.
- **`minmax(300px, 1fr)` is not responsive.** Use `minmax(min(100%, 300px), 1fr)`. This was 139 of our rules — by far the most common cause.
- **Flex children default to `min-width: auto`** and will not shrink below their content. Add `min-width: 0` to any that hold variable-width content.
- **`white-space: nowrap` inherits.** Put it on the element that must not wrap, never on a wrapper containing other text.
- **Test 320px.** It is the narrowest real device *and* the 200%-zoom accessibility case, and it finds bugs that 375 never will.
- **Never paper over it with `overflow-x: hidden`** — you trade a scrollable page for an unreachable one, and break `position: sticky` doing it.

---

## Further Reading

- [MDN: `minmax()`](https://developer.mozilla.org/en-US/docs/Web/CSS/minmax)
- [MDN: `min-width` and the automatic minimum size of flex items](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items#the_min-width_and_min-height_of_flex_items)
- [MDN: `overflow-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap)
- [WCAG 2.1: Reflow (1.4.10)](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
- [SmartGen Live HTML/CSS Previewer](https://smartgentools.com/html-code-preview/) — paste a layout and resize the preview to reproduce this in seconds
- [SmartGen SEO Audit Tool](https://smartgentools.com/seo-audit-tool/) — free on-page audit, no signup

---

<!--AUTHOR_FOOTER-->

---
Read related :
- [Discovered — Currently Not Indexed: What 314 Inspected URLs Showed](https://smartgentools.com/blog/discovered-currently-not-indexed-314-url-audit/)
- [Canonical Tags That Quietly De-Index Your Pages](https://smartgentools.com/blog/canonical-tag-conflicts-that-deindex-pages/)
- [Technical SEO Optimization: The Complete Guide](https://smartgentools.com/blog/technical-seo-optimization-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/)
- [The Complete Online Code Editor Guide](https://smartgentools.com/blog/live-html-css-js-previewer-the-complete-online-code-editor-guide-for-2026/)

*Every number here came from measuring smartgentools.com. The sweep script lives in [scripts/checks/](https://github.com/bayzed123/SmartGenQR.oi/tree/main/scripts/checks) — part of the [SmartGen SEO series](https://smartgentools.com/blog/).*
