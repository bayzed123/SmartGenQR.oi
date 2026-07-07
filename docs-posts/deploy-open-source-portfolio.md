---
  title: "How to Deploy an Open-Source Developer Portfolio (Free, in Minutes)"
  description: "A complete step-by-step guide to forking, customizing, and deploying a free open-source developer portfolio website — with automated blogging built in."
  order: overview
  category: "Open Source Projects"
---

  # How to Deploy an Open-Source Developer Portfolio (Free, in Minutes)

  Every developer needs a portfolio — but building one from scratch takes time you'd rather spend on actual projects. In this guide, I'll walk you through deploying a **free, open-source developer portfolio** with a built-in automated blogging system, using the project I built and maintain: [`sayadbayezid-portfolio-`](https://github.com/bayzed123/sayadbayezid-portfolio-).

  By the end of this guide, you'll have your own personalized portfolio live on the internet — with zero backend, zero hosting cost, and a blog system that publishes new posts automatically every time you push to GitHub.

  ## Why This Project Exists

  Most portfolio templates fall into two categories:

  1. **Static templates** — look nice, but updating content means editing raw HTML every time
  2. **Full CMS platforms** (WordPress, etc.) — powerful, but overkill for a personal portfolio, and require hosting/maintenance costs

  This project takes a third approach: a **100% static site** with an **automated Markdown-to-blog pipeline**, so you get the simplicity of static hosting with the convenience of a real blogging workflow.

  ## What You Get Out of the Box

  - A complete personal portfolio homepage (`index.html`)
  - A working blog system that converts Markdown or HTML posts into rendered pages automatically
  - GitHub Actions automation — no manual build steps required
  - SEO essentials: sitemap, robots.txt, meta tags
  - A 404 error page, contact page, and privacy policy template
  - Multi-language support scaffolding (`i18n/`)
  - MIT-style license with attribution requirement

  ## Architecture Overview

  Before deploying, it helps to understand the data flow:

  ```text
  You write a .md or .html file
          ↓
  Place it in blog_uploads/
          ↓
  git push
          ↓
  GitHub Action (.github/workflows/blog_automation.yml) triggers
          ↓
  scripts/convert_blogs.py runs automatically
          ↓
  Generates JSON in blogs/
          ↓
  blog-loader.html fetches JSON and renders the live post
  ```

  Everything except the blog pipeline is static — no build tools needed to run the core site.

  ## Step 1 — Fork the Repository

  Go to [github.com/bayzed123/sayadbayezid-portfolio-](https://github.com/bayzed123/sayadbayezid-portfolio-) and click **Fork** in the top right.

  Then clone your fork locally:

  ```bash
  git clone https://github.com/YOUR_USERNAME/sayadbayezid-portfolio-.git
  cd sayadbayezid-portfolio-
  ```

  ## Step 2 — Run the Setup Script

  The repo includes an interactive script that personalizes every file for you — no manual find-and-replace needed.

  ```bash
  bash setup.sh
  ```

  You'll be prompted for:

  ```text
  Enter your full name: 
  Enter your website URL: 
  Enter your GitHub username: 
  Enter your LinkedIn profile URL: 
  Enter your email address: 
  Enter your blog URL: 
  ```

  This automatically updates `index.html`, `blog.html`, `blog-loader.html`, `README.md`, `LICENSE`, and `scripts/convert_blogs.py` with your details in one pass.

  ## Step 3 — Install Blog System Dependencies

  The automated blog pipeline is powered by a small Python script:

  ```bash
  pip install beautifulsoup4 markdown
  ```

  ## Step 4 — Test the Blog System Locally

  Create a test post at `blog_uploads/test-post.md`:

  ```markdown
  # My First Blog Post

  This is a test of the automated blog system.

  ## Section 1
  Content goes here.
  ```

  Then run the converter manually to confirm it works:

  ```bash
  python scripts/convert_blogs.py
  ```

  Check the `blogs/` folder — you should see a new JSON file generated for your post.

  ## Step 5 — Preview Locally

  ```bash
  npx serve .
  ```

  Visit `http://localhost:3000` and confirm your homepage and blog page render correctly.

  ## Step 6 — Deploy to Production

  Since this is a fully static site, you have several free hosting options:

  ### GitHub Pages (Recommended)

  1. Push your personalized repo to GitHub
  2. Go to **Settings → Pages**
  3. Set source to the `main` branch, root folder
  4. Your site goes live at:
     ```text
     https://YOUR_USERNAME.github.io/sayadbayezid-portfolio-/
     ```

  ### Netlify

  1. [netlify.com](https://www.netlify.com/) → **New site from Git**
  2. Connect your repo
  3. Leave build command empty, publish directory as `/`
  4. Deploy — future pushes auto-redeploy

  ### Custom Domain

  Edit the `CNAME` file with your domain, then point your DNS records to your hosting provider.

  ## Step 7 — Publishing New Blog Posts Going Forward

  Once deployed, publishing is as simple as:

  ```bash
  # 1. Write your post
  vim blog_uploads/my-new-post.md

  # 2. Commit and push
  git add blog_uploads/my-new-post.md
  git commit -m "blog: add new post about X"
  git push
  ```

  GitHub Actions handles the rest — no manual build step, no server access required.

  ## Content Guidelines for Best Results

  ### Markdown Posts

  Use standard heading hierarchy:

  ```markdown
  # Post Title
  Intro paragraph.

  ## Main Section
  Content.

  ### Sub-section
  More detail.
  ```

  ### HTML Posts (for more control)

  For richer formatting — Table of Contents, FAQ accordions — use HTML directly:

  ```html
  <h1>Your Blog Post Title</h1>
  <meta name="description" content="A brief summary">

  <section class="toc">
    <h3>Table of Contents</h3>
    <ul>
      <li><a href="#section1">Section 1</a></li>
    </ul>
  </section>

  <section id="section1">
    <h2>Section 1</h2>
    <p>Your content here</p>
  </section>
  ```

  Interactive FAQ blocks are also supported:

  ```html
  <button class="accordion">Q: Your Question Here?</button>
  <div class="panel"><p>A: Your answer here.</p></div>
  ```

  ## Common Issues & Fixes

  | Problem | Solution |
  |---|---|
  | Blog post doesn't appear after push | Check the **Actions** tab on GitHub — confirm `blog_automation.yml` ran successfully |
  | GitHub Pages shows 404 | Confirm branch/folder is set correctly under Settings → Pages; wait 1–2 min after first deploy |
  | Custom domain not resolving | Double-check `CNAME` has no `https://` prefix; DNS can take up to 24 hours |
  | Images not rendering in blog posts | Confirm image URLs are absolute (`https://...`), not relative paths |

  ## Why I Built It This Way

  As someone running a developer tools platform ([SmartGen](https://smartgentools.com)) alongside a personal portfolio, I wanted a system where:

  - Publishing a new post takes **under 2 minutes** — write Markdown, push, done
  - There's **zero hosting cost** and **zero server maintenance**
  - The blog and portfolio share the same static-first philosophy that powers SmartGen's own tools

  This project is the result — and it's free for anyone to fork and use as their own developer portfolio.

  ## Try It Yourself

  - 🔗 **Repository:** [github.com/bayzed123/sayadbayezid-portfolio-](https://github.com/bayzed123/sayadbayezid-portfolio-)
  - 📖 **Full technical docs:** See `WIKI.md` in the repo for deep customization details
  - ⭐ **Star it** if you find it useful — it helps other developers discover the project

  ## Related Guides

  - [Protfolio Getting Started with SmartGen](/docs/protfolio-getting-started/)
  - [Protfolio Deployment Guide](/docs/Protfolio-deployment/)
---
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