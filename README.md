![logo](assets/img/logo.svg)
# SmartGen: All-in-One Digital & Web Utility Platform

[![Auto Changelog Status](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/changelog.yml/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/changelog.yml) [![Pages Build Deployment](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/bayzed123/SmartGenQR.oi/actions/workflows/pages/pages-build-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/bayzed123/SmartGenQR.oi)

**SmartGen** is a premier, open-source web utility ecosystem featuring over **131+ high-performance tools**. Designed for developers, marketers, and SEO experts, it operates on a **100% Client-Side** architecture, ensuring absolute privacy and lightning-fast execution without any server-side data storage.

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

### ⚠️ Link Status Report

| Broken URL | Error Code |
|---|---|
| https://smartgentools.com/schema-generator/ | 503 |

<!-- END_LINK_CHECKER -->

---

<!-- pagespeed_start -->
### 📊 Site Health Report (Updated: 2026-07-14)
- **Performance Score:** 99/100
<!-- pagespeed_end -->

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
[**Master HTML Code library Tool Directory80+**](https://smartgentools.com/html-code-library/)

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

### how Manage Automated Smartgen Chatbot Read [CHATBOT_README.md](CHATBOT_README.md)

---
# SmartGen Blog: Manual Author Card Placement Guidelines

This document outlines how to manually control the placement of the **Author Profile Card** and **Author Footer Card** within your SmartGen blog posts. By default, these cards are automatically injected into your generated HTML. However, if you require specific positioning for design or content flow, you can use special Markdown tags within your `.md` files.

## 1. Understanding Automatic vs. Manual Placement

By default, the `build-blog.js` script automatically places:

*   **Author Profile Card:** Immediately after the blog post's title and description.
*   **Author Footer Card:** At the very end of the blog post article, before the newsletter and related posts sections.

If you use the manual placement tags described below, the automatic injection for that specific card will be **disabled** for that post, giving you full control over its position.

## 2. Manual Placement Tags

To manually place the author cards, insert the following HTML comment tags directly into your Markdown (`.md`) files where you want the cards to appear:

### 2.1. Author Profile Card

Use this tag to place the slim author profile box. It is recommended to place this near the beginning of your content, typically after the introductory paragraphs or immediately following the post's metadata.

```markdown
<!--AUTHOR_PROFILE-->
```

**Example Usage in `your-blog-post.md`:**

```markdown
---
title: "My Awesome Blog Post"
description: "A detailed look into an interesting topic."
---

# My Awesome Blog Post Title

This is the introductory paragraph of my blog post. It sets the stage for the content that follows.

<!--AUTHOR_PROFILE-->

Here begins the main content of my article...
```

### 2.2. Author Footer Card

Use this tag to place the detailed author footer box. This should typically be placed at the logical end of your main blog content, before any concluding remarks or calls to action that are part of the main article body.

```markdown
<!--AUTHOR_FOOTER-->
```

**Example Usage in `your-blog-post.md`:**

```markdown
...
This is the concluding section of my blog post. Thank you for reading!

<!--AUTHOR_FOOTER-->

## Further Reading

*   [Related Article 1](/blog/related-article-1)
*   [Related Article 2](/blog/related-article-2)
```

## 3. Important Considerations

*   **Case Sensitivity:** The tags `<!--AUTHOR_PROFILE-->` and `<!--AUTHOR_FOOTER-->` are case-sensitive and must be used exactly as shown.
*   **Single Use:** Each tag should only be used once per blog post. Using them multiple times will result in only the first occurrence being replaced.
*   **No Duplication:** The `build-blog.js` script is designed to prevent duplication. If you use a manual tag, the automatic injection for that specific card will be skipped. If you don't use a manual tag, the card will be automatically placed in its default position.
*   **HTML Comments:** These tags are HTML comments, so they will not be visible in your raw Markdown content on GitHub or other platforms that render Markdown directly without processing by `build-blog.js`.

By following these guidelines, you can achieve precise control over the presentation of author information in your SmartGen blog, enhancing both user experience and E-E-A-T signals.

* SmartGen Blog Post Writing Guidelines & Template [blog-post-guideline.md](blog-post-guideline.md)
## 🤝 Contribution & Support

We welcome contributors! See the [**Contribution Guide**](WIKI_About_Team_Contribution.md) for detailed workflows.

### Support the Project
*   **PayPal:** [![Support](https://img.shields.io/badge/PayPal-Donate-blue?style=flat&logo=paypal)](https://www.paypal.me/connectwithbayezid)
*   **Project Support:** [![projects Support](https://img.shields.io/badge/Agency-Connect_With_Bayezid-blue)](https://gravatar.com/sayadbayezid/wallet)

---

## 📄 License
Licensed under the MIT License. **Copyright (c) 2026 [Sayad Md Bayezid Hosan](https://me.developers.google.com/u/103733595068802840118)**.
