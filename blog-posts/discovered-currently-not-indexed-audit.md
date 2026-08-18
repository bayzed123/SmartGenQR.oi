---
title: "Discovered — Currently Not Indexed: What 314 Inspected URLs Actually Showed"
seo_title: "Discovered - Currently Not Indexed: A Real Audit"
date: "2026-08-17"
author: "Sayad Md Bayezid Hosan"
description: "We inspected all 314 URLs on our own site through Google's URL Inspection API. Here is the real status breakdown, and which fixes actually mattered."
image: "https://smartgentools.com/blog-posts/images/index-coverage-audit-cover.svg"
tags: ["Technical SEO", "Google Search Console", "Indexing", "Crawl Budget", "URL Inspection API"]
category: "SEO Blog"
slug: "discovered-currently-not-indexed-314-url-audit"
---
> ✅ **Written by Sayad Md Bayezid Hosan** — Founder of SmartGen Tools | Last Updated: August 17, 2026

---

## Quick Answer

**"Discovered — currently not indexed" means Google knows your URL exists but has decided not to spend crawl budget on it yet.** It is not an error, and there is nothing broken to repair. When we inspected all 314 URLs on smartgentools.com, every single one of the 72 pages in this state was already in the sitemap, allowed by robots.txt, self-canonical, and returning HTTP 200. Nothing was blocking Google. Google simply was not convinced the pages were worth fetching.

That distinction matters, because almost every fix published for this status — resubmit the sitemap, check robots.txt, request indexing — assumes something is broken. On our site, nothing was. This article shows what we actually measured, and what separates the URLs Google indexed from the ones it left in the queue.

---

## 📖 Table of Contents

1. [Why we stopped guessing and inspected everything](#why-we-measured)
2. [The full status breakdown across 314 URLs](#the-breakdown)
3. [Separating real pages from intentional duplicates](#separating-duplicates)
4. [What all 72 un-indexed pages had in common](#what-they-had-in-common)
5. [The three findings that looked like bugs but were not](#false-alarms)
6. [What actually predicted indexing on our site](#what-predicted-indexing)
7. [How to run this audit on your own site](#how-to-run-it)
8. [The fixes worth doing, in order](#fixes-in-order)
9. [What we are still waiting on](#still-waiting)
10. [FAQ](#faq)

---

<h2 id="why-we-measured">Why we stopped guessing and inspected everything</h2>

The Search Console coverage report tells you how many URLs sit in each state. It does not easily tell you *which* URLs, and it will not tell you what those URLs have in common. We had a rough count of "many pages not indexed" and a pile of contradictory advice, which is a bad place to start.

So we inspected every indexable URL individually through the [URL Inspection API](https://developers.google.com/webmasters/search-console-api-v1/reference/urlInspection/index/inspect) and put the results in one table. 314 URLs, one API call each.

The first thing that came out of it was a correction to our own assumptions. We had believed 78 pages were missing canonical tags. They were not — every one of them had a correct canonical. Our detection script used a regular expression that assumed `rel="canonical"` appeared before `href` in the tag, and those files write attributes alphabetised, so `href` came first:

```html
<!-- What our regex expected -->
<link rel="canonical" href="https://example.com/page/">

<!-- What the files actually contained -->
<link href="https://example.com/page/" rel="canonical">
```

One regex assumption produced a 78-page phantom problem. If you take one thing from this article, let it be this: **verify the diagnosis before you act on it.** We nearly spent a day adding canonical tags to pages that already had them.

---

<h2 id="the-breakdown">The full status breakdown across 314 URLs</h2>

Here is the raw result, straight from the API, for every URL on the site that is not a redirect stub and not marked `noindex`:

| Coverage state | URLs | Share |
|---|---:|---:|
| Submitted and indexed | 187 | 59.6% |
| Discovered — currently not indexed | 72 | 22.9% |
| URL is unknown to Google | 51 | 16.2% |
| Crawled — currently not indexed | 1 | 0.3% |
| Duplicate, Google chose different canonical | 1 | 0.3% |
| Not found (404) | 1 | 0.3% |
| API error (transient 503) | 1 | 0.3% |

At first glance that looks alarming — 40% of the site is not in the index. But this raw table is misleading, and the reason it is misleading is the most useful part of the whole audit.

---

<h2 id="separating-duplicates">Separating real pages from intentional duplicates</h2>

Of those 314 URLs, **79 canonicalise to a different URL on purpose.** They are legacy addresses from an older URL structure, each pointing at its modern flat equivalent. We do not want them indexed. Google not indexing them is the system working correctly, not a problem to solve.

Filter them out and the picture changes completely:

| | Pages that should be indexed | Intentional duplicates |
|---|---:|---:|
| Total | 235 | 79 |
| Indexed | 135 | 52 |
| Discovered — not indexed | 72 | 0 |
| Unknown to Google | 24 | 27 |

**Two lessons sit in that table.**

First, the honest number is 135 of 235, not 187 of 314. Any coverage report you read without separating intentional duplicates from real pages will give you a number that is either too flattering or too frightening, depending on which way your duplicates fall.

Second — and this one surprised us — **52 of our intentional duplicates are indexed anyway.** Google crawled them before we added the canonical tags and has not re-crawled since. A canonical tag only takes effect at the next crawl. We will come back to why that matters.

---

<h2 id="what-they-had-in-common">What all 72 un-indexed pages had in common</h2>

This is the part that made the audit worth running. We took all 72 "discovered — currently not indexed" URLs and checked every technical cause the standard advice lists:

| Possible cause | Pages affected |
|---|---:|
| Missing from the sitemap | **0 of 72** |
| Blocked by robots.txt | **0 of 72** |
| Carrying a `noindex` tag | **0 of 72** |
| Canonicalising elsewhere | **0 of 72** |
| Returning anything other than HTTP 200 | **0 of 72** |
| Redirect chains | **0 of 72** |

Every single one was already in the sitemap, crawlable, indexable, self-canonical, and serving a 200. There was no technical fault to fix. Not one.

This is the finding that most "how to fix discovered not indexed" articles will not tell you, because it is not actionable in the way an article wants to be: **when the technical checks all pass, "discovered — currently not indexed" is Google telling you it does not rate the page highly enough to spend a crawl on.** Resubmitting the sitemap does nothing — the URL is already in it. Requesting indexing on 72 URLs is not possible; the quota is roughly ten per day and is meant for pages that meaningfully changed.

The lever is not the sitemap. It is whether the page deserves the crawl.

---

<h2 id="false-alarms">The three findings that looked like bugs but were not</h2>

Three results in the table looked like real faults and turned out not to be. Each one is a trap worth recognising, because chasing them wastes a day.

### 1. A 404 on a page that exists

`/trust-center/` reported **"Not found (404)"**. The page is live, returns 200, and is linked from the site. So why the 404?

Check `lastCrawlTime`. Google last crawled that URL on **4 June**. The page was first committed on **7 August**. Google is reporting a two-month-old observation of a URL that genuinely did not exist at the time. The status is accurate about the past and useless about the present.

> **Always read `lastCrawlTime` before you act on a coverage status.** A status is a record of the last crawl, not a live check. If the crawl predates your change, the status predates your change too.

### 2. Pages "unknown to Google" that we deliberately hid

27 URLs came back as **"URL is unknown to Google."** They are nested legacy pages that canonicalise to their flat counterparts and are deliberately excluded from the sitemap. Google never discovering them is the intended outcome. If we had "fixed" this by adding them to the sitemap, we would have created a duplicate-content problem out of a working one.

### 3. A canonical Google has not seen yet

Take one specific page: `/html-code-library/character-codes/html-heart-code/`. The API reported:

```
verdict:            PASS — "Submitted and indexed"
Google's canonical: itself
User canonical:     (empty)
Last crawled:       2026-07-02
```

Google says there is no user canonical. There is — we added it on **7 August**. Google last crawled on **2 July**. The tag is correct in the HTML and completely invisible to Google, and will stay invisible until the next crawl.

Here is the compounding problem: that page is excluded from the sitemap (correctly, because it canonicalises elsewhere), which means Google has *less* reason to re-crawl it, which means the canonical takes *longer* to register. Deliberately hiding a page slows down every future change you make to it. That is a real trade-off nobody warns you about.

---

<h2 id="what-predicted-indexing">What actually predicted indexing on our site</h2>

With all the technical explanations eliminated, we looked at what separated the 135 indexed pages from the 72 waiting ones. Two patterns held.

**Section, and therefore internal link depth.** Our un-indexed pages were not spread evenly:

| Section | Not indexed |
|---|---:|
| `/html-code-library/` | 77 |
| `/docs/` | 9 |
| `/blog/` | 8 |
| Root tool pages | 5 |
| `/paid-tools/` | 1 |

The library is a set of small, single-purpose pages reachable mostly from one hub index. The blog posts and root tools have contextual links pointing at them from articles Google already crawls regularly. The pattern is not subtle: **pages that only a hub page links to get crawled last.**

**Domain-level authority.** Across the same 90-day window, Search Console recorded 6,282 impressions, 11 clicks, and an impression-weighted average position of **74.4**, with 94% of impressions landing at position 51–200. A site whose typical page sits on page six is not a site Google spends generous crawl budget on. Crawl allocation and ranking come from the same underlying judgement about whether a domain is worth attention.

That is uncomfortable to write, but pretending otherwise would send you chasing markup fixes for a problem markup cannot reach.

---

<h2 id="how-to-run-it">How to run this audit on your own site</h2>

You do not need paid tools. The URL Inspection API is free with a Google Cloud service account added as a Search Console user.

**Quota:** 2,000 URLs per property per day, 600 per minute. Plenty for most sites.

The authentication is a standard service-account JWT. In Node, with no dependencies:

```js
const crypto = require('crypto');
const sa = require('./service-account.json');
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'RS256', typ: 'JWT' });
  const claim  = b64({
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  });
  const sig = crypto.createSign('RSA-SHA256')
    .update(`${header}.${claim}`).end()
    .sign(sa.private_key).toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${sig}`,
    }),
  });
  return (await res.json()).access_token;
}
```

Then inspect one URL at a time:

```js
async function inspect(accessToken, url) {
  const res = await fetch(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: 'sc-domain:example.com',
      }),
    },
  );
  const i = (await res.json()).inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict:      i.verdict,          // PASS / NEUTRAL / FAIL
    coverage:     i.coverageState,    // the human-readable reason
    robots:       i.robotsTxtState,
    googleCanon:  i.googleCanonical,
    userCanon:    i.userCanonical,
    lastCrawled:  i.lastCrawlTime,    // read this one carefully
    fetch:        i.pageFetchState,
  };
}
```

**Four things we learned the hard way running this:**

1. **Space the calls.** 300 ms between requests kept us comfortably inside the per-minute limit.
2. **Retry the 500s and 503s.** This endpoint throws transient errors. One retry after a short backoff cleared nearly all of them; one URL out of 314 failed permanently.
3. **Build your URL list from self-canonical pages only.** Include your intentional duplicates and you will get exactly the misleading 40%-not-indexed figure we started with.
4. **Store `lastCrawlTime` with every row.** Without it you cannot tell a live problem from a stale observation, which is the difference between the real findings and the false alarms above.

If you would rather not write the script, our free [SEO Audit Tool](https://smartgentools.com/seo-audit-tool/) runs the on-page half of this — canonicals, titles, headings, structured data and trust signals — in your browser with no signup.

---

<h2 id="fixes-in-order">The fixes worth doing, in order</h2>

Based on what the audit actually found, here is the honest priority order.

### Do these first — they are real and they are yours

**1. Stop submitting URLs Google will refuse.** We found six meta-refresh redirect stubs in our sitemap. Google crawls a submitted URL, finds a redirect, and files it under "Page with redirect" in the not-indexed report. Your sitemap should contain only self-canonical URLs that return 200. Nothing else.

**2. Never put `noindex` on a redirect stub that also declares a canonical.** When Google elects a canonical for a cluster, it applies *that URL's* indexing directives to the whole cluster. A `noindex` sitting on the URL Google picked can suppress the real page along with it. We had 13 stubs in this shape, and one of them was the canonical Google had chosen for a live 47 KB page.

**3. Add contextual internal links to the orphaned pages.** This is the only real lever on "discovered — currently not indexed" that is within your control. Not footer link dumps — links inside sentences, on pages Google already crawls regularly, that give a reader an actual reason to click.

### Do not bother

**Resubmitting the sitemap.** All 72 of our un-indexed URLs were already in it. Submitting an existing URL again communicates nothing new.

**Requesting indexing in bulk.** The quota is around ten URLs a day. Save it for pages that genuinely changed.

**Adding `changefreq` and `priority` to your sitemap.** Google [has said publicly](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping) it ignores both.

---

<h2 id="still-waiting">What we are still waiting on</h2>

We are publishing the fixes and the open questions together, because an SEO article that only reports wins is not much use to anyone.

Fixed and shipped: seven bad URLs removed from the sitemap, thirteen `noindex`/canonical conflicts resolved, one self-canonical pointing at its own `index.html` variant corrected, and two pages that shared an `<h1>` consolidated onto the one that actually earned impressions.

Not fixed, because it cannot be fixed with markup: 72 pages that Google has decided are not worth crawling. Our plan there is contextual internal links and genuinely better content on a small number of target pages, then re-running this exact audit in four weeks against the same 314 URLs.

We will publish that comparison whichever way it goes.

---

<h2 id="faq">FAQ</h2>

### How long does "discovered — currently not indexed" usually last?

There is no published timeline, and anyone quoting one is guessing. It ranges from days to indefinitely. A page can sit in this state permanently if Google never concludes it is worth crawling — that is a valid outcome, not a bug waiting to be fixed.

### Is "discovered — currently not indexed" a penalty?

No. It is a scheduling decision, not a manual action or an algorithmic demotion. Check **Security & Manual Actions** in Search Console if you want to rule out a penalty; it is a separate report entirely.

### What is the difference between "discovered" and "crawled — currently not indexed"?

**Discovered** means Google knows the URL exists but has not fetched it. **Crawled** means Google fetched the page, read it, and decided not to index it. Crawled-not-indexed is the more serious of the two, because Google has seen your content and passed. We had 72 of the first and 1 of the second — for us, the problem is getting Google to look, not what it finds when it does.

### Will more backlinks fix it?

They help, but indirectly. Links raise the domain's overall standing, which raises crawl allocation. There is no direct "link this page, get it crawled" mechanism, and a single link to a single page rarely moves it on its own.

### Does page speed affect indexing?

It affects crawl *rate*. If your server is slow, Googlebot backs off to avoid overloading it, and fewer pages get crawled per visit. On a static site served from a CDN this is rarely the constraint. Ours is static and hosted on GitHub Pages, so speed was not our bottleneck.

### Should I delete pages that stay un-indexed?

Only if they genuinely have no value to a reader. Deleting a page to improve a coverage percentage is optimising the report instead of the site. A better test: would a visitor be worse off if this page vanished? If yes, keep it and give it a reason to be crawled.

### Can I check index status without writing code?

Yes — the URL Inspection tool in Search Console does one URL at a time through the interface. The API only becomes worth the setup at maybe fifty URLs and up. Below that, inspect the important ones by hand.

---

## Key Takeaways

- **"Discovered — currently not indexed" is usually not a bug.** All 72 of ours were in the sitemap, crawlable, indexable, and returning 200. Nothing was broken.
- **Separate intentional duplicates before you count anything.** 79 of our 314 URLs canonicalise elsewhere on purpose. Including them turned a real 135-of-235 into a misleading 187-of-314.
- **Read `lastCrawlTime` on every result.** Two of our three scariest findings were stale observations of URLs that had since changed.
- **A canonical tag does nothing until the next crawl** — and excluding a page from your sitemap makes that crawl come later.
- **Verify the diagnosis before acting.** One wrong regex told us 78 pages were missing canonicals they already had.
- **The lever is internal links and page quality**, not sitemap resubmissions.

---

## Further Reading

- [Google Search Central: Page indexing report](https://support.google.com/webmasters/answer/7440203)
- [URL Inspection API reference](https://developers.google.com/webmasters/search-console-api-v1/reference/urlInspection/index/inspect)
- [Google on sitemaps, lastmod and ping](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
- [SmartGen SEO Audit Tool](https://smartgentools.com/seo-audit-tool/) — free on-page audit, no signup
- [SmartGen Sitemap Finder and Downloader](https://smartgentools.com/sitemap-finder-and-downloader/) — pull any site's sitemap and check what it actually contains

---

<!--AUTHOR_FOOTER-->

---
Read related :
- [Technical SEO Optimization: The Complete Guide](https://smartgentools.com/blog/technical-seo-optimization-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/)
- [The Ultimate Guide to Sitemaps](https://smartgentools.com/blog/advanced-sitemap-management-submission-auditing-and-error-fixing/)
- [On-Page SEO Optimization: The Complete Guide](https://smartgentools.com/blog/on-page-seo-optimization-the-complete-a-to-z-mega-guide-for-beginners-smartgen-blog/)
- [How to Optimize Your Google SERP Snippet](https://smartgentools.com/blog/google-serp-snippet-preview-tool-the-complete-guide-to-optimizing-your-search-appearance-in-2026/)

*This audit is part of the [SmartGen SEO series](https://smartgentools.com/blog/). Every number in it came from our own property — we ran the same checks on ourselves before recommending them to anyone else.*
