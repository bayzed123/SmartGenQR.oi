---
title: "developer Guidelines"
description: "Learn how to quickly set up SmartGen tools."
category: "overview"
order: 3
---
# Developer Guidelines for SmartGen

This document outlines the coding guidelines and best practices for contributing to the SmartGenQR.oi project. Adhering to these guidelines ensures code consistency, maintainability, and collaboration efficiency.

## 1. General Principles

*   **Readability:** Write code that is easy to understand for other developers and your future self.
*   **Maintainability:** Design and implement solutions that are easy to modify, debug, and extend.
*   **Consistency:** Follow existing coding styles and patterns within the project.
*   **Performance:** Optimize code for efficiency without sacrificing readability or maintainability.
*   **Security:** Always consider security implications when writing code, especially when handling user input or external data.

## 2. Code Formatting

### JavaScript/Node.js

*   Use `prettier` and `eslint` for automatic formatting and linting. Ensure your IDE is configured to use them on save.
*   **Indentation:** Use 2 spaces for indentation.
*   **Semicolons:** Always use semicolons at the end of statements.
*   **Quotes:** Use single quotes for strings, unless escaping is required.
*   **Braces:** Use K&R style for braces (opening brace on the same line as the statement).

```javascript
// Good
function exampleFunction() {
  if (true) {
    console.log('Hello, World!');
  }
}

// Bad
function anotherFunction()
{
  if (true)
  {
    console.log("Hello, World!");
  }
}
```

### HTML

*   Use `prettier` for HTML formatting.
*   **Indentation:** Use 2 spaces for indentation.
*   **Self-closing tags:** Self-close tags where appropriate (e.g., `<img />`, `<input />`).
*   **Attribute order:** Maintain a consistent order for attributes (e.g., `id`, `class`, `src`, `alt`).

### CSS

*   Use `prettier` for CSS formatting.
*   **Indentation:** Use 2 spaces for indentation.
*   **Selectors:** Group related properties together.
*   **Units:** Use `rem` or `em` for most sizing, `px` for borders or small adjustments.

## 3. Naming Conventions

*   **Variables and Functions:** Use `camelCase`.
    ```javascript
    const myVariableName = 'value';
    function calculateTotalAmount() { /* ... */ }
    ```
*   **Constants:** Use `SCREAMING_SNAKE_CASE`.
    ```javascript
    const MAX_ITEMS = 10;
    ```
*   **Classes (CSS/JavaScript):** Use `PascalCase` for JavaScript classes and `kebab-case` for CSS classes.
    ```javascript
    class MyComponent { /* ... */ }
    // CSS
    .my-component { /* ... */ }
    ```
*   **Files:** Use `kebab-case` for file names (e.g., `my-component.js`, `my-style.css`).

## 4. Comments

*   **Purpose:** Explain *why* the code does something, not *what* it does (unless the 
code is complex and not self-explanatory).
*   **TODOs:** Use `// TODO: [description]` for temporary notes or future improvements.
*   **JSDoc:** Use JSDoc for documenting functions, classes, and complex modules.

```javascript
/**
 * Calculates the sum of two numbers.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of a and b.
 */
function add(a, b) {
  return a + b;
}
```

## 5. Version Control (Git)

*   **Branching:** Use feature branches for new features or bug fixes. Branch names should be descriptive (e.g., `feature/add-new-tool`, `bugfix/sitemap-issue`).
*   **Commits:** Write clear, concise commit messages.
    *   Start with a verb in the imperative mood (e.g., `Fix:`, `Add:`, `Refactor:`).
    *   Keep the subject line under 50 characters.
    *   Provide a more detailed body if necessary.

    ```
    Fix: Correct sitemap generation for blog posts

    Ensures that all blog posts are correctly included in the sitemap.xml
    by modifying the build script to dynamically add blog post URLs.
    This resolves the issue where new blog posts were not discoverable by search engines.
    ```

*   **Pull Requests (PRs):** Create PRs for all changes. Ensure your code is reviewed before merging into `main`.

## 6. Security Best Practices

*   **Input Validation:** Always validate and sanitize user input on both client and server sides to prevent XSS, SQL injection, and other vulnerabilities.
*   **Dependencies:** Regularly update dependencies to patch known security vulnerabilities. Use `npm audit`.
*   **Environment Variables:** Never hardcode sensitive information (API keys, credentials). Use environment variables.
*   **Error Handling:** Implement robust error handling to prevent information leakage through error messages.

## 7. Project Structure

Maintain a logical and consistent project structure. For this project, follow the existing patterns:

*   `assets/`: Static assets (images, CSS, JS).
*   `blog-posts/`: Markdown files for blog posts.
*   `blog/`: Generated HTML for blog posts and archive.
*   `scripts/`: Build scripts and other utility scripts.
*   `templates/`: HTML templates for dynamic content generation.
*   Root directory for main HTML pages and tools.

## 8. Performance Optimization

*   **Lazy Loading:** Implement lazy loading for images and other non-critical assets.
*   **Minification:** Ensure CSS and JavaScript files are minified in production builds.
*   **Image Optimization:** Optimize images for web (compression, appropriate formats).
*   **Caching:** Utilize browser caching effectively.

## 9. Accessibility (A11y)

*   **Semantic HTML:** Use semantic HTML elements to improve accessibility and SEO.
*   **ARIA Attributes:** Use ARIA attributes where necessary to enhance accessibility for dynamic content or custom controls.
*   **Keyboard Navigation:** Ensure all interactive elements are keyboard accessible.
*   **Color Contrast:** Maintain sufficient color contrast for text and interactive elements.

## 10. Testing

*   **Unit Tests:** Write unit tests for critical functions and modules.
*   **Integration Tests:** Implement integration tests for key features.
*   **Browser Testing:** Test across different browsers and devices to ensure compatibility.

By following these guidelines, we can ensure the SmartGenQR.oi project remains a high-quality, maintainable, and secure application. This document will be updated periodically to reflect new best practices and project requirements.
