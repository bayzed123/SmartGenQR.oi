---
slug: "getting-started"
title: "Getting Started"
description: "Get SmartGen running on your local machine in under 5 minutes."
order: 1
category: "Guides"
---
  # Getting Started

  Welcome to the **SmartGen** project! This guide will help you get your local environment ready for development in just a few minutes.

  ## What is SmartGen?

  SmartGen is a collection of free, privacy-first developer and marketing utilities — QR code generators, image compressors, text converters, and more — all processed **entirely in the browser**. No data ever touches a server.

  ## Prerequisites

  Before you begin, make sure you have the following installed:

  - **Node.js** 18 or higher
  - **pnpm** (package manager)
  - **Git**

  Check your versions:

  ```bash
  node -v
  pnpm -v
  git --version
  ```

  If `pnpm` isn't installed yet:

  ```bash
  npm install -g pnpm
  ```

  ## Clone the Repository

  ```bash
  git clone https://github.com/bayzed123/SmartGenQR.oi.git
  cd SmartGenQR.oi
  ```

  ## Install Dependencies

  ```bash
  pnpm install
  ```

  This installs everything needed for both the site and the build scripts (`marked`, `gray-matter`, `slugify`, etc.).

  ## Run the Build Scripts

  SmartGen generates its Blog and Docs sections as static HTML from Markdown source files.

  ```bash
  pnpm build
  ```

  This runs two scripts in sequence:

  ```bash
  npm run build-blog   # compiles blog-posts/*.md → /blog/
  npm run build-docs   # compiles docs-posts/*.md → /docs/
  ```

  ## Preview Locally

  Since SmartGen is a static site, you can preview it with any simple local server:

  ```bash
  npx serve .
  ```

  Then open `http://localhost:3000` in your browser.

  ## Project Architecture (Quick Overview)

  SmartGen follows a **modular, client-side-first architecture**:

  - Each tool lives in its own folder: `/[tool-folder]/index.html`
  - Global styles: `/assets/css/style.css`
  - Global scripts: `/assets/js/app.js`, `search-data.js`, `related-tools.js`, `search.js`
  - Blog & Docs are generated from Markdown via Node.js build scripts in `/scripts/`

  For a deeper dive, see the [Installation Guide](/docs/installation/) and [API Reference](/docs/api-reference/).

  ## Next Steps

  - ✅ Explore the `/[tool-folder]/` directories to see how individual tools are built
  - ✅ Read [`CONTRIBUTING.md`](https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md) before submitting a PR
  - ✅ Join the discussion on [GitHub Discussions](https://github.com/bayzed123/SmartGenQR.oi/discussions/1)

  Happy building! 🚀
next [Contributed](https://smartgentools.com/docs/contributor-guide/)