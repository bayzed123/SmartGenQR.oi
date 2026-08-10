# Fix playbook

Platform-specific remediation for the checks that fail most often. Pick the
column that matches `report.site.generator`.

The `fix` string in each check result is the one-line version. This document is
what you expand it into so a developer can act without asking a follow-up.

---

## Authority & Technical

### `ssl-certificate` — no HTTPS
- **Any host on Cloudflare**: SSL/TLS → Overview → Full (strict), then Edge
  Certificates → Always Use HTTPS on.
- **Apache**: `Redirect permanent / https://example.com/` in the `:80` vhost.
- **Nginx**: `return 301 https://$host$request_uri;` in the `listen 80` server block.
- **WordPress**: after the redirect, update `siteurl` and `home` in Settings →
  General, then run a search-replace over `http://example.com` in post content.

### `preferred-version` — multiple hostnames return 200
The single highest-value fix in this category. Pick one canonical host, then:
- **Cloudflare**: Rules → Redirect Rules. `http.host eq "www.example.com"` →
  301 to `https://example.com/${http.request.uri.path}`.
- **Nginx**: a dedicated server block for the non-canonical host with a 301.
- **WordPress**: set both Settings → General URLs to the canonical form *after*
  the server-level redirect is in place, not before.

Verify with `curl -I` against all four variants: exactly one should return 200.

### `canonical-tag` — missing canonical
- **WordPress**: Yoast and Rank Math both emit this by default. If it is missing,
  a theme is stripping `wp_head()` or a second SEO plugin is conflicting — check
  `onsite-no-duplicate-plugins` in the same report.
- **Next.js**: `metadata.alternates.canonical` in the App Router, or a `<link>`
  in `next/head` for the Pages Router.
- **Static/Jekyll**: add `<link rel="canonical" href="{{ page.url | absolute_url }}">`
  to the layout head.

Always absolute, always self-referencing, one per page.

### `sitemap-link-present` / `robots-has-sitemap`
- **WordPress**: `/wp-sitemap.xml` ships with core; Yoast uses `/sitemap_index.xml`.
  Whichever is live, add `Sitemap: https://example.com/<that>` to robots.txt.
- **Shopify**: `/sitemap.xml` is automatic — only the robots.txt directive is
  usually missing (edit `robots.txt.liquid`).
- **Static sites**: generate at build time. This repo already ships
  `.github/workflows/auto-sitemap.yml` as a working example.

### `semantic-html-tags`
Replace the outer `div`s in the theme layout with `<header>`, `<nav>`, `<main>`,
`<article>`, `<footer>`. Exactly one `<main>` per page. This is a template edit,
not a per-page one.

### `open-graph-tags`
`og:title`, `og:description`, `og:image` (1200×630 PNG/JPG, absolute URL),
`og:url`. Yoast/Rank Math handle it in WordPress; Next.js uses
`metadata.openGraph`. Absolute URLs only — relative `og:image` values are
silently ignored by most crawlers.

---

## Schema markup

All four schema checks are satisfied by one JSON-LD block in the site head. Use
`@graph` so `Organization` and `WebSite` cross-reference cleanly:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Ltd",
      "url": "https://example.com/",
      "logo": "https://example.com/logo.png",
      "sameAs": ["https://twitter.com/example", "https://linkedin.com/company/example"],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-415-555-0142",
        "contactType": "customer support",
        "email": "hello@example.com"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#site",
      "url": "https://example.com/",
      "name": "Example",
      "publisher": { "@id": "https://example.com/#org" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://example.com/?s={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

`FAQPage` only goes on pages with **visible** Q&A. Marking up questions the
visitor cannot see is a structured-data spam violation and risks a manual action.

`SiteNavigationElement` lists the primary menu — one block, in the layout.

Validate at `search.google.com/test/rich-results` before shipping.

---

## E-E-A-T pages

These four checks — Privacy, Terms, About, Contact — are also the exact pages
AdSense reviewers look for, so fixing them serves two purposes.

Minimum viable versions:

- **Privacy Policy** — what you collect, why, who you share it with, how to
  request deletion. SmartGen's own `/privacy-policy-generator/` produces a
  usable starting draft.
- **Terms** — `/terms-conditions-generator/`.
- **About** — see the About section below; this is the page that moves the
  needle most.
- **Contact** — a real email on your own domain, a phone number, a physical
  address, and a form. Not a form alone.

Link all four from the footer of every page, not just the homepage.

**Authors/Team page**: one page per author, with a photo, credentials, and links
to their LinkedIn or professional profile. Then link each article byline to it.
For YMYL topics (health, finance, legal) this is close to mandatory.

**Editorial guidelines**: how you source, fact-check and correct. A single
honest page beats a long generic one.

---

## Footer E-E-A-T

Nine of the ten footer checks are satisfied by one well-built footer:

```
[Logo]  A 1–2 sentence description of what this site is.

Company · About · Contact · Careers          Legal · Privacy · Terms · Disclaimer · Sitemap

Example Ltd (registered in England, №12345678)
1200 Market Street, Suite 400, San Francisco, CA 94103
hello@example.com · +1 415 555 0142

[Twitter] [LinkedIn] [YouTube] [Instagram]   [DMCA badge]

© 2026 Example Ltd. All rights reserved.
```

- **Copyright year**: render it dynamically. In PHP, `date('Y')`; in JS,
  `new Date().getFullYear()`; at build time in a static generator.
- **Email**: on your own domain. A gmail.com address in the footer of a
  commercial site is itself a negative trust signal.
- **Address**: identical string to your Google Business Profile. Inconsistent
  NAP data undermines local rankings.
- **Parent company**: name the legal entity — "A product of Example Holdings Ltd."

---

## About Us page (9 premium checks)

Fixing this page alone typically moves the score more than any other single
page. Structure it in this order:

1. **Who We Are** — the people, with real photos. Not stock imagery.
2. **Our Story** — founding date, why it started, milestones with years.
   This is where "Experience" in E-E-A-T actually lives.
3. **What We Do** — services or products, stated plainly.
4. **Why Trust Us** — concrete numbers: years in business, customers served,
   certifications, awards. "Trusted by 4,000 businesses since 2014", not
   "we are passionate about quality".
5. **Social proof** — named testimonials with photos, review scores, award badges.
6. **Featured in** — outbound links to press mentions and partners. Real
   outbound links to authoritative sites are a positive signal, not a leak.
7. **Where to find us** — full postal address, matching the footer exactly.
8. **The legal entity** — registered name and company number.

Three or more genuine team/office photos satisfies `about-team-photos`. The
checker excludes anything whose filename, alt text or class contains `logo`,
`icon`, `badge`, `sprite` or `placeholder`.

---

## On-site cleanup

### `onsite-default-content` / `onsite-uncategorized`
Delete `/hello-world/` and `/sample-page/`, then return 410 (not 404) so Google
drops them faster. Rename the default category to a real topic and reassign
every post — a live `/category/uncategorized/` archive tells Google the site is
unmaintained.

### `onsite-no-duplicate-plugins`
Two SEO plugins emit two canonical tags and two sets of OG tags, and Google
picks arbitrarily. Two caching plugins produce cache corruption that is
extremely hard to debug. Pick one of each, deactivate *and delete* the other,
then purge all caches.

### `onsite-gtm-not-in-body`
The GTM `<script>` belongs in `<head>`, as high as possible. Only the
`<noscript>` iframe goes at the top of `<body>`. In WordPress, hook it to
`wp_head` rather than pasting into the theme footer.

### `onsite-no-staging-urls`
Run a proper search-replace (WP-CLI: `wp search-replace 'staging.example.com'
'example.com' --all-tables --precise`) rather than editing posts by hand —
staging URLs hide in serialised option values and menu items.

### `onsite-nav-not-nofollow`
`rel="nofollow"` on internal navigation blocks PageRank flowing through your own
site. Remove it from every menu and footer link. It is almost always a plugin
setting, not hand-written markup.

### `onsite-no-empty-hash-links`
`href="#"` on a dropdown toggle should be a `<button type="button">` with
`aria-expanded`. This fixes both the SEO check and a real accessibility bug.

---

## Core Web Vitals

### LCP above 2.5s
In rough order of payoff:
1. Serve the hero image as WebP/AVIF at the displayed size, with
   `fetchpriority="high"` and **no** `loading="lazy"`.
2. Preload the LCP resource: `<link rel="preload" as="image" href="…">`.
3. Inline critical CSS; defer the rest.
4. Self-host fonts with `font-display: swap` and preload the primary weight.
5. Cut TTFB — a CDN, or page caching if TTFB is above 800ms.

### CLS above 0.1
Set explicit `width`/`height` on every image and iframe. Reserve space for ad
slots and embeds with a fixed-height container. Load webfonts with `swap` plus
a metrics-matched fallback.

### INP above 200ms
Break up long tasks, debounce input handlers, and defer third-party scripts
until first interaction. This site's own lazy-GA pattern (see any tool page) is
a working example.
