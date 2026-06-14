---
title: "SmartGen Now Open source project"
date: 2026-06-15
image: "https://i.ibb.co/Y7FCcNqP/962-F6-E99-D77-F-4-A13-BC23-B9-F465-ADC8-EA.png"
author: "SmartGen"
description: "Announcing the launch of the SmartGen HTML Marquee Generator. Build customizable scrolling text, news tickers, announcements, and promotional banners without writing complex code."
keywords:
  - SmartGen
  - open source now
  - Web Development
  - Developer Tools
tags:
  - SmartGen
  - HTML Marquee
  - Web Development
  - Developer Tools
  - Product Launch
---
# SmartGen: All-in-One Digital & Web Utility Platform
Tage: open source , Smartgen
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



---
# ⚡ SmartGen Wiki

Welcome to the official documentation for **SmartGen**, an all-in-one digital and web utility platform designed for developers, marketers, and everyday users. This wiki provides a deep dive into our architecture, development philosophy, and the tools we offer.

---

## Table of Contents

*   [Project Overview](#project-overview)
*   [Architecture & Tech Stack](#architecture--tech-stack)
*   [Master Tool Directory (The 45+ Utilities)](#master-tool-directory-the-45-utilities)
*   [Setup Guide](#setup-guide)
*   [Trust Center & Core Policies](#trust-center--core-policies)
*   [About the Team & Contribution](#about-the-team--contribution)

---

## Project Overview

SmartGen is built on the principle of **100% Client-Side Processing**. Unlike traditional utility sites that require data to be uploaded to a server, SmartGen performs all calculations, generations, and transformations directly within the user's browser. This approach prioritizes user privacy, speed, and accessibility.

### Core Values

*   **Privacy First:** No user data ever leaves the local device.
*   **Speed:** Instant results without the latency of server round-trips.
*   **Accessibility:** A clean, responsive, and ad-friendly UI for all devices.
*   **SEO Optimized:** Every tool is backed by a "Skyscraper" SEO strategy.

# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
* Focusing on what is best not just for us as individuals, but for the overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki
# Contributing to SmartGen

Thank you for your interest in contributing to SmartGen! We welcome contributions from everyone. 
This document provides guidelines and instructions for contributing.

## Code of Conduct

* Be respectful and inclusive
* Provide constructive feedback
* Help others learn and grow
* Report issues professionally
* Follow the project's license

## Getting Started

### Prerequisites

* Node.js 18+ or higher
* pnpm package manager
* Git
* Basic knowledge of React/TypeScript (for code contributions)

### Setup Development Environment

```bash
# 1. Fork the repository
# Visit: [https://github.com/bayzed123/smartgenqr.oi/](https://github.com/bayzed123/smartgenqr.oi/fork)

# 2. Clone your fork
git clone [https://github.com/bayzed123/smartgenqr.oi/](https://github.com/bayzed123/smartgenqr.oi/fork)
cd smartgen-qr-generator

# 3. Add upstream remote
git remote add upstream [https://github.com/bayzed123/.git](https://github.com/bayzed123/smartgen-qr-generator.git)

# 4. Install dependencies
pnpm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Start development server
pnpm dev
Development Workflow
1. Make Your Changes
• Write clean, readable code  
• Follow the existing code style  
• Add comments for complex logic  
• Update documentation as needed  
2. Test Your Changes

# [span_29](start_span)Run tests[span_29](end_span)
[span_30](start_span)pnpm test[span_30](end_span)

# [span_31](start_span)Check TypeScript[span_31](end_span)
[span_32](start_span)pnpm check[span_32](end_span)

# [span_33](start_span)Format code[span_33](end_span)
[span_34](start_span)pnpm format[span_34](end_span)

# [span_35](start_span)Build project[span_35](end_span)
[span_36](start_span)pnpm build[span_36](end_span)
3. Commit Your Changes
# [span_37](start_span)Use descriptive commit messages[span_37](end_span)
[span_38](start_span)git add .[span_38](end_span)
[span_39](start_span)git commit -m "feat: add new feature description"[span_39](end_span)
[span_40](start_span)git commit -m "fix: resolve issue description"[span_40](end_span)
[span_41](start_span)git commit -m "docs: update documentation"[span_41](end_span)
Commit Message Format:
• feat: New feature  
• fix: Bug fix  
• docs: Documentation  
• style: Code style changes  
• refactor: Code refactoring  
• test: Test additions/updates  
• chore: Build/dependency updates  
4. Push and Create Pull Request
# [span_49](start_span)Push to your fork[span_49](end_span)
[span_50](start_span)git push origin feature/your-feature-name[span_50](end_span)
• Create PR on GitHub  
• Provide clear description of changes  
• Reference related issues  
Pull Request Guidelines
Before Submitting
• [ ] Tests pass (pnpm test)  
• [ ] Code is formatted (pnpm format)  
• [ ] TypeScript checks pass (pnpm check)  
• [ ] Build succeeds (pnpm build)  
• [ ] No console errors/warnings  
PR Description Template
## Description
[span_59](start_span)Brief description of changes[span_59](end_span)

## Type of Change
- [ ] [span_60](start_span)Bug fix[span_60](end_span)
- [ ] [span_61](start_span)New feature[span_61](end_span)
- [ ] [span_62](start_span)Breaking change[span_62](end_span)
- [ ] [span_63](start_span)Documentation update[span_63](end_span)

## Related Issues
[span_64](start_span)Fixes #(issue number)[span_64](end_span)

## Testing
[span_65](start_span)Describe how you tested the changes[span_65](end_span)

## Screenshots (if applicable)
[span_66](start_span)Add screenshots for UI changes[span_66](end_span)

## Checklist
- [ ] [span_67](start_span)Code follows style guidelines[span_67](end_span)
- [ ] [span_68](start_span)Tests added/updated[span_68](end_span)
- [ ] [span_69](start_span)Documentation updated[span_69](end_span)
- [ ] [span_70](start_span)No breaking changes[span_70](end_span)
Code Style Guidelines
TypeScript/React
[span_71](start_span)// Use descriptive names[span_71](end_span)
[span_72](start_span)const generateQRCode = (data: string): void => {[span_72](end_span)
  [span_73](start_span)// Implementation[span_73](end_span)
[span_74](start_span)};[span_74](end_span)

[span_75](start_span)// Use type annotations[span_75](end_span)
[span_76](start_span)interface QROptions {[span_76](end_span)
  [span_77](start_span)width: number;[span_77](end_span)
  [span_78](start_span)height: number;[span_78](end_span)
  [span_79](start_span)color: string;[span_79](end_span)
[span_80](start_span)}

// Use const for immutability[span_80](end_span)
[span_81](start_span)const DEFAULT_SIZE = 300;[span_81](end_span)

[span_82](start_span)// Use arrow functions[span_82](end_span)
[span_83](start_span)const handleClick = () => {};[span_83](end_span)

[span_84](start_span)// Use destructuring[span_84](end_span)
[span_85](start_span)const { name, email } = user;[span_85](end_span)
CSS/Tailwind
[span_86](start_span)/* Use semantic class names */[span_86](end_span)
[span_87](start_span).qr-preview {}[span_87](end_span)
[span_88](start_span).download-button {}[span_88](end_span)
[span_89](start_span)/* Use Tailwind utilities */[span_89](end_span)
[span_90](start_span)<div className="flex items-center gap-4 p-6 rounded-lg bg-white border border-gray-200">[span_90](end_span)

[span_91](start_span)/* Avoid inline styles */[span_91](end_span)
[span_92](start_span)// Bad[span_92](end_span)
[span_93](start_span)<div style={{ color: 'red' }}>[span_93](end_span)

[span_94](start_span)// Good[span_94](end_span)
[span_95](start_span)<div className="text-red-500">[span_95](end_span)

File Organization
[span_96](start_span)src/[span_96](end_span)
[span_97](start_span)├── components/[span_97](end_span)
[span_98](start_span)│   ├── QRPreview.tsx[span_98](end_span)
[span_99](start_span)│   ├── ColorPicker.tsx[span_99](end_span)
[span_100](start_span)│   └── DownloadButton.tsx[span_100](end_span)
[span_101](start_span)├── pages/[span_101](end_span)
[span_102](start_span)│   ├── Home.tsx[span_102](end_span)
[span_103](start_span)│   └── Generator.tsx[span_103](end_span)
[span_104](start_span)├── hooks/[span_104](end_span)
[span_105](start_span)│   └── useQRCode.ts[span_105](end_span)
[span_106](start_span)├── types/[span_106](end_span)
[span_107](start_span)│   └── qr.ts[span_107](end_span)
[span_108](start_span)└── utils/[span_108](end_span)
    [span_109](start_span)└── qrGenerator.ts[span_109](end_span)
Bug Reports
How to Report
1.	Check if bug already exists  
2.	Use bug report template  
3.	Provide detailed information  
4.	Include screenshots/videos  
Bug Report Template
## Description
[span_114](start_span)Clear description of the bug[span_114](end_span)

## Steps to Reproduce
1. [span_115](start_span)Step one[span_115](end_span)
2. [span_116](start_span)Step two[span_116](end_span)
3. [span_117](start_span)Step three[span_117](end_span)

## Expected Behavior
[span_118](start_span)What should happen[span_118](end_span)

## Actual Behavior
[span_119](start_span)What actually happens[span_119](end_span)

## Environment
[span_120](start_span)Browser: Chrome 120[span_120](end_span)
[span_121](start_span)OS: Windows 11[span_121](end_span)
[span_122](start_span)Device: Desktop[span_122](end_span)

## Screenshots
[span_123](start_span)[Add screenshots if applicable][span_123](end_span)

## Additional Context
[span_124](start_span)[Any additional information][span_124](end_span)

Feature Requests
How to Request
1.	Check if feature already requested  
2.	Use feature request template  
3.	Explain use case clearly  
4.	Provide examples  
Feature Request Template
## Feature Description
[span_129](start_span)Clear description of the feature[span_129](end_span)

## Use Case
[span_130](start_span)Why is this feature needed?[span_130](end_span)

## Proposed Solution
[span_131](start_span)How should it work?[span_131](end_span)

## Alternative Solutions
[span_132](start_span)Other possible approaches[span_132](end_span)

## Additional Context
[span_133](start_span)[Any additional information][span_133](end_span)
---
Documentation
When to Update Docs
• New features  
• API changes  
• Bug fixes affecting usage  
• New examples/tutorials  
Documentation Files
• README.md - Main documentation  
• docs/API.md - API reference  
• docs/ARCHITECTURE.md - Architecture overview  
• docs/GETTING_STARTED.md - Getting started guide  
• CONTRIBUTING.md - Contributing guide (this file)  
Testing
Writing Tests
[span_143](start_span)import { describe, it, expect } from 'vitest';[span_143](end_span)

[span_144](start_span)describe('QR Code Generator', () => {[span_144](end_span)
  [span_145](start_span)it('should generate QR code for URL', () => {[span_145](end_span)
    [span_146](start_span)const result = generateQRCode('[https://example.com](https://example.com)');[span_146](end_span)
    [span_147](start_span)expect(result).toBeDefined();[span_147](end_span)
  [span_148](start_span)});[span_148](end_span)

  [span_149](start_span)it('should handle WiFi QR code', () => {[span_149](end_span)
    [span_150](start_span)const result = generateWiFiQR({[span_150](end_span)
      [span_151](start_span)ssid: 'MyNetwork',[span_151](end_span)
      [span_152](start_span)password: 'password123',[span_152](end_span)
      [span_153](start_span)encryption: 'WPA'[span_153](end_span)
    [span_154](start_span)});[span_154](end_span)
    [span_155](start_span)expect(result).toContain('WIFI:');[span_155](end_span)
  [span_156](start_span)});[span_156](end_span)
[span_157](start_span)});[span_157](end_span)

Running Tests
# [span_158](start_span)Run all tests[span_158](end_span)
[span_159](start_span)pnpm test[span_159](end_span)

# [span_160](start_span)Run specific test file[span_160](end_span)
[span_161](start_span)pnpm test src/utils/qrGenerator.test.ts[span_161](end_span)

# [span_162](start_span)Watch mode[span_162](end_span)
[span_163](start_span)pnpm test --watch[span_163](end_span)

# [span_164](start_span)Coverage[span_164](end_span)
[span_165](start_span)pnpm test --coverage[span_165](end_span)
Code Review Process
What We Look For
• [x] Code quality and readability  
• [x] Test coverage  
• [x] Documentation  
• [x] Performance impact  
• [x] Security considerations  
• [x] Browser compatibility  
Review Timeline
• Small changes: 1-2 days  
• Medium changes: 2-5 days  
• Large changes: 5-10 days  
Feedback
• Constructive and respectful  
• Actionable suggestions  
• Explanations for requests  
• Recognition of good work  
Release Process
Version Numbering
• MAJOR.MINOR.PATCH (e.g., 1.0.0)  
• MAJOR: Breaking changes  
• MINOR: New features  
• PATCH: Bug fixes  
Release Checklist
• [ ] All tests passing  
• [ ] Documentation updated  
• [ ] Changelog updated  
• [ ] Version bumped  
• [ ] Build successful  
• [ ] Release notes written  
Resources
Learning
• React Documentation  
• TypeScript Handbook  
• Tailwind CSS  
• Git Guide  
Tools
• VS Code  
• ESLint  
• Prettier  
• Vitest  
Thank You!
Your contributions make SmartGen better for everyone. We appreciate:  
• Bug reports  
• Feature suggestions  
• Code contributions  
• Documentation improvements  
• Spreading the word  
Questions?
• Email: cwb.agency@outlook.com
• GitHub Issues: Ask a question  
• Website: [sayad Md Bayezid Hosan ](www.sayadbayezid.com)  
Happy Contributing!
Made with ❤️ by the SmartGen Community
---
# ⚡ SmartGen Wiki

Welcome to the official documentation for **SmartGen**, an all-in-one digital and web utility platform designed for developers, marketers, and everyday users. This wiki provides a deep dive into our architecture, development philosophy, and the tools we offer.

---

## 🚀 Overview

SmartGen is built on the principle of **100% Client-Side Processing**. Unlike traditional utility sites that require data to be uploaded to a server, SmartGen performs all calculations, generations, and transformations directly within the user's browser.

### Core Values
- **Privacy First:** No user data ever leaves the local device.
- **Speed:** Instant results without the latency of server round-trips.
- **Accessibility:** A clean, responsive, and ad-friendly UI for all devices.
- **SEO Optimized:** Every tool is backed by a "Skyscraper" SEO strategy.

---

## 🏗️ Technical Architecture

SmartGen uses a lightweight, modular architecture that ensures scalability and ease of maintenance.

### File Structure
- `/assets/css/style.css`: Global styles, theme variables, and responsive layout.
- `/assets/js/app.js`: Global logic including navbar/footer injection and theme toggling.
- `/assets/js/search-data.js`: Centralized JSON data for all tools, used by the search and related tools engine.
- `/assets/js/related-tools.js`: Client-side script for dynamic related tool recommendations.
- `/[tool-folder]/index.html`: Self-contained tool page with its own logic and SEO content.

### Dynamic UI Injection
To maintain a consistent look across dozens of pages, we use a custom JavaScript injection system in `app.js`:
- **`injectNavbar()`**: Injects a responsive header with a hamburger menu for mobile.
- **`injectFooter()`**: Injects a multi-column footer with quick links and social icons.
- **`initTheme()`**: Handles persistent Dark/Light mode preferences via `localStorage`.

---

## 🛠️ Tool Catalog

SmartGen hosts a wide variety of tools categorized into several key areas:

### Developer & Technical
| Icon | Tool Name | Description |
| :--- | :--- | :--- |
| 🖼️ | [**Base64 to Image Decoder**](https://smartgentools.com/base64-to-image/) | Decode Base64 strings back into image files. |
| 🎨 | [**CSS Gradient Generator**](https://smartgentools.com/css-gradient-generator/) | Create beautiful CSS gradients with color pickers. |
| 🔒 | [**MD5/SHA Hash Generator**](https://smartgentools.com/hash-generator/) | Generate MD5, SHA-1, and SHA-256 hashes. |
| 💻 | [**Live HTML Previewer**](https://smartgentools.com/html-code-preview/) | Write HTML/CSS/JS and see live results instantly. |
| 🌐 | [**IP Address Lookup**](https://smartgentools.com/ip-address-lookup/) | Find your public IP and network information. |
| JSON | [**JSON Formatter & Validator**](https://smartgentools.com/json-formatter-validator/) | Format, beautify, and validate JSON code. |
| 🏷️ | [**Meta Tag Generator**](https://smartgentools.com/meta-tag-generator/) | Boost your SEO with perfect meta tags. |
| 📸 | [**Picture URL Generator**](https://smartgentools.com/picture-url-generator/) | Upload images and get direct live links instantly. |
| 📱 | [**QR Code Generator**](https://smartgentools.com/qr-generator/) | Create custom QR codes for URLs, WiFi, and more. |
| 🎲 | [**Random Choice Picker**](https://smartgentools.com/random-choice-picker/) | Make random decisions from a list of choices. |
| 🤖 | [**Robots.txt Generator**](https://smartgentools.com/robots-txt-generator/) | Create robots.txt files for search engines. |
| 📜 | [**Schema Generator**](https://smartgentools.com/schema-generator/) | Generate JSON-LD schema markup for SEO. |
| 🔐 | [**URL Encoder-Decoder**](https://smartgentools.com/url-encoder-decoder/) | Encode and decode URLs securely and instantly. |
| 🆔 | [**UUID / GUID Generator**](https://smartgentools.com/uuid-generator/) | Generate random version 4 UUIDs instantly. |

### Marketing & Social Media
| Icon | Tool Name | Description |
| :--- | :--- | :--- |
| ✍️ | [**Blog Title Generator**](https://smartgentools.com/blog-title-generator/) | Generate SEO-friendly blog titles and headlines. |
| ⚠️ | [**Disclaimer Generator**](https://smartgentools.com/disclaimer-generator/) | Generate legal disclaimers to protect your business. |
| 👤 | [**Facebook ID Finder**](https://smartgentools.com/facebook-id-finder/) | Extract numeric Facebook IDs from profile links. |
| #️⃣ | [**Hashtag Generator**](https://smartgentools.com/hashtag-generator/) | Generate trending social media hashtags. |
| 📧 | [**Mailto Generator**](https://smartgentools.com/mailto-generator/) | Generate professional email links with ease. |
| 📜 | [**Privacy Policy Generator**](https://smartgentools.com/privacy-policy-generator/) | Generate professional privacy policies for your site. |
| ⚖️ | [**Terms & Conditions Generator**](https://smartgentools.com/terms-conditions-generator/) | Create custom terms of service agreements instantly. |
| 🔗 | [**UTM Link Builder**](https://smartgentools.com/utm-builder/) | Generate tracking links for your marketing campaigns. |
| 💬 | [**WhatsApp Link**](https://smartgentools.com/whatsapp-link/) | Create direct chat links for WhatsApp. |
| 🎬 | [**YouTube Thumbnail Downloader**](https://smartgentools.com/youtube-thumbnail-downloader/) | Download HD thumbnails from any YouTube video. |

### SEO & Content
| Icon | Tool Name | Description |
| :--- | :--- | :--- |
| 📊 | [**Keyword Density Checker**](https://smartgentools.com/keyword-density-checker/) | Analyze keyword frequency in your content. |
| 🖋️ | [**Lorem Ipsum Generator**](https://smartgentools.com/lorem-ipsum-generator/) | Generate placeholder text for designs. |
| 🔍 | [**SERP Preview Tool**](https://smartgentools.com/serp-preview-tool/) | Preview how your page appears in Google search. |
| 🔠 | [**Text Case Converter**](https://smartgentools.com/text-case-converter/) | Convert text to UPPER, lower, or Title Case. |
| 📝 | [**Word Counter**](https://smartgentools.com/word-counter/) | Count words, characters, and reading time. |

### Daily Utilities & Calculators
| Icon | Tool Name | Description |
| :--- | :--- | :--- |
| 📅 | [**Age Calculator**](https://smartgentools.com/age-calculator/) | Calculate exact age and date differences. |
| ⚖️ | [**BMI BMR Calculator**](https://smartgentools.com/bmi-bmr-calculator/) | Calculate Body Mass Index and metabolic rate. |
| 💰 | [**CPM ROI Calculator**](https://smartgentools.com/cpm-roi-calculator/) | Calculate Cost Per Mille and Return on Investment. |
| 🎨 | [**Color Palette Extractor**](https://smartgentools.com/color-palette-extractor/) | Extract dominant colors from images as HEX and RGB. |
| 🏦 | [**EMI Calculator**](https://smartgentools.com/emi-calculator/) | Calculate monthly installments and total interest. |
| ✨ | [**Fancy Font Generator**](https://smartgentools.com/fancy-font-generator/) | Convert text to cool Unicode styles and fonts. |
| 📉 | [**Image Compressor**](https://smartgentools.com/image-compressor/) | Reduce image size locally without uploading. |
| 🔒 | [**Password Generator**](https://smartgentools.com/password-generator/) | Create secure, random passwords instantly. |
| % | [**Percentage Calculator**](https://smartgentools.com/percentage-calculator/) | Calculate percentages, discounts, and differences. |
| ⏱️ | [**Pomodoro Timer**](https://smartgentools.com/pomodoro-timer/) | 25/5 focus timer with start, pause, and reset. |
| 📔 | [**Secure Notepad**](https://smartgentools.com/secure-notepad/) | Auto-save notes to browser storage with privacy. |
| 📏 | [**Unit Converter**](https://smartgentools.com/unit-converter/) | Convert length, weight, and temperature instantly. |

---

## 📈 Skyscraper SEO Strategy

Every tool page on SmartGen follows a rigorous SEO framework to ensure high visibility and authority:

1.  **Action-Oriented Metadata:** Titles and descriptions are optimized for Click-Through Rate (CTR).
2.  **JSON-LD Schema:** Each page includes `FAQPage` schema to capture Google's rich snippets.
3.  **1200+ Word Content Blocks:** Detailed guides, technical deep dives, and best practices are included below the tool UI.
4.  **LSI Keyword Integration:** Content is enriched with Latent Semantic Indexing keywords to cover a broad range of search intents.

---

## 📱 Mobile Responsiveness

SmartGen features a custom-built responsive navbar:
- **Desktop:** Full horizontal navigation.
- **Mobile:** A compact hamburger menu (☰) that expands into a vertical dropdown.
- **Theme Support:** Both the desktop and mobile views fully support Dark and Light modes.

---

## 🤝 Contributing

We welcome contributions to SmartGen! If you have suggestions for new tools, improvements to existing ones, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 💖 Support the Project

If you find this utility platform helpful, consider supporting its development. Your appreciation keeps the project alive and free for everyone!

<div align="left">
  <a href="https://www.paypal.me/connectwithbayezid" target="_blank">
    <img src="https://raw.githubusercontent.com/bayzed123/sayadbayezid-portfolio-/main/assets/images/paypal_logo.png" width="150" alt="Support via PayPal">
  </a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.payoneer.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/bayzed123/sayadbayezid-portfolio-/main/assets/images/payoneer_logo.png" width="150" alt="Support via Payoneer">
  </a>
</div>

# 🏗️ Architecture & Tech Stack

SmartGen employs a lightweight, modular, and client-side focused architecture designed for speed, privacy, and ease of maintenance. The core philosophy revolves around processing all operations directly within the user's browser, eliminating the need for server-side data handling for most utilities.

## Core Architectural Principles

*   **Client-Side Processing:** All primary utility functions, such as QR code generation, image compression, and text conversions, are executed entirely within the user's web browser. This ensures that no sensitive user data is transmitted to or stored on external servers, upholding the "Privacy First" core value.
*   **Modular Design:** The application is structured into independent tool modules, each residing in its own directory (`/[tool-folder]/index.html`). This modularity facilitates easy development, maintenance, and scaling of individual tools without impacting the entire platform.
*   **Static Site Generation (SSG) with Dynamic Injection:** The platform leverages static HTML pages for individual tools and content, enhanced by client-side JavaScript for dynamic UI elements, navigation, and consistent theming. This approach combines the benefits of fast loading times and robust SEO with a rich user experience.

## Technical Stack

SmartGen's technical stack is lean and efficient, primarily relying on modern web standards and a minimal set of JavaScript libraries for specific functionalities.

### Frontend

*   **HTML5:** The foundational markup language for structuring content.
*   **CSS3:** Utilized for styling, layout, and responsive design, with global styles defined in `/assets/css/style.css`.
*   **JavaScript (ES6+):** Powers all client-side logic, dynamic content injection, and tool functionalities. Key global scripts include:
    *   `/assets/js/app.js`: Manages global UI elements like navigation (`injectNavbar()`), footer (`injectFooter()`), and theme toggling (`initTheme()`). It also handles mobile responsiveness with a dynamic sidebar.
    *   `/assets/js/search-data.js`: A centralized JSON data source containing metadata for all tools, used for search functionality and related tool recommendations.
    *   `/assets/js/related-tools.js`: Dynamically injects related tool suggestions on individual tool pages.
    *   `/assets/js/search.js`: Implements the client-side live search UI on the homepage.

### Build & Content Management

*   **Node.js:** Used as a runtime environment for build scripts.
*   **pnpm:** The package manager for project dependencies, as indicated in `Contributing.md` [1].
*   **`scripts/build-blog.js`:** A custom Node.js script responsible for generating the blog section. It processes Markdown files from `blog-posts/`, uses `front-matter` for metadata extraction, and `marked` for Markdown-to-HTML conversion. It generates static HTML pages for blog posts and a `blog.json` index.
*   **`front-matter`:** A JavaScript library for parsing front matter from Markdown files [2].
*   **`marked`:** A Markdown parser and compiler, used for converting blog post content into HTML [3].
*   **`slugify`:** A utility for converting strings into URL-friendly slugs [4].

### Development Environment & Tools

*   **Git:** Version control system for managing the codebase.
*   **GitHub:** Hosting for the repository and collaborative development workflows.
*   **VS Code:** Recommended integrated development environment (IDE) [1].
*   **ESLint & Prettier:** Code linting and formatting tools to maintain code quality and consistency [1].
*   **Vitest:** A fast unit test framework used for testing JavaScript/TypeScript code [1].
*   **TypeScript:** While not universally applied across all tools, `Contributing.md` suggests basic knowledge of React/TypeScript for code contributions, indicating its use in certain parts or for future development [1].

## File Structure Overview

The project follows a clear and organized file structure to ensure maintainability:

*   `/assets/`: Contains global CSS (`style.css`), JavaScript (`app.js`, `search-data.js`, `related-tools.js`, `search.js`), and other static assets.
*   `/blog/`: Houses blog-related files, including `blog.json` and individual blog post directories.
*   `/blog-posts/`: Markdown source files for blog content.
*   `/data/`: Stores data files like `changelog.json`.
*   `/scripts/`: Contains Node.js build scripts, such as `build-blog.js`.
*   `/[tool-folder]/`: Each individual utility resides in its own directory, typically containing an `index.html` file and any tool-specific JavaScript or CSS.
*   `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/disclaimer/`: Static pages for legal information and site details.

This architecture ensures that SmartGen remains performant, privacy-respecting, and easy to contribute to, aligning with its open-source nature.

## References

[1] Contributing to SmartGen. (n.d.). *GitHub*. Retrieved from [https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md](https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md)
[2] front-matter. (n.d.). *npm*. Retrieved from [https://www.npmjs.com/package/front-matter](https://www.npmjs.com/package/front-matter)
[3] marked. (n.d.). *npm*. Retrieved from [https://www.npmjs.com/package/marked](https://www.npmjs.com/package/marked)
[4] slugify. (n.d.). *npm*. Retrieved from [https://www.npmjs.com/package/slugify](https://www.npmjs.com/package/slugify)
# 🚀 Setup Guide

This guide provides detailed instructions for setting up your development environment and getting started with contributing to SmartGen. Whether you're looking to run the project locally, add new features, or fix bugs, these steps will help you get up and running.

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

*   **Node.js:** Version 18 or higher. Node.js is a JavaScript runtime environment essential for running build scripts and managing dependencies.
*   **pnpm:** A fast, disk space efficient package manager. It is used to install and manage project dependencies.
*   **Git:** A distributed version control system for tracking changes in source code during software development.
*   **Basic knowledge of React/TypeScript:** While SmartGen primarily uses vanilla JavaScript, some parts or future developments might involve React and TypeScript. Familiarity with these technologies will be beneficial for code contributions.

## Setting Up Your Development Environment

Follow these steps to set up your local development environment:

1.  **Fork the Repository:**
    *   Navigate to the [SmartGenQR.oi GitHub repository](https://github.com/bayzed123/SmartGenQR.oi).
    *   Click the `Fork` button in the top-right corner to create a copy of the repository under your GitHub account.

2.  **Clone Your Fork:**
    *   Open your terminal or command prompt.
    *   Clone your forked repository to your local machine using the following command:

    ```bash
    git clone https://github.com/YOUR_USERNAME/SmartGenQR.oi.git
    cd SmartGenQR.oi
    ```
    *Replace `YOUR_USERNAME` with your GitHub username.*

3.  **Add Upstream Remote:**
    *   Add the original SmartGen repository as an "upstream" remote. This allows you to fetch and merge changes from the main project.

    ```bash
    git remote add upstream https://github.com/bayzed123/SmartGenQR.oi.git
    ```

4.  **Install Dependencies:**
    *   Install the project dependencies using `pnpm`:

    ```bash
    pnpm install
    ```

5.  **Create a Feature Branch:**
    *   Before making any changes, create a new branch for your feature or bug fix. This keeps your changes organized and makes it easier to submit pull requests.

    ```bash
    git checkout -b feature/your-feature-name
    ```
    *Replace `your-feature-name` with a descriptive name for your branch (e.g., `feature/add-new-qr-type` or `fix/broken-link`).*

6.  **Start Development Server:**
    *   SmartGen is primarily a collection of static HTML files with client-side JavaScript. To view your changes locally, you can often just open the `index.html` file of the tool you are working on directly in your browser. For the blog or if you need a local server, you might use a simple static server (e.g., `npx serve` or a VS Code extension).
    *   For blog-related development, you would use the build script:

    ```bash
    node scripts/build-blog.js
    ```
    This will generate the static blog pages.

## Development Workflow

Once your environment is set up, follow these guidelines for your development workflow:

1.  **Make Your Changes:**
    *   Write clean, readable code.
    *   Follow the existing code style and conventions.
    *   Add comments for complex logic.
    *   Update documentation as needed (e.g., `README.md`, `WIKI.md`, or tool-specific documentation).

2.  **Test Your Changes:**
    *   Run tests to ensure your changes haven't introduced any regressions and work as expected.

    ```bash
    pnpm test
    pnpm check # For TypeScript checks
    pnpm format # To format your code
    pnpm build # To build the project
    ```

3.  **Commit Your Changes:**
    *   Use descriptive commit messages following the Conventional Commits specification. This helps in generating changelogs and understanding the history of changes.

    ```bash
    git add .
    git commit -m "feat: add new feature description"
    # Example commit types:
    # feat: New feature
    # fix: Bug fix
    # docs: Documentation updates
    # style: Code style changes
    # refactor: Code refactoring
    # test: Test additions/updates
    # chore: Build/dependency updates
    ```

4.  **Push and Create Pull Request:**
    *   Push your changes to your forked repository:

    ```bash
    git push origin feature/your-feature-name
    ```
    *   Go to your forked repository on GitHub and open a Pull Request (PR) to the `main` branch of the original `bayzed123/SmartGenQR.oi` repository.
    *   Provide a clear description of your changes, reference any related issues, and ensure all checklist items in the PR template are addressed.

## Pull Request Guidelines

Before submitting a Pull Request, please ensure:

*   All tests pass (`pnpm test`).
*   Code is formatted correctly (`pnpm format`).
*   TypeScript checks pass (`pnpm check`), if applicable.
*   The project builds successfully (`pnpm build`).
*   There are no console errors or warnings in the browser.

Your contributions are highly valued and help make SmartGen better for everyone!
# 🛡️ Trust Center & Core Policies

Welcome to the SmartGen Trust Center. This document outlines our operational DNA, detailing our commitment to privacy, ethical monetization, and transparency. We believe that in an era of digital uncertainty, transparency is the ultimate currency.

## Privacy-First Architecture

SmartGen is built on a privacy-first, local-first architecture. The vast majority of processing occurs directly on the user's device, minimizing data exposure.

### Core Data Processing & Analytics

SmartGen does not collect or store personal or user-generated content. However, limited non-personal technical data (such as device information, crash logs, and advertising identifiers) may be processed by trusted third-party services, including Google Firebase, Google Analytics, Google Tag Manager, and Google AdMob. This data is used strictly for performance monitoring, stability improvements, analytics, and advertising purposes.

### Account & Registration Policy

SmartGen operates without requiring user registration, login, or account creation. All features are fully accessible without submitting personal credentials. Consequently, no user identity is stored, no personal profile is created, and no cross-device tracking is performed.

## External API Processing & Data Flow

While most tools operate entirely client-side, certain features (such as the AI Vocal Remover or specific URL generation tools) may utilize external APIs.

*   **User Initiation:** All API requests are initiated solely by user action.
*   **Data Scope:** Only the user-provided input necessary for that specific tool is transmitted.
*   **Temporary Processing:** Data is processed temporarily to complete the requested function and is not permanently stored on SmartGen servers.
*   **Third-Party Policies:** Users should be aware that third-party APIs may apply their own privacy policies.

## Advertising & Monetization

Advertising in SmartGen is provided via Google AdMob. We strive to balance free access to our tools with ethical monetization practices.

### Ad Personalization & Opt-Out Control

Users have control over their advertising experience and can opt out of personalized advertising at any time by:

*   Adjusting device-level advertising settings.
*   Resetting their Advertising ID from their device settings (e.g., Android settings).
*   Limiting ad tracking based on regional settings.

SmartGen does not directly control AdMob’s internal ad targeting system.

## Children’s Privacy & Age Restrictions

SmartGen is not directed to children under the age of 13 (or the applicable digital consent age in your region). We do not knowingly collect personal data from children, profile minors for advertising, or encourage the unsupervised use of sensitive tools.

If a minor uses the application, parental or guardian consent is required where applicable, especially for features involving advertising or analytics. If a parent or guardian believes a child has used the app inappropriately, they may contact us for immediate review and removal of any related technical logs. AdMob is configured to comply with child-safe advertising policies.

## User Data Requests & Privacy Control

Because SmartGen does not maintain user accounts or centralized storage, there is no server-side data to delete. Users have full control over their locally stored data and can remove it by:

*   Clearing the browser cache (for web tools).
*   Clearing app storage or uninstalling the application (for mobile apps).

For clarifications or information related to third-party analytics identifiers, users may contact us at `cwb.agency@outlook.com` with the subject "Data Privacy Request".

## Google Play Data Safety & Compliance Summary

For our mobile applications, we adhere to strict data safety guidelines:

| Data Type | Status |
| :--- | :--- |
| Personal Data | Not Collected |
| User Content | Not Stored |
| Device Info | Limited (Analytics Only) |

We ensure no sale of personal data, minimal technical data collection, and full disclosure regarding Firebase crash analytics and AdMob advertising. There is no user profiling beyond what is required by the ads SDK.
---
# our Goal 
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartGen Trust Center - The Ultimate Legal & Resource Guide</title>
    <meta name="description" content="A deep-dive resource center for SmartGen users, covering our philosophy of privacy, ethical monetization, tech stack transparency, and user empowerment.">
    <link rel="stylesheet" href="./assets/css/style.css">
    <script src="./assets/js/app.js" defer></script>
    <style>
        /* Professional Book-Style Layout */
        body {
            margin: 0;
            padding: 0;
            background-color: var(--background);
            font-family: 'Georgia', serif; /* Classic book-style font */
            color: var(--text-primary);
            line-height: 1.8;
            -webkit-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
        }

        .trust-center-container {
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
            background: var(--card-bg);
        }

        .content-wrapper {
            max-width: 900px;
            margin: 0 auto;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: 2rem;
            color: var(--primary);
            border-bottom: 2px solid var(--primary);
            padding-bottom: 1rem;
        }

        h2 {
            font-size: 2rem;
            color: var(--text-primary);
            margin-top: 3rem;
            margin-bottom: 1.5rem;
            text-align: left;
            border-left: 5px solid var(--primary);
            padding-left: 15px;
        }

        h3 {
            font-size: 1.5rem;
            color: var(--primary);
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        p {
            font-size: 1.1rem;
            text-align: justify;
            margin-bottom: 1.5em;
            color: var(--text-secondary);
        }

        li {
            font-size: 1.1rem;
            text-align: justify;
            margin-bottom: 0.8em;
            color: var(--text-secondary);
        }

        ul, ol {
            margin-bottom: 1.5em;
            padding-left: 1.5rem;
        }

        .mega-resource-box {
            background: var(--background);
            border: 1px solid var(--border);
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
        }

        .tool-summary {
            background: var(--background);
            border: 1px solid var(--border);
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 2rem;
        }

        .tool-summary h4 {
            font-size: 1.3rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .faq-section {
            background: var(--card-bg);
            border: 1px solid var(--border);
            padding: 1.5rem;
            border-radius: 10px;
            margin-top: 1rem;
        }

        .faq-item {
            margin-bottom: 1.5rem;
        }

        .faq-question {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            display: block;
        }

        .faq-answer {
            color: var(--text-secondary);
            text-align: justify;
        }

        .last-updated {
            text-align: center;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 3rem;
            font-size: 0.9rem;
            text-transform: uppercase;
        }

        a {
            color: var(--primary);
            text-decoration: underline;
        }

        /* Accordion Styles */
        .faq-accordion details {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 1rem;
            padding: 1rem;
            transition: all 0.3s ease;
        }

        .faq-accordion summary {
            font-weight: 700;
            cursor: pointer;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--text-primary);
        }

        .faq-accordion summary::after {
            content: '+';
            font-size: 1.5rem;
            color: var(--primary);
        }

        .faq-accordion details[open] summary::after {
            content: '−';
        }

        .faq-accordion .faq-answer {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
        }

        /* Mobile-First Adjustments */
        @media (max-width: 768px) {
            .trust-center-container {
                padding: 15px;
            }
            h1 { font-size: 1.8rem; }
            h2 { font-size: 1.5rem; }
            h3 { font-size: 1.3rem; }
            p, li { font-size: 1rem; }
        }
    </style>
</head>
<body>
    <div class="trust-center-container">
        <div class="content-wrapper">
<h1>SmartGen Trust Center</h1>
<div class="version-header" style="background: var(--background); border: 2px solid var(--primary); padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
        <h2 style="margin-top: 0; border: none; text-align: center;">Version Information</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: left; margin-top: 20px;">
            <div><strong>Mobile App Version:</strong> v1.0.0 (FIRST PUBLIC RELEASE)</div>
            <div><strong>Web Tools Version:</strong> v3.2.0 (Stable GitHub Release)</div>
            <div><strong>Privacy Policy Version:</strong> v1.0.0</div>
            <div><strong>Trust Center Edition:</strong> 2026.06</div>
            <div><strong>Build Type:</strong> Production Release Candidate</div>
        </div>
        <p style="margin-top: 20px; font-style: italic; font-size: 0.9rem;">
            * v1.0.0: First production release (mobile app)<br>
            * v3.2.0: Web tools stable release<br>
            * Future updates may include new tools, improvements, performance optimizations, and compliance enhancements aligned with Google Play policies and third-party SDK requirements.
        </p>
        <p style="margin-top: 10px;">
            <a href="https://smartgentools.com/updates/" target="_blank">Version Change Log</a> | 
            <a href="https://smartgentools.com/blog/" target="_blank">Resources & Blog</a>
        </p>
    </div>
<section>
                <p>Welcome to the <strong><a href="https://www.smartgentools.com/trust-center">SmartGen Trust Center</a></strong>. This is not just a legal page; it is a comprehensive guide to our operational DNA. In an era of digital uncertainty, we believe that transparency is the ultimate currency. This document provides an exhaustive deep-dive into how we build, why we build, and how we protect the millions of users who rely on our Flutter-powered ecosystem every day.</p>
            </section>
<section id="data-processing-disclosure">
        <h2>Core Data Processing & Analytics Disclosure</h2>
        <div class="mega-resource-box">
            <p>“SmartGen does not collect or store personal or user-generated content. However, limited non-personal technical data such as device information, crash logs, and advertising identifiers may be processed by trusted third-party services including Google Firebase, Google Analytics, Google Tag Manager, and Google AdMob for performance, stability, analytics, and advertising purposes.”</p>
            <p><strong>Alignment Rule:</strong> No personal data collected, only anonymized technical data via third-party services.</p>
        </div>
    </section>
<section id="children-privacy-enhancement">
        <h2>Children’s Privacy & Age Restrictions</h2>
        <div class="mega-resource-box">
            <p>“SmartGen is not directed to children under the age of 13 (or applicable digital consent age in your region). We do not knowingly collect personal data from children. If a minor uses the application, parental or guardian consent is required where applicable, especially for features involving advertising or analytics.”</p>
            <h3>Children & Minor Safety Enhancement</h3>
            <p>We do not knowingly:</p>
            <ul>
                <li>Collect personal data from children</li>
                <li>Profile minors for advertising</li>
                <li>Encourage unsupervised use of sensitive tools</li>
            </ul>
            <p>If a parent or guardian believes a child has used the app inappropriately, they may contact us for immediate review and removal of any related technical logs.</p>
            <p><strong>Note:</strong> AdMob is configured to comply with child-safe advertising policies (including restricted ad targeting where applicable).</p>
        </div>
    </section>
<section id="api-data-flow">
        <h2>External API Processing & Data Flow</h2>
        <div class="mega-resource-box">
            <p>“Certain features such as AI Vocal Remover or URL generation tools may use external APIs. All API requests are initiated only by user action. Data is processed solely for completing the requested function and is not permanently stored by SmartGen servers.”</p>
            <h3>Clarification on API Usage</h3>
            <ul>
                <li>Only user-provided input for that specific tool is transmitted.</li>
                <li>Data is processed temporarily and not stored by SmartGen.</li>
                <li>Third-party APIs may apply their own privacy policies.</li>
            </ul>
            <p><strong>Requirement:</strong> Users must actively initiate these features.</p>
        </div>
    </section>
<section id="analytics-transparency">
        <h2>Analytics, Firebase & Tracking Transparency</h2>
        <div class="mega-resource-box">
            <p>“SmartGen uses Google Firebase, Google Analytics, and Google Tag Manager to collect aggregated, anonymized technical data for crash reporting, performance monitoring, and usage analytics. This data does not directly identify individual users.”</p>
            <ul>
                <li><strong>Google Analytics / Google Tag Manager:</strong> Usage insights only.</li>
                <li><strong>Firebase Crashlytics:</strong> App stability & error reporting.</li>
                <li><strong>Google AdMob:</strong> Advertising delivery & ad performance metrics.</li>
            </ul>
            <p>This data is non-personal, aggregated, and used strictly for performance, stability, and monetization.</p>
        </div>
    </section>
<section id="user-data-control">
        <h2>User Data Requests & Privacy Control</h2>
        <div class="mega-resource-box">
            <p>“Users may request clarification, deletion of locally stored data, or information related to third-party analytics identifiers by contacting: <a href="mailto:cwb.agency@outlook.com">cwb.agency@outlook.com</a> (Subject: Data Privacy Request).”</p>
            <h3>Data Deletion & User Control</h3>
            <p>Since SmartGen does not maintain user accounts or centralized storage, no server-side deletion request is required. All locally stored data can be removed by:</p>
            <ul>
                <li>Clearing app storage</li>
                <li>Clearing browser cache (for web tools)</li>
                <li>Uninstalling the application</li>
            </ul>
        </div>
    </section>
(ALREADY ADDED IN PREVIOUS STEP, BUT REINFORCING HERE) -->
    <section id="admob-disclosure-update">
        <h2>AdMob Advertising Disclosure (Updated)</h2>
        <div class="mega-resource-box">
            <p>“Users can opt out of personalized advertising at any time by adjusting device-level advertising settings or resetting their advertising identifier.”</p>
            <h3>Ad Personalization & Opt-Out Control</h3>
            <p>Advertising in SmartGen is provided via Google AdMob. Users can:</p>
            <ul>
                <li>Opt out of personalized ads via device settings.</li>
                <li>Reset Advertising ID anytime from Android settings.</li>
                <li>Limit ad tracking depending on region settings.</li>
            </ul>
            <p>SmartGen does not directly control AdMob’s internal ad targeting system.</p>
        </div>
    </section>
<section id="account-policy">
        <h2>Account & Registration Policy</h2>
        <div class="mega-resource-box">
            <p>“SmartGen does not require user registration, login, or account creation. All features are accessible without creating any user profile or submitting personal credentials.”</p>
            <p>There is no account system, and therefore no user identity is stored, no personal profile is created, and no cross-device tracking is performed.</p>
        </div>
    </section>
<section id="privacy-architecture">
        <h2>Privacy-First Architecture Statement</h2>
        <div class="mega-resource-box">
            <p>“SmartGen follows a privacy-first, local-first architecture where most processing occurs directly on the user’s device to minimize data exposure.”</p>
        </div>
    </section>
<section id="google-play-compliance-summary">
        <h2>Google Play Data Safety & Compliance Summary</h2>
        <div class="mega-resource-box">
            <ul>
                <li>No sale of personal data</li>
                <li>Minimal technical data collection</li>
                <li>Firebase crash analytics disclosure</li>
                <li>AdMob advertising disclosure</li>
                <li>No user profiling beyond ads SDK</li>
            </ul>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: var(--background); border: 1px solid var(--border);">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 12px; border: 1px solid var(--border); text-align: left;">Data Type</th>
                        <th style="padding: 12px; border: 1px solid var(--border); text-align: left;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">Personal Data</td><td style="padding: 12px; border: 1px solid var(--border);">Not Collected</td></tr>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">User Content</td><td style="padding: 12px; border: 1px solid var(--border);">Not Stored</td></tr>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">Device Info</td><td style="padding: 12px; border: 1px solid var(--border);">Limited (Analytics Only)</td></tr>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">Crash Logs</td><td style="padding: 12px; border: 1px solid var(--border);">Yes (Firebase)</td></tr>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">Ads Data</td><td style="padding: 12px; border: 1px solid var(--border);">Yes (AdMob)</td></tr>
                    <tr><td style="padding: 12px; border: 1px solid var(--border);">Analytics Data</td><td style="padding: 12px; border: 1px solid var(--border);">Aggregated Only</td></tr>
                </tbody>
            </table>
        </div>
    </section>
<section id="third-party-disclosure-unified">
        <h2>Unified Third-Party Disclosure</h2>
        <div class="mega-resource-box">
            <p>SmartGen integrates the following third-party services:</p>
            <ul>
                <li>Google Firebase (Crashlytics, Analytics)</li>
                <li>Google AdMob (Advertising)</li>
                <li>Google Tag Manager (Event tracking)</li>
                <li>Optional external APIs (user-initiated features only)</li>
            </ul>
            <p>These services may process device information (non-personal), app usage metrics (aggregated), crash logs (anonymized), and advertising identifiers (for ads only).</p>
            <p><strong>Final Declaration:</strong> SmartGen does NOT sell data, does NOT share personal user content, and does NOT build user profiles.</p>
        </div>
    </section>
<section id="philosophy-of-privacy">
                <h2>Philosophy of Privacy & Security: The Edge Processing Imperative</h2>
                <p>At SmartGen, our commitment to user privacy and data security is not merely a policy; it is the foundational philosophy embedded in every line of code and every feature we develop. In an increasingly interconnected digital landscape, where personal data has become a commodity, we stand firm in our belief that privacy is a fundamental human right. This conviction drives our unwavering dedication to Edge Processing, a paradigm that places data control firmly in the hands of the user.</p>
                <p>Traditional cloud-based applications, while offering convenience, inherently introduce vulnerabilities. User data is transmitted to remote servers, processed, and then returned. This journey, often across multiple networks and through various third-party infrastructures, creates numerous points of potential interception, storage, and misuse. Even with robust encryption, the sheer volume of data aggregated on central servers makes them attractive targets for malicious actors. Furthermore, legal jurisdictions and data retention policies of cloud providers can complicate user control over their own information.</p>
                <p>SmartGen’s Edge Processing model fundamentally alters this dynamic. Instead of relying on distant servers, the vast majority of our core functionalities—such as QR code generation, image compression, text manipulation, and various calculations—are executed directly on your device. This means that when you use SmartGen to create a QR code from sensitive text, compress a personal image, or convert a document, that data never leaves your device. It is processed locally, within the secure confines of your smartphone, tablet, or web browser. This architectural choice is a deliberate and powerful statement: your data is yours, and its privacy is non-negotiable.</p>
                
                <div class="mega-resource-box">
                    <h3>The Unparalleled Advantages of Local Processing:</h3>
                    <ul>
                        <li><strong>Enhanced Security:</strong> By keeping data on the device, we eliminate the risks associated with data transmission and server-side storage. There is no central repository of user-generated content for hackers to target, significantly reducing the attack surface.</li>
                        <li><strong>Absolute Privacy:</strong> Since your input data is processed client-side, we have no access to it. We cannot collect, store, analyze, or monetize your personal information because it simply never reaches our systems. This provides a level of privacy that cloud-dependent applications cannot match.</li>
                        <li><strong>Offline Functionality:</strong> A direct benefit of Edge Processing is the ability to use many SmartGen tools without an internet connection. Whether you're in a remote area or simply wish to conserve data, our core utilities remain fully functional, empowering you with productivity anytime, anywhere.</li>
                        <li><strong>Superior Performance:</strong> Processing data locally often results in faster execution times. There's no network latency, no server queues, and no bandwidth limitations impacting your experience. Tasks are completed instantaneously, leveraging the processing power of your own device.</li>
                        <li><strong>User Empowerment:</strong> Edge Processing puts you in complete control. You decide what data is input, and you control its output. This model fosters a sense of digital sovereignty, allowing you to use powerful tools without sacrificing your personal information.</li>
                    </ul>
                </div>
            </section>
<section id="ethical-monetization">
                <h2>Ethical Monetization Strategy: Sustaining Innovation Without Compromise</h2>
                <p>SmartGen is built on a core principle: to provide powerful, high-quality utility tools that are 100% free and accessible to everyone. This commitment, however, comes with inherent operational costs—costs associated with continuous development, infrastructure maintenance, security audits, and supporting a global user base. The question naturally arises: "How does SmartGen sustain itself without charging users or compromising their privacy?"</p>
                <p>Our answer lies in a carefully considered Ethical Monetization Strategy, a model designed to generate necessary revenue while upholding our values of transparency, user respect, and data integrity. We firmly reject business models that rely on selling user data, implementing intrusive paywalls, or employing deceptive advertising practices. Instead, we embrace a sustainable approach that aligns with our mission to empower users.</p>
                
                <div class="mega-resource-box">
                    <h3>The Imperative of Sustainable Funding:</h3>
                    <p>Developing and maintaining cutting-edge software is a resource-intensive endeavor. It requires:</p>
                    <ul>
                        <li><strong>Skilled Engineering:</strong> Talented developers dedicate countless hours to designing, coding, testing, and refining features.</li>
                        <li><strong>Robust Infrastructure:</strong> While our core processing is on-device, certain functionalities (like updates, content delivery, and crash reporting) require secure cloud infrastructure.</li>
                        <li><strong>Security & Compliance:</strong> Ongoing security audits, vulnerability assessments, and adherence to evolving privacy regulations are critical to protecting our users.</li>
                        <li><strong>Customer Support:</strong> Providing timely and effective support to a diverse global community.</li>
                        <li><strong>Innovation:</strong> Investing in research and development to bring new, valuable tools to our users.</li>
                    </ul>
                </div>
            </section>
<section id="responsibility-framework">
                <h2>The Responsibility Framework: Empowering Users, Clarifying Roles</h2>
                <p>At SmartGen, we are dedicated to providing powerful, intuitive tools that enhance your digital productivity. However, it is crucial to establish a clear Responsibility Framework that delineates the roles of SmartGen as the utility provider and you, the user, as the ultimate controller and decision-maker. We equip you with advanced capabilities, but the application and implications of these capabilities rest squarely with the user.</p>
                
                <div class="mega-resource-box">
                    <h3>Understanding Your Role as the User:</h3>
                    <p>SmartGen's tools are designed to be versatile and adaptable to a wide range of personal and professional needs. Whether you are generating a QR code for a business, compressing an image for a website, or converting text for a document, our applications function as sophisticated instruments. Like any powerful instrument, its effectiveness and ethical use are determined by the operator. We provide the hammer, but you decide what to build, or indeed, what to strike.</p>
                </div>
            </section>
<section id="technical-excellence">
                <h2>Why Choose SmartGen: Technical Excellence & Reliability</h2>
                <p>In the rapidly evolving landscape of mobile and web applications, the underlying technology stack is paramount to delivering a superior user experience. SmartGen is not just a collection of tools; it is a testament to Technical Excellence & Reliability, meticulously engineered using a combination of cutting-edge frameworks and robust cloud services. Our choice of Flutter and Firebase is deliberate, aimed at providing an application that is not only powerful and feature-rich but also exceptionally fast, stable, and secure across all platforms.</p>
            </section>
<section id="tools-summary">
                <h2>SmartGen Tools: Summary & FAQs</h2>
                <p>Explore our suite of tools designed for productivity, security, and digital empowerment. Each tool is built with our privacy-first philosophy.</p>

                <!-- QR Generator -->
                <div class="tool-summary">
                    <h4>QR Code Generator</h4>
                    <p><strong>What it is:</strong> A high-performance tool to create custom QR codes for URLs, text, Wi-Fi, and more.</p>
                    <p><strong>How it works:</strong> It uses local mathematical algorithms to render the QR pattern instantly on your device.</p>
                    <p><strong>Why use it:</strong> To share information quickly and securely without relying on third-party tracking links.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: Are my QR codes saved on your server?</span>
                            <p class="faq-answer">A: No. All QR codes are generated locally and are never transmitted to or stored on our servers.</p>
                        </div>
                        <div class="faq-item">
                            <span class="faq-question">Q: Can I customize the look of the QR code?</span>
                            <p class="faq-answer">A: Yes, our generator allows for color and style adjustments directly within the interface.</p>
                        </div>
                    </div>
                </div>

                <!-- Image Compressor -->
                <div class="tool-summary">
                    <h4>Image Compressor</h4>
                    <p><strong>What it is:</strong> A tool to reduce image file size while maintaining visual quality.</p>
                    <p><strong>How it works:</strong> It processes the image pixels locally using your device's GPU/CPU to re-encode the file efficiently.</p>
                    <p><strong>Why use it:</strong> To save storage space and speed up web uploads without sacrificing your privacy.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: Does compressing images reduce quality significantly?</span>
                            <p class="faq-answer">A: Our algorithms are optimized to balance file size reduction with high visual fidelity.</p>
                        </div>
                        <div class="faq-item">
                            <span class="faq-question">Q: Is it safe to compress private photos?</span>
                            <p class="faq-answer">A: Absolutely. Since processing is local, your photos never leave your device.</p>
                        </div>
                    </div>
                </div>

                <!-- Password Generator -->
                <div class="tool-summary">
                    <h4>Secure Password Generator</h4>
                    <p><strong>What it is:</strong> A utility to create cryptographically strong, random passwords.</p>
                    <p><strong>How it works:</strong> It uses your device's local entropy to generate unpredictable character strings.</p>
                    <p><strong>Why use it:</strong> To ensure your online accounts are protected by high-entropy passwords that are never seen by anyone else.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: How secure are the generated passwords?</span>
                            <p class="faq-answer">A: We use industry-standard randomization techniques to ensure maximum complexity and security.</p>
                        </div>
                        <div class="faq-item">
                            <span class="faq-question">Q: Do you store my generated passwords?</span>
                            <p class="faq-answer">A: No. We have no database for passwords; they are generated and shown only to you.</p>
                        </div>
                    </div>
                </div>

                <!-- EMI Calculator -->
                <div class="tool-summary">
                    <h4>EMI Calculator</h4>
                    <p><strong>What it is:</strong> A financial tool to calculate Equated Monthly Installments for loans.</p>
                    <p><strong>How it works:</strong> It performs standard financial calculations locally based on your input parameters.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: Is my financial data kept private?</span>
                            <p class="faq-answer">A: Yes, all calculations are performed on your device and are not shared.</p>
                        </div>
                    </div>
                </div>

                <!-- Word Counter -->
                <div class="tool-summary">
                    <h4>Word Counter & Text Analyzer</h4>
                    <p><strong>What it is:</strong> A tool to count words, characters, and analyze text structure.</p>
                    <p><strong>How it works:</strong> It scans your input text locally to provide real-time statistics.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: Can it handle large documents?</span>
                            <p class="faq-answer">A: Yes, it is optimized for performance and can process large amounts of text instantly.</p>
                        </div>
                    </div>
                </div>

                <!-- Privacy Policy Generator -->
                <div class="tool-summary">
                    <h4>Privacy Policy Generator</h4>
                    <p><strong>What it is:</strong> A utility to create professional privacy policies for apps and websites.</p>
                    <p><strong>How it works:</strong> It takes your inputs and formats them into a legally-compliant template locally.</p>
                    <div class="faq-section">
                        <div class="faq-item">
                            <span class="faq-question">Q: Are the generated policies legally binding?</span>
                            <p class="faq-answer">A: They provide a strong foundation, but we always recommend a final review by a legal professional.</p>
                        </div>
                    </div>
                </div>
            </section>
<section id="tools-ecosystem">
        <h2>SmartGen Tools Ecosystem Overview</h2>
        <p>A comprehensive directory of our specialized utilities, categorized by their primary function.</p>

        <h3>Developer & Technical Tools</h3>
        <div class="mega-resource-box">
            <div class="tool-summary">
                <h4>Base64 to Image Decoder</h4>
                <p><strong>Short Summary:</strong> Converts Base64 strings back into viewable image files.</p>
                <p><strong>Purpose:</strong> Useful for developers debugging data URIs or embedded images.</p>
                <p><strong>Local Processing Note:</strong> Decoding happens entirely in your browser/app memory.</p>
            </div>
            <div class="tool-summary">
                <h4>CSS Gradient Generator</h4>
                <p><strong>Short Summary:</strong> Create beautiful CSS linear and radial gradients visually.</p>
                <p><strong>Purpose:</strong> Simplifies UI design by generating ready-to-use CSS code.</p>
                <p><strong>Local Processing Note:</strong> Real-time rendering is handled by your device's GPU.</p>
            </div>
            <div class="tool-summary">
                <h4>MD5/SHA Hash Generator</h4>
                <p><strong>Short Summary:</strong> Generates secure cryptographic hashes for text or files.</p>
                <p><strong>Purpose:</strong> Verifying data integrity and password security testing.</p>
                <p><strong>Privacy Note:</strong> Your input data is never sent to a server; hashing is local.</p>
            </div>
            <div class="tool-summary">
                <h4>Live HTML Previewer</h4>
                <p><strong>Short Summary:</strong> Instantly renders HTML, CSS, and JS code in a sandbox.</p>
                <p><strong>Purpose:</strong> Rapid prototyping and testing of web snippets.</p>
                <p><strong>Local Processing Note:</strong> Uses an iframe to render code locally without server execution.</p>
            </div>
            <div class="tool-summary">
                <h4>IP Address Lookup</h4>
                <p><strong>Short Summary:</strong> Displays public IP information and geolocation data.</p>
                <p><strong>Purpose:</strong> Network troubleshooting and security verification.</p>
                <p><strong>Privacy Note:</strong> We do not log the IP addresses that use this tool.</p>
            </div>
            <div class="tool-summary">
                <h4>JSON Formatter & Validator</h4>
                <p><strong>Short Summary:</strong> Beautifies and checks JSON data for syntax errors.</p>
                <p><strong>Purpose:</strong> Essential for API development and data debugging.</p>
                <p><strong>Local Processing Note:</strong> Parsing and formatting are performed client-side.</p>
            </div>
            <div class="tool-summary">
                <h4>Meta Tag Generator</h4>
                <p><strong>Short Summary:</strong> Creates SEO-optimized meta tags for websites.</p>
                <p><strong>Purpose:</strong> Improving search engine visibility and social sharing previews.</p>
                <p><strong>Local Processing Note:</strong> Generates HTML tags based on your input locally.</p>
            </div>
            <div class="tool-summary">
                <h4>Picture URL Generator</h4>
                <p><strong>Short Summary:</strong> Converts local images into temporary or permanent URLs.</p>
                <p><strong>Purpose:</strong> Sharing images in environments that only accept links.</p>
                <p><strong>Third-Party Note:</strong> May use secure cloud storage with user-controlled deletion.</p>
            </div>
            <div class="tool-summary">
                <h4>QR Code Generator</h4>
                <p><strong>Short Summary:</strong> Creates custom QR codes for various data types.</p>
                <p><strong>Purpose:</strong> Bridging physical and digital information sharing.</p>
                <p><strong>Local Processing Note:</strong> All encoding logic is offline-capable.</p>
            </div>
            <div class="tool-summary">
                <h4>Random Choice Picker</h4>
                <p><strong>Short Summary:</strong> Randomly selects an item from a provided list.</p>
                <p><strong>Purpose:</strong> Decision-making, giveaways, and random sampling.</p>
                <p><strong>Local Processing Note:</strong> Uses your device's random number generator.</p>
            </div>
            <div class="tool-summary">
                <h4>Robots.txt Generator</h4>
                <p><strong>Short Summary:</strong> Generates instructions for search engine crawlers.</p>
                <p><strong>Purpose:</strong> Controlling how search engines index your website.</p>
                <p><strong>Local Processing Note:</strong> Outputs text files based on your selections.</p>
            </div>
            <div class="tool-summary">
                <h4>Schema Generator</h4>
                <p><strong>Short Summary:</strong> Creates JSON-LD structured data for SEO.</p>
                <p><strong>Purpose:</strong> Helping search engines understand your content better.</p>
                <p><strong>Local Processing Note:</strong> Formats schema markup entirely on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>URL Encoder-Decoder</h4>
                <p><strong>Short Summary:</strong> Safely encodes or decodes special characters in URLs.</p>
                <p><strong>Purpose:</strong> Ensuring URL compatibility across different systems.</p>
                <p><strong>Local Processing Note:</strong> Uses standard browser encoding libraries locally.</p>
            </div>
            <div class="tool-summary">
                <h4>UUID / GUID Generator</h4>
                <p><strong>Short Summary:</strong> Generates unique identifiers for databases and apps.</p>
                <p><strong>Purpose:</strong> Ensuring data uniqueness in software development.</p>
                <p><strong>Local Processing Note:</strong> Generates random IDs without server interaction.</p>
            </div>
        </div>

        <h3>Marketing & Social Media</h3>
        <div class="mega-resource-box">
            <div class="tool-summary">
                <h4>Blog Title Generator</h4>
                <p><strong>Short Summary:</strong> Suggests catchy and SEO-friendly titles for articles.</p>
                <p><strong>Purpose:</strong> Overcoming writer's block and improving click-through rates.</p>
                <p><strong>Local Processing Note:</strong> Uses local template logic to generate suggestions.</p>
            </div>
            <div class="tool-summary">
                <h4>Disclaimer Generator</h4>
                <p><strong>Short Summary:</strong> Creates legal disclaimers for websites and apps.</p>
                <p><strong>Purpose:</strong> Protecting owners from legal liability.</p>
                <p><strong>Local Processing Note:</strong> Templates are populated on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>Facebook ID Finder</h4>
                <p><strong>Short Summary:</strong> Retrieves the numeric ID for Facebook profiles/pages.</p>
                <p><strong>Purpose:</strong> Integrating Facebook features into websites or apps.</p>
                <p><strong>Third-Party Note:</strong> Fetches data from public Facebook Graph API endpoints.</p>
            </div>
            <div class="tool-summary">
                <h4>Hashtag Generator</h4>
                <p><strong>Short Summary:</strong> Discovers trending and relevant hashtags for social posts.</p>
                <p><strong>Purpose:</strong> Increasing social media reach and engagement.</p>
                <p><strong>Local Processing Note:</strong> Suggests tags based on keyword analysis.</p>
            </div>
            <div class="tool-summary">
                <h4>Mailto Generator</h4>
                <p><strong>Short Summary:</strong> Creates HTML email links with pre-filled subjects/bodies.</p>
                <p><strong>Purpose:</strong> Simplifying contact options for website visitors.</p>
                <p><strong>Local Processing Note:</strong> Generates standard HTML code locally.</p>
            </div>
            <div class="tool-summary">
                <h4>Privacy Policy Generator</h4>
                <p><strong>Short Summary:</strong> Generates custom privacy policies based on your needs.</p>
                <p><strong>Purpose:</strong> Ensuring compliance with global privacy laws.</p>
                <p><strong>Local Processing Note:</strong> Your inputs are never stored on our servers.</p>
            </div>
            <div class="tool-summary">
                <h4>Terms & Conditions Generator</h4>
                <p><strong>Short Summary:</strong> Creates usage agreements for digital platforms.</p>
                <p><strong>Purpose:</strong> Defining the rules and guidelines for your users.</p>
                <p><strong>Local Processing Note:</strong> Logic-based template generation happens locally.</p>
            </div>
            <div class="tool-summary">
                <h4>UTM Link Builder</h4>
                <p><strong>Short Summary:</strong> Adds tracking parameters to URLs for marketing campaigns.</p>
                <p><strong>Purpose:</strong> Measuring the effectiveness of different traffic sources.</p>
                <p><strong>Local Processing Note:</strong> Appends parameters to your URL client-side.</p>
            </div>
            <div class="tool-summary">
                <h4>WhatsApp Link Generator</h4>
                <p><strong>Short Summary:</strong> Creates direct chat links for WhatsApp with custom messages.</p>
                <p><strong>Purpose:</strong> Making it easier for customers to start a conversation.</p>
                <p><strong>Local Processing Note:</strong> Formats the WhatsApp API link on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>YouTube Thumbnail Downloader</h4>
                <p><strong>Short Summary:</strong> Retrieves high-quality thumbnails from YouTube videos.</p>
                <p><strong>Purpose:</strong> For use in blog posts, social media, or design projects.</p>
                <p><strong>Third-Party Note:</strong> Accesses public YouTube image servers directly.</p>
            </div>
            <div class="tool-summary">
                <h4>AI Vocal Remover</h4>
                <p><strong>Short Summary:</strong> Separates vocals from music tracks using AI.</p>
                <p><strong>Purpose:</strong> Creating karaoke tracks or sampling music.</p>
                <p><strong>Local Processing Note:</strong> Uses advanced browser-based ML (where supported) or secure processing.</p>
            </div>
        </div>

        <h3>SEO & Content</h3>
        <div class="mega-resource-box">
            <div class="tool-summary">
                <h4>Keyword Density Checker</h4>
                <p><strong>Short Summary:</strong> Analyzes how often keywords appear in your text.</p>
                <p><strong>Purpose:</strong> Optimizing content for search engine rankings.</p>
                <p><strong>Local Processing Note:</strong> Text analysis is performed entirely on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>Lorem Ipsum Generator</h4>
                <p><strong>Short Summary:</strong> Generates placeholder text for design layouts.</p>
                <p><strong>Purpose:</strong> Visualizing how content will look before it's written.</p>
                <p><strong>Local Processing Note:</strong> Randomly generates text from a local dictionary.</p>
            </div>
            <div class="tool-summary">
                <h4>SERP Preview Tool</h4>
                <p><strong>Short Summary:</strong> Shows how your page will look in Google search results.</p>
                <p><strong>Purpose:</strong> Optimizing titles and descriptions for better CTR.</p>
                <p><strong>Local Processing Note:</strong> Renders a visual preview in your browser.</p>
            </div>
            <div class="tool-summary">
                <h4>Text Case Converter</h4>
                <p><strong>Short Summary:</strong> Changes text to UPPERCASE, lowercase, Title Case, etc.</p>
                <p><strong>Purpose:</strong> Quick formatting of large text blocks.</p>
                <p><strong>Local Processing Note:</strong> Instant transformation without server calls.</p>
            </div>
            <div class="tool-summary">
                <h4>Word Counter</h4>
                <p><strong>Short Summary:</strong> Counts words, characters, and reading time.</p>
                <p><strong>Purpose:</strong> Meeting length requirements for articles or essays.</p>
                <p><strong>Local Processing Note:</strong> Real-time analysis happens as you type.</p>
            </div>
            <div class="tool-summary">
                <h4>Sitemap Finder & Custom XML Downloader</h4>
                <p><strong>Short Summary:</strong> Locates and generates XML sitemaps for websites.</p>
                <p><strong>Purpose:</strong> Improving site indexability for search engines.</p>
                <p><strong>Local Processing Note:</strong> Scans and compiles sitemap data locally.</p>
            </div>
        </div>

        <h3>Daily Utilities & Calculators</h3>
        <div class="mega-resource-box">
            <div class="tool-summary">
                <h4>Age Calculator</h4>
                <p><strong>Short Summary:</strong> Calculates exact age in years, months, and days.</p>
                <p><strong>Purpose:</strong> Quick age verification and birthday planning.</p>
                <p><strong>Local Processing Note:</strong> Date math is performed locally.</p>
            </div>
            <div class="tool-summary">
                <h4>BMI BMR Calculator</h4>
                <p><strong>Short Summary:</strong> Calculates Body Mass Index and Basal Metabolic Rate.</p>
                <p><strong>Purpose:</strong> Tracking health and fitness metrics.</p>
                <p><strong>Privacy Note:</strong> Your physical data is never stored or shared.</p>
            </div>
            <div class="tool-summary">
                <h4>CPM ROI Calculator</h4>
                <p><strong>Short Summary:</strong> Calculates advertising costs and return on investment.</p>
                <p><strong>Purpose:</strong> Planning and evaluating marketing budgets.</p>
                <p><strong>Local Processing Note:</strong> Financial formulas are executed client-side.</p>
            </div>
            <div class="tool-summary">
                <h4>Color Palette Extractor</h4>
                <p><strong>Short Summary:</strong> Pulls a color palette from any uploaded image.</p>
                <p><strong>Purpose:</strong> Design inspiration and brand consistency.</p>
                <p><strong>Local Processing Note:</strong> Image pixel analysis is done on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>EMI Calculator</h4>
                <p><strong>Short Summary:</strong> Calculates monthly loan repayments.</p>
                <p><strong>Purpose:</strong> Financial planning and loan comparison.</p>
                <p><strong>Local Processing Note:</strong> Offline-capable financial calculations.</p>
            </div>
            <div class="tool-summary">
                <h4>Fancy Font Generator</h4>
                <p><strong>Short Summary:</strong> Converts text into various stylish Unicode fonts.</p>
                <p><strong>Purpose:</strong> Enhancing social media bios and posts.</p>
                <p><strong>Local Processing Note:</strong> Character mapping is done locally.</p>
            </div>
            <div class="tool-summary">
                <h4>Image Compressor</h4>
                <p><strong>Short Summary:</strong> Reduces image file size without losing quality.</p>
                <p><strong>Purpose:</strong> Faster web loading and storage saving.</p>
                <p><strong>Local Processing Note:</strong> Compression logic runs in your browser/app.</p>
            </div>
            <div class="tool-summary">
                <h4>Password Generator</h4>
                <p><strong>Short Summary:</strong> Creates strong, random passwords.</p>
                <p><strong>Purpose:</strong> Improving online account security.</p>
                <p><strong>Local Processing Note:</strong> High-entropy generation happens on-device.</p>
            </div>
            <div class="tool-summary">
                <h4>Percentage Calculator</h4>
                <p><strong>Short Summary:</strong> Solves various percentage-based math problems.</p>
                <p><strong>Purpose:</strong> Quick math for discounts, tips, and growth.</p>
                <p><strong>Local Processing Note:</strong> Instant calculations without internet.</p>
            </div>
            <div class="tool-summary">
                <h4>Pomodoro Timer</h4>
                <p><strong>Short Summary:</strong> A focus timer based on the Pomodoro Technique.</p>
                <p><strong>Purpose:</strong> Improving productivity and time management.</p>
                <p><strong>Local Processing Note:</strong> Timer logic runs locally on your device.</p>
            </div>
            <div class="tool-summary">
                <h4>Secure Notepad</h4>
                <p><strong>Short Summary:</strong> A private area to write and save notes locally.</p>
                <p><strong>Purpose:</strong> Quick drafting without cloud syncing.</p>
                <p><strong>Privacy Note:</strong> Notes are stored in your device's local storage only.</p>
            </div>
            <div class="tool-summary">
                <h4>Unit Converter</h4>
                <p><strong>Short Summary:</strong> Converts between different units of measurement.</p>
                <p><strong>Purpose:</strong> Daily utility for weight, length, temperature, etc.</p>
                <p><strong>Local Processing Note:</strong> Conversion tables are built into the app.</p>
            </div>
        </div>

        <h3>Tool-Specific Privacy Commitments</h3>
        <div class="mega-resource-box">
            <ul>
                <li><strong>Local Processing Tools:</strong> 90% of our tools (Calculators, Converters, Generators) process data entirely on your device.</li>
                <li><strong>Browser-Based Processing:</strong> For our web suite, processing happens in your browser's memory and is cleared upon closing the tab.</li>
                <li><strong>Offline-Capable Features:</strong> Most tools do not require an internet connection once the app/page is loaded.</li>
                <li><strong>Internet-Required Features:</strong> Only tools that fetch external data (IP Lookup, YouTube Downloader) require an active connection.</li>
                <li><strong>Third-Party Service Interactions:</strong> We only interact with external APIs (like Google or Facebook) when explicitly requested by the tool's function.</li>
                <li><strong>User Data Protection Measures:</strong> We use sandbox environments and local-only storage to ensure your data never leaks to the cloud.</li>
            </ul>
        </div>
    </section>
<section id="user-empowerment-guide">
                <h2>User Empowerment Guide: Managing Your Digital Borders</h2>
                <p>We believe that a user who understands their device is a safer user. This section explains the "What" and "Why" of every permission we might request, and how you can manage them to maintain control over your digital environment.</p>
                <div class="mega-resource-box">
                    <h3>Permission Deep-Dive: Understanding and Managing Access</h3>
                    <ul>
                        <li><strong>Camera Access:</strong> Essential for QR scanning. Processed in real-time; no images stored.</li>
                        <li><strong>Storage Access:</strong> Needed to save generated files or load images. We only access files you select.</li>
                        <li><strong>Internet Access:</strong> Required for updates and ad-supported features. Core tools remain offline-capable.</li>
                    </ul>
                </div>
            </section>
<section id="developer-commitment">
                <h2>Developer Commitment & Transparency</h2>
                <p>SmartGen is the product of dedicated effort, guided by a clear vision for user empowerment and ethical technology. Spearheaded by Sayad Md Bayezid Hosan, we bridge the gap between complex technology and user-friendly utilities.</p>
            </section>
<section id="expanded-faq">
        <h2>Frequently Asked Questions (Expanded)</h2>
        <div class="faq-accordion">
            <details class="faq-item">
                <summary class="faq-question">How does SmartGen protect my data during processing?</summary>
                <div class="faq-answer">
                    <p>We use "Edge Processing," meaning the logic to generate your QR code, compress your image, or calculate your loan happens directly on your device. Your data never travels to our servers, eliminating the risk of interception or unauthorized storage.</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">Why are the tools free? What's the catch?</summary>
                <div class="faq-answer">
                    <p>There is no catch. We monetize through non-intrusive advertisements (Google AdMob) and optional donations. This allows us to keep the tools free for everyone while covering our development and infrastructure costs.</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">Can I use SmartGen tools offline?</summary>
                <div class="faq-answer">
                    <p>Yes! Once the app or website is loaded, the majority of our tools—including the QR Generator, Image Compressor, and all Calculators—work perfectly without an internet connection.</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">Does SmartGen sell my personal information to third parties?</summary>
                <div class="faq-answer">
                    <p>Absolutely not. We do not even collect your personal information (name, email, etc.) in the first place, so there is nothing for us to sell. We are committed to a zero-data-collection philosophy.</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">Are the legal documents generated by SmartGen legally binding?</summary>
                <div class="faq-answer">
                    <p>The Privacy Policy and Terms & Conditions generators provide professional-grade templates that comply with standard regulations. However, since every business is unique, we recommend having a legal professional review the final document to ensure it meets your specific needs.</p>
                </div>
            </details>
            <details class="faq-item">
                <summary class="faq-question">How can I contact support if I find a bug?</summary>
                <div class="faq-answer">
                    <p>You can reach us directly at <a href="mailto:cwb.agency@outlook.com">cwb.agency@outlook.com</a>. We appreciate user feedback and typically respond within 24-48 hours.</p>
                </div>
            </details>
        </div>
    </section>
<section id="final-declaration">
        <h2>Final Declaration</h2>
        <div class="mega-resource-box">
            <p>SmartGen is built on a strict privacy-first architecture where:</p>
            <ul>
                <li>User content remains on-device</li>
                <li>No personal data is stored or sold</li>
                <li>Third-party services are used only for essential functionality</li>
                <li>Users retain full control over their data</li>
            </ul>
            <p>This document represents the official compliance and transparency framework for SmartGen’s first production release.</p>
        </div>
    </section>
<section id="contact-information">
                <h2>Contact & Official Support Channels</h2>
                <div class="mega-resource-box">
                    <ul>
                        <li><strong>Official Website:</strong> <a href="https://www.smartgentools.com">www.smartgentools.com</a></li>
                        <li><strong>Support Email:</strong> <a href="mailto:cwb.agency@outlook.com">cwb.agency@outlook.com</a></li>
                        <li><strong>Developer Portfolio:</strong> <a href="https://www.sayadbayezid.com">www.sayadbayezid.com</a></li>
                        <li><strong>GitHub Repository:</strong> <a href="https://github.com/bayzed123/SmartGenQR.oi">SmartGen Open Source</a></li>
                    </ul>
                </div>
            </section>
<section id="copyright-notice" style="text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                <p>&copy; 2023-2026 SmartGen. All rights reserved. Built with passion and integrity by Sayad Md Bayezid Hosan.</p>
            </section>
        </div>
    </div>
</body>
</html>
---
**Copyright (c) 2026 Sayad Md Bayezid Hosan**

---



