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
