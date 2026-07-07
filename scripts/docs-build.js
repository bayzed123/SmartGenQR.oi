  #!/usr/bin/env node

  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');
  const { marked } = require('marked');
  const slugify = require('slugify');

  const DOCS_POSTS_DIR = path.join(__dirname, '../docs-posts');
  const DOCS_OUTPUT_DIR = path.join(__dirname, '../docs');
  const SITE_URL = 'https://smartgentools.com';

  if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
      fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
  }

  marked.setOptions({ breaks: true, gfm: true });

  function readDocPosts() {
      if (!fs.existsSync(DOCS_POSTS_DIR)) {
          console.log('⚠️  docs-posts directory not found. Creating it...');
          fs.mkdirSync(DOCS_POSTS_DIR, { recursive: true });
          return [];
      }

      const files = fs.readdirSync(DOCS_POSTS_DIR).filter(file => file.endsWith('.md'));
      const docs = [];

      files.forEach(file => {
          const filePath = path.join(DOCS_POSTS_DIR, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const { data: attributes, content: body } = matter(fileContent);

          // Graceful fallback: derive a readable title from filename instead of literal "Untitled"
          const fallbackTitle = file
              .replace('.md', '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());

          const title = attributes.title || fallbackTitle;
          const slug = slugify(title, { lower: true, strict: true });

          docs.push({
              slug,
              title,
              description: attributes.description || 'SmartGen Developer Documentation',
              content: body,
              order: attributes.order || 999,
              category: attributes.category || 'Guides'
          });
      });

      return docs.sort((a, b) => a.order - b.order);
  }

  // ---------------------------------------------------------
  // FIX #1: Custom renderer that:
  //   - adds id="" to every heading (fixes TOC scroll targets)
  //   - collects headings into tocList (used for "On This Page" nav)
  //   - rewrites relative image paths to absolute /assets/... (fixes broken images)
  //   - auto-converts GitHub /blob/ links to raw.githubusercontent.com
  // ---------------------------------------------------------
  function createRenderer(tocList) {
      const renderer = new marked.Renderer();

      renderer.heading = (text, level) => {
          const slug = slugify(text, { lower: true, strict: true });
          // Only H2/H3 go into the on-page TOC (H1 is the doc title itself)
          if (level === 2 || level === 3) {
              tocList.push({ level, text, slug });
          }
          return `<h${level} id="${slug}">${text}</h${level}>\n`;
      };

      renderer.image = (href, title, text) => {
          let fixedHref = href;

          if (!href.startsWith('http') && !href.startsWith('/')) {
              const cleanPath = href.replace(/^\.?\/?/, '').replace(/^assets\//, '');
              fixedHref = `/assets/${cleanPath}`;
          }

          if (fixedHref.includes('github.com') && fixedHref.includes('/blob/')) {
              fixedHref = fixedHref
                  .replace('github.com', 'raw.githubusercontent.com')
                  .replace('/blob/', '/');
          }

          const titleAttr = title ? ` title="${title}"` : '';
          return `<img src="${fixedHref}" alt="${text}"${titleAttr} loading="lazy" style="max-width:100%;border-radius:8px;" />`;
      };

      return renderer;
  }

  // ---------------------------------------------------------
  // FIX #2: Build "On This Page" TOC HTML from collected headings
  // ---------------------------------------------------------
  function buildOnPageTocHtml(tocList) {
      if (!tocList.length) return '';

      const items = tocList.map(item => {
          const indent = item.level === 3 ? 'toc-sub' : 'toc-main';
          return `<li class="${indent}"><a href="#${item.slug}" class="toc-link">${item.text}</a></li>`;
      }).join('\n');

      return `
      <aside class="toc-sidebar desktop-only">
          <div class="toc-heading">On This Page</div>
          <ul class="toc-list">${items}</ul>
      </aside>`;
  }

  function generateDocHTML(doc, allDocs) {
      const tocList = [];
      const renderer = createRenderer(tocList);
      const htmlContent = marked(doc.content, { renderer });
      const onPageTocHtml = buildOnPageTocHtml(tocList);

      const categories = [...new Set(allDocs.map(d => d.category))];
      let sidebarNav = '';

      categories.forEach(cat => {
          sidebarNav += `<div class="sidebar-category">${cat}</div>`;
          allDocs.filter(d => d.category === cat).forEach(d => {
              const isActive = d.slug === doc.slug ? 'active' : '';
              sidebarNav += `
                  <a href="/docs/${d.slug}/" class="nav-link ${isActive}">
                      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                      ${d.title}
                  </a>`;
          });
      });

      return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${doc.title} - SmartGen Docs</title>
      <meta name="description" content="${doc.description}">
      <link rel="canonical" href="${SITE_URL}/docs/${doc.slug}/">

      <link rel="stylesheet" href="../../assets/css/docs.css">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">

      <style>
        /* Fallback styles for On-This-Page TOC — safe to move into docs.css later */
        .toc-sidebar { min-width: 200px; padding-left: 1.5rem; border-left: 1px solid #e5e7eb; }
        .toc-heading { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; color: #888; margin-bottom: 0.75rem; }
        .toc-list { list-style: none; padding: 0; margin: 0; }
        .toc-list li { margin-bottom: 0.5rem; }
        .toc-main a { font-size: 0.9rem; color: #444; text-decoration: none; }
        .toc-sub a { font-size: 0.85rem; color: #777; text-decoration: none; padding-left: 1rem; display:block; }
        .toc-link:hover, .toc-link.active { color: #3b82f6; font-weight: 500; }
        .doc-layout-with-toc { display: flex; gap: 2rem; }
        @media (max-width: 900px) { .toc-sidebar { display: none; } }
      </style>
  </head>
  <body>
      <header class="docs-header">
          <div class="header-left">
              <button id="mobile-menu-btn" class="icon-btn mobile-only" aria-label="Menu">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <a href="/" class="logo">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="color: var(--primary);"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  SmartGen Docs
              </a>
          </div>
          <div class="header-right">
              <div class="search-bar desktop-only">
                  <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search or Ask AI..." readonly>
              </div>
              <button id="theme-toggle" class="icon-btn" aria-label="Toggle Theme">
                  <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </button>
              <a href="https://github.com/Sayadbayezid" target="_blank" class="icon-btn" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
          </div>
      </header>

      <div class="docs-layout">
          <div id="sidebar-overlay" class="sidebar-overlay"></div>

          <aside id="sidebar" class="sidebar">
              <nav class="sidebar-nav">
                  ${sidebarNav}
              </nav>

              <div class="sidebar-footer">
                  <a href="https://smartgentools.com" class="footer-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                      Home
                  </a>
                  <a href="https://smartgentools.com/blog" class="footer-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Blog
                  </a>
                  <a href="https://smartgentools.com/about" class="footer-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      About Us
                  </a>
                  <a href="https://github.com/bayzed123/SmartGenQR.oi/discussions/1" target="_blank" class="footer-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      Discussions <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                  <a href="https://smartgentools.com/privacy" class="footer-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Privacy & Legal
                  </a>
              </div>
          </aside>

          <main class="main-content">
              <div class="doc-layout-with-toc">
                  <article class="doc-article">
                      <div class="breadcrumb">
                          <span>Docs</span> <span class="separator">/</span> <span>${doc.category || 'Guides'}</span>
                      </div>
                      <h1 class="doc-title">${doc.title}</h1>
                      <div class="doc-body">
                          ${htmlContent}
                      </div>
                  </article>

                  ${onPageTocHtml}
              </div>
          </main>
      </div>

      <script src="../../assets/js/docs.js"></script>
      <script>
        // Smooth scroll + active-link highlighting for "On This Page" TOC
        document.querySelectorAll('.toc-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });

        const tocLinks = document.querySelectorAll('.toc-link');
        const headings = Array.from(tocLinks).map(link =>
          document.querySelector(link.getAttribute('href'))
        ).filter(Boolean);

        window.addEventListener('scroll', () => {
          let current = null;
          headings.forEach(h => {
            if (h.getBoundingClientRect().top < 100) current = h;
          });
          tocLinks.forEach(link => link.classList.remove('active'));
          if (current) {
            const activeLink = document.querySelector('.toc-link[href="#' + current.id + '"]');
            if (activeLink) activeLink.classList.add('active');
          }
        });
      </script>
  </body>
  </html>`;
  }

  function buildDocs() {
      console.log('🚀 Starting SmartGen Premium Docs Build...\n');
      const docs = readDocPosts();

      if (docs.length === 0) return;

      docs.forEach(doc => {
          const docDir = path.join(DOCS_OUTPUT_DIR, doc.slug);
          if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
          fs.writeFileSync(path.join(docDir, 'index.html'), generateDocHTML(doc, docs));
          console.log(`✅ Built: /docs/${doc.slug}/  (title: "${doc.title}")`);
      });

      if (docs.length > 0) {
          const firstDocSlug = docs[0].slug;
          const indexHtmlContent = `<meta http-equiv="refresh" content="0; url=/docs/${firstDocSlug}/">`;
          fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'index.html'), indexHtmlContent);
      }

      console.log(`\n🎉 Docs build completed successfully! ${docs.length} pages generated.`);
  }

  buildDocs();