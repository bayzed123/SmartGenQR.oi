---
title: "Getting Started"
description: "Learn how to set up and start contributing to SmartGen."
order: 1
---

# Getting Started

Welcome to the SmartGen project! This guide will help you get your local environment ready for development.

#  Architecture & Tech Stack

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
