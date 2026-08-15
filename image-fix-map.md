# Blog Image-Fix Map

## Protected fields — must not change

For every article, preserve the Markdown filename, front-matter title, generated slug, public blog URL, publication date, description, keywords, tags, author, and all written article content. Only image files, image front-matter values, and Markdown image URLs may change.

## Sequential work order

| Task | Article | Image work | Verification gate |
|---|---|---|---|
| 1 | `schema-generator.md` | Replace the confirmed `example.com/product.jpg` placeholder and add a verified local cover image only; do not alter title or URL. | Confirm image topic, local file, article HTML image URL, Open Graph image, and live browser rendering. |
| 2 | `pyproject-toml-guide.md` | Add a verified local cover image only if the article currently lacks valid front-matter image metadata. | Same per-article checks. |
| 3 | `python-course-for-beginners-class-01-setup-guid.md` | Resolve the missing Class 01 cover image with a verified topic-specific local asset. | Same per-article checks. |
| 4 | `module9-youtube-marketing-mega-guide.md` | Resolve the missing Module 9 infographic/cover asset with a verified topic-specific local asset. | Same per-article checks. |
| 5 | `tiktok-marketing-learning-guide2026.md` | Resolve the missing Module 10 infographic/cover asset with a verified topic-specific local asset. | Same per-article checks. |
| 6 | `video-marketing-through-youtube-mega-guide.md` | Resolve missing Module 15 cover and section images with verified topic-specific local assets. | Same per-article checks. |
| 7 | `display-advertising-remarketing-guide.md` | Resolve missing Module 17 cover and section images with verified topic-specific local assets. | Same per-article checks. |
| 8 | External-host review | Review external `i.ibb.co` and other image URLs article by article; migrate only images whose topic and visual content are verified. | No blind bulk replacement; uncertain images remain unchanged and are reported. |
| 9 | Final audit | Check all 64 articles, image URLs, generated pages, sitemap image entries, dates, titles, slugs, and live pages. | All protected fields compare unchanged; only approved image changes remain. |

## Current first task

Start with `schema-generator.md` because it has the only confirmed HTTP 404 placeholder. No change is authorized until its replacement image is researched and verified.
