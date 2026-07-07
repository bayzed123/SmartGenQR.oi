  ---
  title: "Portfolio Website: API & Script Reference"
  description: "Complete technical reference for every script, function, and data structure powering the open-source developer portfolio — setup.sh, convert_blogs.py, and all JavaScript modules."
  order: 4
  category: "Portfolio Website"
  ---

  # Portfolio Website: API & Script Reference

  This is the technical reference documentation for the internal scripts and functions that power the portfolio project. Unlike the previous guides — which walk through *tasks* — this page documents every function, parameter, and data structure so you can confidently extend or debug the codebase.

  > **Repository:** [github.com/bayzed123/sayadbayezid-portfolio-](https://github.com/bayzed123/sayadbayezid-portfolio-)

  ---

  ## 📖 Portfolio Website Documentation Series

  This page is **Part 4** of a complete 4-part guide series. If you're following along step by step, here's the full path:

  | Step | Guide | What You'll Learn |
  |---|---|---|
  | **1** | [Getting Started Guide](/docs/portfolio-getting-started/) | Fork, clone, install, and run the project locally |
  | **2** | [Deployment & Blog System Guide](/docs/portfolio-deployment-and-blog-system/) | Deploy to GitHub Pages/Netlify/Vercel + publish blog posts |
  | **3** | [Customization Guide](/docs/portfolio-customization/) | Edit colors, sections, navigation, and add new pages |
  | **4** | **API & Script Reference** *(this page)* | Deep technical reference for every script and function |

  > **Tip**
  > New to this project? Start with [Step 1 — Getting Started](/docs/portfolio-getting-started/) instead of this page. This reference is best used *after* you've completed initial setup, when you want to understand or modify the underlying code.

  ## In this guide

  - [`setup.sh` reference](#setupsh-reference)
  - [`scripts/convert_blogs.py` reference](#scriptsconvert_blogspy-reference)
  - [Blog JSON data structures](#blog-json-data-structures)
  - [`blog-loader.html` JavaScript reference](#blog-loaderhtml-javascript-reference)
  - [`assets/js/nav-active.js` reference](#assetsjsnav-activejs-reference)
  - [`assets/js/theme-toggle.js` reference](#assetsjstheme-togglejs-reference)
  - [`i18n` loader reference](#i18n-loader-reference)
  - [GitHub Actions workflow reference](#github-actions-workflow-reference)
  - [File and folder reference](#file-and-folder-reference)
  - [Extending the codebase](#extending-the-codebase)
  - [Frequently asked questions](#frequently-asked-questions)

  ---

  ## `setup.sh` reference

  Interactive shell script that personalizes the project with your information across all relevant files in a single run.

  ### Usage

  ```bash
  bash setup.sh
  ```

  ### Prompts and variables

  | Prompt | Variable Name | Example Value |
  |---|---|---|
  | Full name | `$FULL_NAME` | `Sayad Bayezid` |
  | Website URL | `$WEBSITE_URL` | `www.example.com` |
  | GitHub username | `$GITHUB_USER` | `bayzed123` |
  | LinkedIn URL | `$LINKEDIN_URL` | `linkedin.com/in/yourprofile` |
  | Email address | `$EMAIL` | `you@example.com` |
  | Blog URL | `$BLOG_URL` | `yourblog.blogspot.com` |

  ### Internal logic

  ```bash
  #!/bin/bash

  read -p "Enter your full name: " FULL_NAME
  read -p "Enter your website URL: " WEBSITE_URL
  read -p "Enter your GitHub username: " GITHUB_USER
  read -p "Enter your LinkedIn profile URL: " LINKEDIN_URL
  read -p "Enter your email address: " EMAIL
  read -p "Enter your blog URL: " BLOG_URL

  FILES=("index.html" "blog.html" "blog-loader.html" "README.md" "LICENSE" "scripts/convert_blogs.py")

  for file in "${FILES[@]}"; do
    sed -i.bak "s/PLACEHOLDER_NAME/$FULL_NAME/g" "$file"
    sed -i.bak "s/PLACEHOLDER_WEBSITE/$WEBSITE_URL/g" "$file"
    sed -i.bak "s/PLACEHOLDER_GITHUB/$GITHUB_USER/g" "$file"
    sed -i.bak "s/PLACEHOLDER_LINKEDIN/$LINKEDIN_URL/g" "$file"
    sed -i.bak "s/PLACEHOLDER_EMAIL/$EMAIL/g" "$file"
    sed -i.bak "s/PLACEHOLDER_BLOG/$BLOG_URL/g" "$file"
    rm "$file.bak"
  done

  echo "✅ Setup Complete!"
  ```

  > **Note**
  > The script uses `sed` (stream editor) to perform find-and-replace across files. `sed -i.bak` creates a backup file first, then the script deletes it after a successful replacement — this is a safety pattern in case `sed` fails partway through on certain systems.

  ### Return behavior

  | Exit Condition | Behavior |
  |---|---|
  | All prompts answered | Prints success summary, exits `0` |
  | Empty input on a prompt | Placeholder remains unset in that field — script does not validate for empty strings |
  | File not found | `sed` silently skips missing files without halting the script |

  > **Warning**
  > `setup.sh` does **not** validate input format. Entering an invalid URL (missing `https://`, typos) will insert exactly what you typed. Double-check each generated file after running it.

  ---

  ## `scripts/convert_blogs.py` reference

  The core Python module that converts Markdown/HTML files in `blog_uploads/` into structured JSON consumed by the front end.

  ### Module-level constants

  ```python
  UPLOADS_DIR = "blog_uploads"
  OUTPUT_DIR = "blogs"
  ```

  ### Function: `slugify(title)`

  Converts a post title into a URL-safe slug.

  ```python
  def slugify(title):
      return title.lower().strip().replace(" ", "-")
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `title` | `str` | The raw post title extracted from the `<h1>` |

  **Returns:** `str` — lowercase, space-to-hyphen converted string

  **Example:**
  ```python
  slugify("My First Blog Post")
  # → "my-first-blog-post"
  ```

  > **Note**
  > This basic implementation does not strip punctuation. A title like `"What's New?"` produces `"what's-new?"` — special characters pass through unmodified. If you need stricter slugs, extend this function with a regex substitution (see [Extending the codebase](#extending-the-codebase)).

  ### Function: `extract_toc(soup)`

  Scans parsed HTML for `<h2>`/`<h3>` tags, assigns each an `id`, and builds a Table of Contents list.

  ```python
  def extract_toc(soup):
      toc = []
      for heading in soup.find_all(["h2", "h3"]):
          text = heading.get_text()
          slug = slugify(text)
          heading['id'] = slug
          toc.append({"level": heading.name, "text": text, "slug": slug})
      return toc
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `soup` | `BeautifulSoup` | Parsed HTML tree of the post body |

  **Returns:** `list[dict]` — each dict contains `level` (`"h2"` or `"h3"`), `text`, and `slug`

  **Side effect:** Mutates `soup` in place by adding an `id` attribute to each matched heading — required so TOC links (`#slug`) can jump to the correct element.

  ### Function: `process_markdown_file(filepath)`

  The main per-file processor — reads a Markdown file, converts it to HTML, and extracts all metadata needed for the JSON output.

  ```python
  def process_markdown_file(filepath):
      with open(filepath, "r", encoding="utf-8") as f:
          raw = f.read()

      html = markdown.markdown(raw, extensions=["extra", "toc"])
      soup = BeautifulSoup(html, "html.parser")

      title_tag = soup.find("h1")
      title = title_tag.get_text() if title_tag else "Untitled"
      if title_tag:
          title_tag.extract()

      toc = extract_toc(soup)
      excerpt = soup.find("p").get_text()[:160] if soup.find("p") else ""

      return {
          "title": title,
          "slug": slugify(title),
          "excerpt": excerpt,
          "content": str(soup),
          "toc": toc,
      }
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `filepath` | `str` | Full path to the `.md` file being processed |

  **Returns:** `dict` with keys `title`, `slug`, `excerpt`, `content`, `toc`

  | Key | Type | Description |
  |---|---|---|
  | `title` | `str` | Extracted from the first `<h1>`; defaults to `"Untitled"` if missing |
  | `slug` | `str` | URL-safe version of the title, used as filename and route |
  | `excerpt` | `str` | First 160 characters of the first paragraph — used in blog listing previews |
  | `content` | `str` | Full rendered HTML body (with `<h1>` removed, heading `id`s injected) |
  | `toc` | `list[dict]` | Table of Contents structure from `extract_toc()` |

  > **Warning**
  > If a Markdown file has **no** `# Heading`, the title defaults to `"Untitled"` and the slug becomes `"untitled"` — a second such file will silently overwrite the first's JSON output. Always include exactly one `# Title` per post.

  ### Function: `build_all_posts()`

  Orchestrates the full batch process — iterates every file in `blog_uploads/`, processes it, writes individual JSON files, and rebuilds the master index.

  ```python
  def build_all_posts():
      index = []
      for filename in os.listdir(UPLOADS_DIR):
          if filename.endswith(".md"):
              filepath = os.path.join(UPLOADS_DIR, filename)
              post = process_markdown_file(filepath)

              out_path = os.path.join(OUTPUT_DIR, f"{post['slug']}.json")
              with open(out_path, "w", encoding="utf-8") as f:
                  json.dump(post, f, ensure_ascii=False, indent=2)

              index.append({
                  "title": post["title"],
                  "slug": post["slug"],
                  "excerpt": post["excerpt"]
              })

      with open(os.path.join(OUTPUT_DIR, "index.json"), "w", encoding="utf-8") as f:
          json.dump(index, f, ensure_ascii=False, indent=2)
  ```

  **Parameters:** None (reads from module-level `UPLOADS_DIR` constant)

  **Returns:** `None` — writes files as a side effect

  **Files written:**
  - `blogs/{slug}.json` — one per post
  - `blogs/index.json` — master list used by the blog listing page

  **Entry point:**

  ```python
  if __name__ == "__main__":
      build_all_posts()
  ```

  This means running `python3 scripts/convert_blogs.py` directly triggers the full batch conversion — the same call GitHub Actions makes automatically on every push to `blog_uploads/`.

  ---

  ## Blog JSON data structures

  ### Individual post schema — `blogs/{slug}.json`

  ```json
  {
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "excerpt": "This is a test of the automated blog system.",
    "content": "<p>Full rendered HTML body...</p><h2 id=\"section-1\">Section 1</h2>...",
    "toc": [
      { "level": "h2", "text": "Section 1", "slug": "section-1" },
      { "level": "h2", "text": "Section 2", "slug": "section-2" }
    ]
  }
  ```

  | Field | Type | Required | Notes |
  |---|---|---|---|
  | `title` | `string` | Yes | Rendered as page `<h1>` by `blog-loader.html` |
  | `slug` | `string` | Yes | Used in the URL: `blog-loader.html?post=my-first-blog-post` |
  | `excerpt` | `string` | Yes | Displayed on `blog.html` listing page |
  | `content` | `string` | Yes | Raw HTML — inserted via `innerHTML`, not sanitized |
  | `toc` | `array` | No | Empty array `[]` if the post has no `##`/`###` headings |

  > **Warning**
  > `content` is inserted directly via `innerHTML` with no sanitization step. Since you control all input files yourself, this is safe for personal use — but **never** accept blog post uploads from untrusted third parties without adding an HTML sanitization library first, as this would otherwise be an XSS vulnerability.

  ### Index schema — `blogs/index.json`

  ```json
  [
    { "title": "My First Blog Post", "slug": "my-first-blog-post", "excerpt": "..." },
    { "title": "Second Post", "slug": "second-post", "excerpt": "..." }
  ]
  ```

  A flat array, ordered by filesystem iteration order (typically alphabetical by filename — **not** guaranteed to be chronological). See [Extending the codebase](#extending-the-codebase) for adding date-based sorting.

  ---

  ## `blog-loader.html` JavaScript reference

  ### Function: `loadBlogPost(slug)`

  Fetches a single post's JSON and renders it into the page.

  ```javascript
  async function loadBlogPost(slug) {
    const res = await fetch(`/blogs/${slug}.json`);
    const post = await res.json();

    document.title = `${post.title} - Blog`;
    document.querySelector('.post-title').textContent = post.title;
    document.querySelector('.post-content').innerHTML = post.content;

    renderToc(post.toc);
  }
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `slug` | `string` | Extracted from the URL query string (`?post=slug-name`) |

  **DOM dependencies:** Requires elements with classes `.post-title` and `.post-content` present in `blog-loader.html`.

  **Failure mode:** If `slug` doesn't match any existing JSON file, `fetch()` resolves with a 404 response, and `res.json()` throws — currently unhandled, resulting in a blank page. See [Extending the codebase](#extending-the-codebase) for adding error handling.

  ### Function: `renderToc(toc)`

  Renders the Table of Contents sidebar from the `toc` array.

  ```javascript
  function renderToc(toc) {
    const container = document.querySelector('.toc-list');
    container.innerHTML = toc.map(item =>
      `<li class="toc-${item.level}"><a href="#${item.slug}">${item.text}</a></li>`
    ).join('');
  }
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `toc` | `array` | The `toc` field from the post JSON |

  **DOM dependency:** Requires an element with class `.toc-list`.

  **CSS hook:** Generated `<li>` elements receive classes `toc-h2` or `toc-h3`, allowing indentation styling to differentiate heading levels in the sidebar.

  ---

  ## `assets/js/nav-active.js` reference

  Automatically highlights the current page's link in the navigation bar.

  ```javascript
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
  ```

  | Variable | Type | Description |
  |---|---|---|
  | `currentPath` | `string` | Current page's filename, extracted from the URL path |

  > **Note**
  > This matches on exact `href` string equality. A link written as `href="index.html"` will **not** match a URL path of `/` (root) — if using a custom domain where the homepage loads without a filename, extend this logic to also check for an empty string case (see [Extending the codebase](#extending-the-codebase)).

  ---

  ## `assets/js/theme-toggle.js` reference

  Handles dark/light mode switching with persistence via `localStorage`.

  ```javascript
  const toggleBtn = document.querySelector('#theme-toggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
  ```

  | localStorage Key | Possible Values | Description |
  |---|---|---|
  | `theme` | `"dark"` \| `"light"` | Persisted user preference, read on every page load |

  **DOM dependency:** Requires a button element with `id="theme-toggle"`.

  **CSS dependency:** Requires a `.dark-mode` class defined on `:root` or `body` with corresponding variable overrides (see [Customization Guide → Enable dark mode](/docs/portfolio-customization/#customizing-colors-and-theme)).

  ---

  ## `i18n` loader reference

  ### Function: `loadLanguage(lang)`

  Fetches a language JSON file and applies translated strings to matching DOM elements.

  ```javascript
  async function loadLanguage(lang) {
    const res = await fetch(`i18n/${lang}.json`);
    const strings = await res.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key]) el.textContent = strings[key];
    });
  }
  ```

  | Parameter | Type | Description |
  |---|---|---|
  | `lang` | `string` | Language code matching a filename in `i18n/` (e.g., `"en"`, `"bn"`) |

  **DOM dependency:** Elements must have a `data-i18n="key.name"` attribute matching a key in the JSON file.

  **Failure mode:** If a key in `data-i18n` doesn't exist in the loaded JSON, the element's `textContent` is left unchanged (falls back to whatever is in the HTML source by default) — this is a safe default, not a crash.

  ### i18n file schema

  ```json
  {
    "nav.about": "About",
    "nav.projects": "Projects",
    "hero.title": "Hi, I'm",
    "hero.subtitle": "Full-Stack Developer"
  }
  ```

  Flat key-value pairs — no nesting supported in the default implementation.

  ---

  ## GitHub Actions workflow reference

  ### `.github/workflows/blog_automation.yml`

  ```yaml
  name: Blog Automation

  on:
    push:
      paths:
        - 'blog_uploads/**'

  jobs:
    convert:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Set up Python
          uses: actions/setup-python@v5
          with:
            python-version: '3.11'

        - name: Install dependencies
          run: pip install beautifulsoup4 markdown

        - name: Run conversion script
          run: python scripts/convert_blogs.py

        - name: Commit generated files
          run: |
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add blogs/
            git diff --staged --quiet || git commit -m "auto: rebuild blog JSON"
            git push
  ```

  | Trigger Field | Value | Effect |
  |---|---|---|
  | `on.push.paths` | `blog_uploads/**` | Workflow only runs when files inside this folder change — pushes elsewhere in the repo don't trigger it |
  | `runs-on` | `ubuntu-latest` | GitHub-hosted runner, no self-hosted infrastructure needed |
  | `python-version` | `'3.11'` | Pinned version — update here if you need a newer/older Python for compatibility |

  **Permissions note:** This workflow pushes commits back to the repository. Ensure **Settings → Actions → General → Workflow permissions** is set to "Read and write permissions" for this to succeed.

  ---

  ## File and folder reference

  Quick-lookup table of every functional file in the project:

  | Path | Type | Role |
  |---|---|---|
  | `index.html` | HTML | Main homepage |
  | `blog.html` | HTML | Blog post listing page |
  | `blog-loader.html` | HTML | Individual blog post renderer |
  | `contact.html` | HTML | Contact page |
  | `privacy-policy.html` | HTML | Privacy policy template |
  | `404.html` | HTML | Custom error page |
  | `setup.sh` | Shell script | One-time personalization script |
  | `scripts/convert_blogs.py` | Python | Blog conversion engine |
  | `assets/css/style.css` | CSS | Main stylesheet, theme variables |
  | `assets/js/nav-active.js` | JavaScript | Active nav link highlighting |
  | `assets/js/theme-toggle.js` | JavaScript | Dark/light mode toggle |
  | `blog_uploads/` | Folder | Source Markdown/HTML posts (input) |
  | `blogs/` | Folder | Generated JSON posts (output — do not edit) |
  | `i18n/` | Folder | Language translation JSON files |
  | `.github/workflows/blog_automation.yml` | YAML | CI/CD automation config |
  | `sitemap.xml` | XML | SEO sitemap |
  | `robots.txt` | Text | Search engine crawl rules |
  | `CNAME` | Text | Custom domain config for GitHub Pages |
  | `LICENSE` | Text | Project license terms |

  ---

  ## Extending the codebase

  Common extension points referenced throughout this document:

  ### Stricter slugification

  ```python
  import re

  def slugify(title):
      slug = title.lower().strip()
      slug = re.sub(r'[^\w\s-]', '', slug)   # strip punctuation
      slug = re.sub(r'[\s_]+', '-', slug)    # collapse whitespace to hyphens
      return slug
  ```

  ### Chronological post ordering

  Add a `date` field to each post (either from front-matter or filename convention), then sort before writing `index.json`:

  ```python
  index.sort(key=lambda p: p.get("date", ""), reverse=True)
  ```

  ### Error handling in `loadBlogPost`

  ```javascript
  async function loadBlogPost(slug) {
    try {
      const res = await fetch(`/blogs/${slug}.json`);
      if (!res.ok) throw new Error('Post not found');
      const post = await res.json();
      // ...render post
    } catch (err) {
      document.querySelector('.post-content').innerHTML =
        '<p>Sorry, this post could not be found.</p>';
    }
  }
  ```

  ### Root-path handling in `nav-active.js`

  ```javascript
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  // Add this line to also match root-path homepage loads:
  const isHome = currentPath === '' || currentPath === 'index.html';
  ```

  ---

  ## Frequently asked questions

  <details>
  <summary><strong>Can I add front-matter (like date, tags) to Markdown posts?</strong></summary>

  Not by default — the current `process_markdown_file()` function only extracts the `<h1>` title and first paragraph. To support front-matter, add the `python-frontmatter` package and parse YAML metadata at the top of each `.md` file before passing the remaining body to `markdown.markdown()`.
  </details>

  <details>
  <summary><strong>Why does `content` use raw HTML instead of Markdown in the JSON?</strong></summary>

  Converting to HTML once at build time (rather than shipping raw Markdown to the browser) avoids needing a Markdown parser library in the front end — `blog-loader.html` simply inserts pre-rendered HTML via `innerHTML`, keeping the client-side code minimal.
  </details>

  <details>
  <summary><strong>Is there a way to preview JSON output without running the full GitHub Action?</strong></summary>

  Yes — run `python3 scripts/convert_blogs.py` locally as covered in the [Getting Started guide](/docs/portfolio-getting-started/#step-7-verify-everything-works). This runs the exact same function GitHub Actions calls, just on your machine instead of their runner.
  </details>

  <details>
  <summary><strong>Can I call `build_all_posts()` from another Python script?</strong></summary>

  Yes — since it's a standard function (not wrapped in a class), you can import it:
  ```python
  from scripts.convert_blogs import build_all_posts
  build_all_posts()
  ```
  This is useful if you want to integrate blog conversion into a larger custom build pipeline.
  </details>

  ---

  ## Related guides in this series

  You've now reached the end of the **Portfolio Website** documentation series. Here's the complete path for reference:

  1. **[Getting Started Guide](/docs/portfolio-getting-started/)** — Fork, clone, install, run locally
  2. **[Deployment & Blog System Guide](/docs/portfolio-deployment-and-blog-system/)** — Go live + publish posts
  3. **[Customization Guide](/docs/portfolio-customization/)** — Make it visually yours
  4. **API & Script Reference** *(you are here)* — Technical deep dive

  > **Tip**
  > Bookmark this reference page — you'll likely return to it any time you extend the blog system or debug an unexpected script behavior, long after initial setup is complete.

  ## Further reading

  - [WIKI.md](https://github.com/bayzed123/sayadbayezid-portfolio-/blob/main/WIKI.md) — original repository wiki
  - [Python `markdown` library docs](https://python-markdown.github.io/) — full extension reference
  - [BeautifulSoup4 documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) — HTML parsing reference
  - [Repository Issues](https://github.com/bayzed123/sayadbayezid-portfolio-/issues) — report bugs or request features>
<div align="center">
  <table width="100%">
    <tr>
      <td align="left" width="50%">
        <p>Previous</p>
        <b><a href="https://smartgentools.com/docs/portfolio-customization/">Portfolio Customization</a></b>
      </td>
      <td align="right" width="50%">
        <p>Next</p>
        <b><a href="https://smartgentools.com/docs/portfolio-api-reference/">Portfolio API Reference</a></b>
      </td>
    </tr>
  </table>
</div>

---

### Help and support

**Did you find what you needed?**  
Thank you! We received your feedback.  
<br>
[Privacy policy](https://smartgentools.com/privacy/)

<br>

**Help us make these docs great!**  
All GitHub docs are open source. See something that's wrong or unclear? Submit a pull request.  
<br>
<a href="https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md"><kbd>⑂ Make a contribution</kbd></a>  
<br>
[Learn how to contribute](https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md)

<br>

**Still need help?**  
👥 [Ask the SmartGen community](https://github.com/bayzed123/SmartGenQR.oi/discussions)  
💬 [Contact support](https://smartgentools.com/contact/)  

<br>

**Legal**  
<small>© 2026 SmartGen. &nbsp; [Terms](https://smartgentools.com/terms/) &nbsp; [Privacy](https://smartgentools.com/privacy/) &nbsp; [Expert services](https://smartgentools.com/tools/) &nbsp; [Blog](https://smartgentools.com/blog/)</small>
