# ⚡ SmartGen: All-in-One Digital & Web Utility Platform

[![Auto Changelog Status](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/auto-changelog.yml/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/auto-changelog.yml) [![Pages Build Deployment](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/bayzed123/SmartGenQR.oi)

**SmartGen** is a premier, open-source web utility ecosystem featuring over **45+ high-performance tools**. Designed for developers, marketers, and SEO experts, it operates on a **100% Client-Side** architecture, ensuring absolute privacy and lightning-fast execution without any server-side data storage.

---

## 🌐 Quick Access & Legal
| Resource | Link |
| :--- | :--- |
| **Live Platform** | [![Website](https://img.shields.io/badge/Website-smartgentools.com-blue?style=for-the-badge&logo=google-chrome&logoColor=white)](https://smartgentools.com) |
| **Official Wiki** | [![Wiki](https://img.shields.io/badge/Documentation-Wiki-success?style=for-the-badge&logo=wikipedia&logoColor=white)](WIKI.md) |
| **Trust Center** | [![Trust Center](https://img.shields.io/badge/Legal-Trust_Center-informational?style=for-the-badge&logo=shield-halved&logoColor=white)](WIKI_Trust_Center.md) |
| **Founder** | [![Founder](https://img.shields.io/badge/Founder-Sayad_Bayezid-orange?style=for-the-badge&logo=person&logoColor=white)](https://www.sayadbayezid.com) |

---

<!-- START_LINK_CHECKER -->

### ✅ All Systems Operational

**Status:** All tools and pages in the sitemap are working perfectly! No broken links found.

<!-- END_LINK_CHECKER -->

---

## 🏗️ Master Tool Directory

### 💻 Developer & Technical
[![QR Generator](https://img.shields.io/badge/QR_Generator-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/qr-generator/)
[![JSON Formatter](https://img.shields.io/badge/JSON_Formatter-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/json-formatter-validator/)
[![Meta Tag Generator](https://img.shields.io/badge/Meta_Tag_Generator-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/meta-tag-generator/)
[![UUID Generator](https://img.shields.io/badge/UUID_Generator-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/uuid-generator/)
[![Sitemap Finder](https://img.shields.io/badge/Sitemap_Finder-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/sitemap-finder-and-downloader/)
[![Base64 Image](https://img.shields.io/badge/Base64_to_Image-00599C?style=for-the-badge&logo=github&logoColor=white)](https://smartgentools.com/base64-to-image/)

### 📈 Marketing & Social Media
[![UTM Builder](https://img.shields.io/badge/UTM_Builder-FF5722?style=for-the-badge&logo=meta&logoColor=white)](https://smartgentools.com/utm-builder/)
[![WhatsApp Link](https://img.shields.io/badge/WhatsApp_Link-FF5722?style=for-the-badge&logo=whatsapp&logoColor=white)](https://smartgentools.com/whatsapp-link/)
[![Blog Title Gen](https://img.shields.io/badge/Blog_Title_Generator-FF5722?style=for-the-badge&logo=meta&logoColor=white)](https://smartgentools.com/blog-title-generator/)
[![YT Downloader](https://img.shields.io/badge/YT_Thumbnail-FF5722?style=for-the-badge&logo=youtube&logoColor=white)](https://smartgentools.com/youtube-thumbnail-downloader/)

### 🔍 SEO & Content
[![Keyword Density](https://img.shields.io/badge/Keyword_Density-4CAF50?style=for-the-badge&logo=google&logoColor=white)](https://smartgentools.com/keyword-density-checker/)
[![SERP Preview](https://img.shields.io/badge/SERP_Preview-4CAF50?style=for-the-badge&logo=google&logoColor=white)](https://smartgentools.com/serp-preview-tool/)
[![Word Counter](https://img.shields.io/badge/Word_Counter-4CAF50?style=for-the-badge&logo=google&logoColor=white)](https://smartgentools.com/word-counter/)
[![Lorem Ipsum](https://img.shields.io/badge/Lorem_Ipsum-4CAF50?style=for-the-badge&logo=google&logoColor=white)](https://smartgentools.com/lorem-ipsum-generator/)

> 💡 **View the Full Catalog:** For a complete list of all 45+ utilities, visit the [**Master Tool Directory**](WIKI_Master_Tool_Directory.md).

---

## ⚙️ Developer Guidelines & Maintenance
*Follow these rules to maintain the integrity and performance of the SmartGen ecosystem.*

### 1. Tool Creation Standard
- **Directory Structure:** Each tool must reside in its own folder (e.g., `/new-tool/index.html`).
- **Client-Side Only:** No server-side processing. Use JavaScript for all logic.
- **SEO Skyscraper:** Every `index.html` must include 1200+ words of SEO content, FAQ schema, and optimized meta tags.

### 2. Global Logic Updates
- **`assets/js/app.js`**: Update this for navbar/footer changes or theme logic.
- **`assets/js/search-data.js`**: **Crucial!** Every new tool must be added to the `TOOLS_INDEX` array to appear in search and related tool recommendations.
- **`assets/js/related-tools.js`**: Manages the dynamic recommendation engine.

### 3. Blog Management
- **Writing Posts:** Add Markdown files to `/blog-posts/`.
- **Building:** Run `node scripts/build-blog.js` to regenerate the blog static pages and `blog.json`.
- **Metadata:** Use YAML front matter for titles, dates, and descriptions.

### 4. CI/CD & Automation
- **Changelog:** Automatically updated via GitHub Actions on push to `main`. Do not edit `data/changelog.json` manually.
- **Deployment:** GitHub Pages automatically builds and deploys from the `main` branch.

---

## 🚀 Setup & Local Development

1.  **Clone:** `git clone https://github.com/bayzed123/SmartGenQR.oi.git`
2.  **Install:** `pnpm install` (Required for blog build and linting).
3.  **Local Preview:** Open any `index.html` or use `npx serve` for the full environment.
4.  **Build Blog:** `pnpm build` (Runs `scripts/build-blog.js`).

---

## 🤝 Contribution & Support

We welcome contributors! See the [**Contribution Guide**](WIKI_About_Team_Contribution.md) for detailed workflows.

### Support the Project
*   **PayPal:** [![Support](https://img.shields.io/badge/PayPal-Donate-blue?style=flat&logo=paypal)](https://www.paypal.me/connectwithbayezid)
*   **Agency:** [![Agency](https://img.shields.io/badge/Agency-Connect_With_Bayezid-blue)](https://connectbayezid-8dcdz46v.manus.space/)

---

## 📄 License
Licensed under the MIT License. **Copyright (c) 2026 Sayad Md Bayezid Hosan**.
