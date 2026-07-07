---
title: "Installation"
description: "Detailed installation and environment setup instructions for SmartGen."
order: 2
category: "Guides"
---

# Installation

This page covers a more detailed installation walkthrough, including environment variables, folder setup, and troubleshooting common issues.

## System Requirements

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x |
| pnpm | 8.x |
| Git | 2.x |
| OS | Windows / macOS / Linux |

## Step 1 — Fork & Clone

If you plan to contribute, fork the repo first on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/SmartGenQR.oi.git
cd SmartGenQR.oi
```

Add the original repo as an upstream remote (recommended for contributors):

```bash
git remote add upstream https://github.com/bayzed123/SmartGenQR.oi.git
```

## Step 2 — Install Dependencies

```bash
pnpm install
```

This installs the following key packages used by the build pipeline:

- `marked` — Markdown → HTML conversion
- `gray-matter` — front-matter (metadata) parsing
- `slugify` — URL-friendly slug generation
- `vitest` — unit testing
- `eslint` + `prettier` — code quality tools

## Step 3 — Folder Structure You Should Know

```text
SmartGenQR.oi/
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── docs.css
│   ├── js/
│   │   ├── app.js
│   │   ├── docs.js
│   │   ├── search-data.js
│   │   ├── related-tools.js
│   │   └── search.js
│   └── images/
├── blog/                 ← generated output (do not edit directly)
├── blog-posts/            ← write blog content here (.md)
├── docs/                  ← generated output (do not edit directly)
├── docs-posts/             ← write docs content here (.md)
├── scripts/
│   ├── build-blog.js
│   └── docs-build.js
└── [tool-folder]/
    └── index.html
```

> ⚠️ **Never edit files inside `/blog/` or `/docs/` directly** — they are auto-generated and will be overwritten on the next build.

## Step 4 — Build the Project

```bash
pnpm build
```

Expected output:

```text
🚀 Starting SmartGen Blog Build...
✅ Found 40 blog post(s)
🎉 Blog build completed successfully!

🚀 Starting SmartGen Premium Docs Build...
✅ Built: /docs/getting-started/
🎉 Docs build completed successfully!
```

## Step 5 — Local Development Server

```bash
npx serve .
```

Visit `http://localhost:3000/docs/` to preview your changes.

## Common Issues

### ❌ `SyntaxError: Invalid or unexpected token` on build

This usually means a script file has a stray shebang (`#!/usr/bin/env node`) combined with a UTF-8 BOM encoding issue. Remove the shebang line, or re-save the file as **UTF-8 without BOM**.

### ❌ Images not showing on doc pages

Make sure image paths in your Markdown are **relative without a leading slash**:

```markdown
✅ ![Diagram](assets/images/docs/diagram.svg)
❌ ![Diagram](/assets/images/docs/diagram.svg)
```

### ❌ Table of Contents links don't scroll

Confirm you're using `##` or `###` headings in your Markdown — only H2/H3 headings are collected into the "On This Page" navigation.

## Environment Variables

SmartGen's static build currently requires **no environment variables** — everything runs client-side with no API keys or secrets needed. If you add server-side features in the future, document them here.

## Next Steps

Continue to the [API Reference](/docs/api-reference/) to learn about the internal JavaScript functions powering navigation, search, and theming.
