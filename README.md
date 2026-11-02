![SmartGen logo](assets/img/logo.svg)

# SmartGen — Privacy-first, Client-side Web Utility Platform

Welcome to SmartGen. This repository contains the full sources for the SmartGen client-side utilities website and the supporting build and deployment tooling. SmartGen is a privacy-first collection of 130+ browser-based utilities (QR generators, SEO & meta tools, JSON/XML formatters, developer helpers, and more). Everything runs in the browser — no server-side processing of user data.

Live site: [SmartGen Utility](https://smartgentools.com)

Badges

[![Auto Changelog Status](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/changelog.yml/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/changelog.yml)
[![Pages Build Deployment](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Overview

This repository contains the website source and automation for SmartGen.

Key contents

- `index.html` — site root and canonical homepage (REQUIRED at repo root for Pages deploy).
- `assets/` — images, css, icons, fonts and client resources.
- `scripts/` — build & generation scripts referenced by `package.json`.
- `backend/` — worker code, Cloudflare or other backend pieces (deploy via workflow).
- `.github/workflows/` — CI and automation pipelines (build, sitemap, link-checker, changelog, secret scans, worker deploy).
- `data/` — generated data (e.g., `data/changelog.json`).

Security reminder

Do NOT commit secrets, API keys, service account JSON, or private keys into this repository. The repo contains automated checks (`secret-scan.yml`, `security-audit.yml`) that will fail on high-confidence secrets. Use GitHub Secrets for CI-only credentials and never echo them into files served from the site.

Why README markers matter — DO NOT REMOVE

The automated link-checker workflow replaces only the content between the following exact markers. If you change them the automation will fail to update the README with live link status.

<!-- START_LINK_CHECKER -->

### ✅ All Systems Operational

**Status:** All tools and pages in the sitemap are working perfectly! No broken links found.

<!-- END_LINK_CHECKER -->

Link-checker sitemap endpoint (must remain reachable)

- The link-checker workflow reads the public sitemap at: `https://smartgentools.com/sitemap.xml`.
- That exact endpoint must be reachable publicly for the workflow to operate correctly. Do not change this URL unless you also update `.github/workflows/link-checker.yml` to point to a new sitemap.
- The workflow replaces README content only between the `<!-- START_LINK_CHECKER -->

### ✅ All Systems Operational

**Status:** All tools and pages in the sitemap are working perfectly! No broken links found.

<!-- END_LINK_CHECKER -->` markers.

If you operate a preview site or staging instance, either:
- update the workflow to target your alternate sitemap URL, OR
- publish a separate sitemap at the same URL under a DNS that the workflow can access.

Developer quickstart (local)

Prerequisites

- Node.js 20.x (recommended). Some backend workflows use Node 22 — Node 20 or 22 is safe.
- npm (bundled with Node)
- Optional: Python 3.x for sitemap/link-check scripts if you run them locally.

Install & build

1. Clone the repository:

   git clone https://github.com/bayzed123/SmartGenQR.oi.git
   cd SmartGenQR.oi

2. Install node dependencies:

   npm ci

3. Full build (blog, docs, and chatbot index):

   npm run build

   Scripts in `package.json`:
   - `build`: runs `build-blog`, `build-docs`, and `build-chatbot`
   - `build-blog`: `node scripts/build-blog.js`
   - `build-docs`: `node scripts/docs-build.js`
   - `build-chatbot`: `node scripts/build-chatbot-knowledge.js`

4. Serve locally for testing (ensure generated files exist at repo root):

   npx serve . -p 8080
   # or
   python -m http.server 8080

Important: GitHub Pages workflow uploads the repository root (`.`). Ensure your final generated site files (HTML, sitemap.xml, assets) are present at the repo root at build completion or adjust the workflow upload path.

Repository layout & important files (quick links)

- [index.html](./index.html)
- [assets/](./assets/)
- [scripts/](./scripts/)
- [package.json](./package.json)
- [data/changelog.json](./data/changelog.json)
- [.github/workflows/main.yml](./.github/workflows/main.yml)
- [.github/workflows/link-checker.yml](./.github/workflows/link-checker.yml)
- [.github/workflows/auto-sitemap.yml](./.github/workflows/auto-sitemap.yml)
- [.github/workflows/changelog.yml](./.github/workflows/changelog.yml)
- [.github/workflows/secret-scan.yml](./.github/workflows/secret-scan.yml)
- [backend/](./backend/)
- [WIKI.md](./WIKI.md) (if present)
- [WIKI_Trust_Center.md](./WIKI_Trust_Center.md) (if present)

If any of those files are missing, please create them or adjust these links.

Build orchestration notes

- `package.json` coordinates the local build. The GitHub Actions workflows expect those scripts to exist and to produce final HTML and data files.
- The `auto-sitemap.yml` workflow gathers URLs from the repo and writes `sitemap.xml`. It prefers git commit dates and will fail if the repository files aren't checkable; ensure workflows have full git history (`fetch-depth: 0`) where required.

Adding or updating tools

- Each tool should be a self-contained folder with its own `index.html` and local assets (e.g., `/my-tool/index.html`).
- Use relative links inside tools (e.g., `./assets/img.png`) so the site is portable between domain root and subpath deployments.
- Add new tool entries to `assets/js/search-data.js` (the `TOOLS_INDEX` registry) so the search and related-tool features pick them up.

Changelog & automatic updates

- `data/changelog.json` is updated via `.github/workflows/changelog.yml`. The workflow prepends the last commit as a new entry. Avoid manual edits to this file unless you intend to bypass automation.

Contributing

- Fork and create a feature branch.
- Run `npm run build` and verify `index.html` and generated pages are correct locally.
- Submit a PR targeting `main`. CI will run security, sitemap, and link-check workflows.
- Address any failures reported by the workflows before merging.

Recommended additional docs to add (I can create these for you)

- `CONTRIBUTING.md` — contribution process & checklist.
- `DEV_NOTES.md` or `WIKI.md` — explain the scripts, where generated files go, and how to rebuild the chatbot index.
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE/` — templates to help maintainers.

Maintainer / contact

- Repository owner: `bayzed123` (maintainer contact via Issues or PR comments).
- Founder & public profile references are included in `index.html`.

License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
