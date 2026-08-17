# On-page SEO and layout checks

Four scripts used to verify the site rather than change it. **Run them from
the repository root** — every path inside is relative to it.

```bash
python3 scripts/checks/seo-audit.py
```

## `seo-audit.py`

The on-page audit. Walks every `.html` in the repo and reports, per section,
how many pages fail each check:

| Check | Why it matters |
|---|---|
| `no h1` / `multiple h1` | One h1 per page tells Google what the page is about |
| `no h2` | A page with no subheadings has no structure to rank sections of |
| `heading skips` | `h2 -> h4` leaves a hole in the outline and breaks screen-reader navigation |
| `title >60` | Google truncates at roughly 60 characters, so the tail is wasted |
| `desc >160` / `desc <70` | Same truncation problem, plus a too-short description wastes SERP real estate |

Only *ranking targets* are counted. A page is excluded when it is a meta-refresh
redirect, carries `noindex`, or canonicalises to a different URL — counting a
canonicalised duplicate as a missing-h1 page is how an earlier version of this
script over-reported by 77.

It also strips site chrome (`#main-header`, footers, nav, sidebar/TOC) before
looking at headings, and strips `<script>`, `<textarea>`, `<template>` and
comments, which hold markup as *text* rather than DOM. `/html-code-preview/`
has a full `<html><body><h1>` inside a textarea; browsers see a string, and so
must the audit.

Full per-page rows are written to `/tmp/audit4.json` for follow-up queries.

## `responsive-sweep.js`

Loads a representative page from each template at 320 / 360 / 412 / 768 / 1024
and reports `document.scrollWidth - clientWidth`. Anything above 1px means the
page scrolls sideways on that screen — a Core Web Vitals and usability problem
Google measures directly.

Needs a static server on port 8099 first:

```bash
python3 -m http.server 8099 &
node scripts/checks/responsive-sweep.js
```

It aborts every third-party request. Fonts, ads and analytics do not affect
layout width, and in a sandboxed environment each one stalls until it times
out — that alone stretched a two-minute run to twenty.

## `overflow-culprits.js`

The follow-up to a failing sweep. For a given page and width it lists every
element whose right edge is past the viewport, with its computed position and
overflow, so the offending box is named instead of guessed at.

## `promote-headings.py`

Shifts a range of heading levels up by one inside a page's content region.

Note the constraint it is built around: it only ever rewrites the digit inside
an otherwise intact tag, and it masks `<script>`, `<textarea>`, `<template>`
and comments first. An earlier placeholder-swap approach consumed the opening
`<`, turning `<h4 style=…>` into the literal text `h4 style=…>` on five live
pages. Do not replace this with a simpler regex.
