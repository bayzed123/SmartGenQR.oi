---
title: "API Reference"
description: "Reference documentation for SmartGen's internal JavaScript functions and data structures."
order: 1
category: "API Reference"
---

# API Reference

This page documents the core JavaScript functions and data structures used across the SmartGen platform. These are internal APIs — not a public REST API — since SmartGen is fully client-side.

## `app.js` — Global UI Controller

Located at `/assets/js/app.js`. Loaded on every page.

### `injectNavbar()`

Dynamically injects the site's top navigation bar into the page.

```javascript
injectNavbar();
```

**Behavior:**
- Fetches the shared navbar HTML template
- Inserts it into `<header id="main-header">`
- Attaches mobile menu toggle listeners

**When to use:** Call this once on `DOMContentLoaded` in any new page that needs the standard site header.

---

### `injectFooter()`

Injects the shared footer markup (links to Privacy, Terms, About, etc.).

```javascript
injectFooter();
```

**Behavior:**
- Fetches shared footer HTML
- Inserts it into `<footer id="main-footer">`

---

### `initTheme()`

Initializes light/dark theme toggling and persists user preference.

```javascript
initTheme();
```

**Behavior:**
- Reads saved theme from `localStorage`
- Applies `data-theme="dark"` or `data-theme="light"` to `<html>`
- Attaches click listener to `#theme-toggle` button

**Storage key:** `smartgen-theme`

---

## `search-data.js` — Tool Metadata Source

Located at `/assets/js/search-data.js`. A static JSON-like array containing metadata for every tool on the platform.

### Data Structure

```javascript
const toolsData = [
  {
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Generators",
    description: "Create custom QR codes instantly.",
    url: "/qr-code-generator/",
    tags: ["qr", "generator", "barcode"]
  },
  // ...more tools
];
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name of the tool |
| `slug` | string | URL-friendly identifier |
| `category` | string | Grouping used in navigation/search filters |
| `description` | string | Short one-line summary |
| `url` | string | Absolute path to the tool page |
| `tags` | string[] | Keywords used for search matching |

**Used by:** `search.js` (live search) and `related-tools.js` (recommendations).

---

## `related-tools.js` — Related Tool Suggestions

Located at `/assets/js/related-tools.js`. Runs on individual tool pages.

### `renderRelatedTools(currentSlug, limit = 4)`

```javascript
renderRelatedTools("qr-code-generator", 4);
```

**Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `currentSlug` | string | — | Slug of the currently viewed tool |
| `limit` | number | `4` | Max number of related tools to display |

**Behavior:**
1. Reads `toolsData` from `search-data.js`
2. Filters tools matching the current tool's `category` or shared `tags`
3. Excludes the current tool itself
4. Renders result cards into `#related-tools-container`

---

## `search.js` — Live Search UI

Located at `/assets/js/search.js`. Powers the homepage search bar.

### `initSearch(inputSelector, resultsSelector)`

```javascript
initSearch("#search-input", "#search-results");
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `inputSelector` | string | CSS selector for the search `<input>` |
| `resultsSelector` | string | CSS selector for the results container |

**Behavior:**
- Listens for `input` events on the search field
- Performs case-insensitive substring match against `toolsData` (`name`, `description`, `tags`)
- Renders matching results as clickable links
- Debounced at 150ms to avoid excessive re-renders

---

## `docs-build.js` — Documentation Build Script

Located at `/scripts/docs-build.js`. A Node.js CLI script (not browser-facing) that compiles `docs-posts/*.md` into static HTML.

### Front-Matter Schema

Every file in `docs-posts/` should include:

```yaml
---
title: "Page Title"        # required
description: "SEO summary" # optional
order: 1                    # optional, default 999
category: "Guides"          # optional, default "Guides"
---
```

### Custom Renderer Behavior

The script overrides two `marked.Renderer` methods:

| Method | Purpose |
|---|---|
| `renderer.heading` | Adds `id="slug"` to every `<h2>`/`<h3>` for anchor scrolling; collects headings into the "On This Page" TOC |
| `renderer.image` | Rewrites relative image paths to absolute `/assets/...`; auto-fixes pasted GitHub `/blob/` links |

### Output

For each `docs-posts/example.md`, generates:

```text
/docs/example/index.html
```

Plus a root `/docs/index.html` that redirects to the first doc (sorted by `order`).

---

## `build-blog.js` — Blog Build Script

Located at `/scripts/build-blog.js`. Same pattern as `docs-build.js`, but for `/blog-posts/` → `/blog/`. Also generates `/blog/blog.json` (used for blog search/listing) and updates `sitemap.xml` automatically.

---

## Need Help?

If you're integrating with any of these internal functions and something isn't behaving as documented, open an issue on [GitHub Discussions](https://github.com/bayzed123/SmartGenQR.oi/discussions/1).
