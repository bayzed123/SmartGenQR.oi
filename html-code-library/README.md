# SmartGen HTML Code Library

A free, static library of 79 HTML/CSS generators, live editors, starter
templates and copy-paste reference pages -- built for [SmartGen](https://smartgentools.com).
Every page is plain HTML/CSS/JS: no build step, no server, no dependencies
beyond two Google Fonts. Deploys as-is to GitHub Pages.

**Live repo:** https://github.com/bayzed123/smartgen-horizon/tree/main

## Folder structure

```
html-code-library/
|-- index.html              Dashboard: search, category filter, all 79 tools
|-- <tool-name>.html        79 individual tool / reference pages
|-- favicon.svg
|-- robots.txt
|-- sitemap.xml
`-- assets/
    |-- css/style.css       One shared stylesheet -- every page links to this
    `-- js/Htmlapps.js      One shared script -- copy buttons, filters, nav
```

All internal links are relative (`gradient-generator.html`, not
`/gradient-generator.html`), so the site works identically whether it's
served from a domain root or a sub-path -- including GitHub Pages project
sites (`username.github.io/repo-name/`).

## Running it locally

No build step is required -- it's static HTML. Two easy options:

```bash
# Option 1: just open it
open index.html          # macOS
start index.html         # Windows

# Option 2: a tiny local server (recommended, avoids any file:// quirks)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Push the contents of this folder to your repository (root, or a
   `/docs` folder, or a dedicated branch -- GitHub Pages supports all three).
2. In the repo's **Settings -> Pages**, pick the branch/folder you used.
3. GitHub Pages serves `index.html` automatically at the repo's Pages URL.

No configuration file is needed -- there's no Jekyll front matter, no
`_config.yml`, nothing to break the build.

## How every page is generated

Every one of the 79 tool/reference pages, plus `index.html`, is produced by
a small Python build system in `/scripts` (not shipped in this folder --
it's the source, this folder is the output). The system is organised as:

- **`common.py`** -- the shared `<head>` (SEO/OG/JSON-LD), header, footer,
  the exact page wireframe (Breadcrumb -> Title -> Live Tool -> Code ->
  Preview -> How To Use -> Example -> Compatibility -> Related Pages), and
  small helpers (`steps_html`, `compat_table_html`, `related_html`, ...).
- **`pages_<category>.py`** (nine files) -- one Python function per page.
  Each function returns `(slug, meta, html)`. `meta` carries the SEO
  title/description/keywords and the list of related-page slugs.
- **`pages_index.py`** -- builds `index.html` from the same page registry,
  so the dashboard is always in sync with what's actually built (a link
  is only ever shown for a page that actually exists).
- **`main.py`** -- runs every page function twice: once to collect all
  slugs/titles/categories into a registry, once more to render the final
  HTML with correct "Related Pages" cross-links, then writes every file
  to disk.

### Adding a new tool page (easy future expansion)

1. Pick the `pages_<category>.py` file that matches the new tool's
   category (or start a new one for a new category, then add it to
   `common.CATEGORIES` and to the `MODULES` list in `main.py`).
2. Write a small function following the pattern already in that file --
   build the tool's control HTML, a JS `update()` function that writes
   into `#code-out` and `#preview-out` via `SGT.setCode(...)`, a list of
   `(step_title, step_body)` tuples, and an `Example Output` HTML snippet.
3. Call `common.finalize_tool_page(...)` (interactive tools) or
   `common.finalize_reference_page(...)` (static reference pages) and
   return its result.
4. Add the new function to that module's `PAGES` list.
5. Re-run `python3 main.py` -- the new page is written, `index.html`
   picks it up automatically, and any other page whose `related` list
   references its slug will now link to it live.

Every shared visual or behavioural change -- a new button style, a fix to
the copy-to-clipboard logic, a new footer link -- is made once in
`common.py`, `style.css` or `Htmlapps.js` and applies to all 79 pages the
next time `main.py` runs.

## SEO included on every page

- Unique `<title>`, meta description, meta keywords, canonical URL
- Open Graph + Twitter Card tags
- JSON-LD: `BreadcrumbList` on every page, `WebApplication` on interactive
  tools, `WebSite` + `SearchAction` on the homepage
- Semantic breadcrumb navigation matching the JSON-LD
- Internal "Related Pages" links, generated from each page's own
  hand-picked related-slug list (falls back to same-category pages)

## Status

This is a first test deployment (Beta v1.0.0) ahead of the main
smartgentools.com integration -- see the beta banner on the homepage.
