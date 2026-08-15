const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const { BuildTimeAdInjector } = require('../utils/ad-injector.js');

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

        const fallbackTitle = file
            .replace('.md', '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        const title = attributes.title || fallbackTitle;

        // An explicit `slug:` pins the URL, exactly as scripts/build-blog.js
        // does for posts. Without it the URL is derived from the title, so
        // rewording a heading silently moves a published page and breaks every
        // link and bookmark pointing at the old address.
        const slug = attributes.slug
            ? slugify(String(attributes.slug).trim(), { lower: true, strict: true })
            : slugify(title, { lower: true, strict: true });

        docs.push({
            slug,
            title,
            sourceFile: file,
            description: attributes.description || 'SmartGen Developer Documentation',
            content: body,
            order: attributes.order || 999,
            category: attributes.category || 'Guides'
        });
    });

    // Two docs resolving to the same slug means one silently overwrites the
    // other and its page never ships. That happened for three separate files
    // all titled "Getting Started", which is why docs-posts/ held more sources
    // than docs/ held pages. Fail loudly instead of losing a page quietly.
    const seen = new Map();
    const clashes = [];
    docs.forEach(doc => {
        if (seen.has(doc.slug)) {
            clashes.push(`  /docs/${doc.slug}/  <-  ${seen.get(doc.slug)}  AND  ${doc.sourceFile}`);
        } else {
            seen.set(doc.slug, doc.sourceFile);
        }
    });
    if (clashes.length) {
        throw new Error(
            `${clashes.length} docs slug collision(s) — each would overwrite the other:\n` +
            clashes.join('\n') +
            `\nGive one of each pair a distinct title, or pin a \`slug:\` in its front matter.`
        );
    }

    return docs.sort((a, b) => a.order - b.order);
}

// Create a slug mapping from all docs for link resolution
function createSlugMapping(allDocs) {
    const mapping = {};
    allDocs.forEach(doc => {
        // Map by title (normalized)
        const titleSlug = slugify(doc.title, { lower: true, strict: true });
        mapping[titleSlug] = doc.slug;
        
        // Map by filename (without .md)
        const fileSlug = slugify(doc.title, { lower: true, strict: true });
        mapping[fileSlug] = doc.slug;
    });
    return mapping;
}

function createRenderer(tocList, slugMapping = {}) {
    const renderer = new marked.Renderer();

    renderer.heading = function (...args) {
        let text, level;

        if (typeof args[0] === 'object' && args[0] !== null && 'depth' in args[0]) {
            const token = args[0];
            text = this.parser ? this.parser.parseInline(token.tokens) : (token.text || '');
            level = token.depth;
        } else {
            text = args[0];
            level = args[1];
        }

        const plainText = String(text).replace(/<[^>]*>/g, '');
        const slug = slugify(plainText, { lower: true, strict: true });

        if (level === 2 || level === 3) {
            tocList.push({ level, text: plainText, slug });
        }

        return `<h${level} id="${slug}">${text}</h${level}>\n`;
    };

    // Smart link resolver for internal docs links
    renderer.link = function (...args) {
        let href, title, text;

        if (typeof args[0] === 'object' && args[0] !== null && 'href' in args[0]) {
            ({ href, title, text } = args[0]);
        } else {
            [href, title, text] = args;
        }

        if (!href) return text;

        // Handle internal docs links
        if (href.includes('/docs/')) {
            // Extract the slug from the link
            const match = href.match(/\/docs\/([^/]+)\/?/);
            if (match) {
                const linkedSlug = match[1];
                // Check if this slug exists in our mapping
                if (slugMapping[linkedSlug]) {
                    href = `/docs/${slugMapping[linkedSlug]}/`;
                } else {
                    // Try to resolve by normalizing the slug
                    const normalized = slugify(linkedSlug.replace(/-/g, ' '), { lower: true, strict: true });
                    if (slugMapping[normalized]) {
                        href = `/docs/${slugMapping[normalized]}/`;
                    }
                }
            }
        }

        return `<a href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    renderer.image = function (...args) {
        let href, title, text;

        if (typeof args[0] === 'object' && args[0] !== null && 'href' in args[0]) {
            ({ href, title, text } = args[0]);
        } else {
            [href, title, text] = args;
        }

        if (href && !href.startsWith('http') && !href.startsWith('/')) {
            href = '/' + href;
        }

        let fixedHref = href || '';
        if (fixedHref.includes('github.com') && fixedHref.includes('/blob/')) {
            fixedHref = fixedHref.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        return `<img src="${fixedHref}" alt="${text || ''}" title="${title || ''}" class="doc-image">\n`;
    };

    return renderer;
}

function generateDocHTML(doc, allDocs) {
    const tocList = [];
    const slugMapping = createSlugMapping(allDocs);
    const renderer = createRenderer(tocList, slugMapping);
    const htmlContent = marked.parse(doc.content, { renderer });

    // Find current doc index for navigation
    const currentIndex = allDocs.findIndex(d => d.slug === doc.slug);
    const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
    const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

    // Generate GitHub-style footer
    const footerHtml = `
        <div class="doc-footer">
            <div class="nav-table">
                <div class="nav-row">
                    <div class="nav-cell nav-prev">
                        ${prevDoc ? `
                            <div class="nav-label">← Previous</div>
                            <a href="/docs/${prevDoc.slug}/" class="nav-link-footer">${prevDoc.title}</a>
                        ` : '<div class="nav-empty"></div>'}
                    </div>
                    <div class="nav-cell nav-next">
                        ${nextDoc ? `
                            <div class="nav-label">Next →</div>
                            <a href="/docs/${nextDoc.slug}/" class="nav-link-footer">${nextDoc.title}</a>
                        ` : '<div class="nav-empty"></div>'}
                    </div>
                </div>
            </div>

            <hr class="footer-divider">

            <div class="help-section">
                <div class="help-box">
                    <h3>Did you find what you needed?</h3>
                    <p>Thank you! We received your feedback.</p>
                </div>

                <div class="help-box">
                    <h3>Help us make these docs great!</h3>
                    <p>All SmartGen docs are open source. See something that's wrong or unclear? Submit a pull request.</p>
                    <a href="https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md" class="btn-contribute">⑂ Make a contribution</a>
                    <p><a href="https://github.com/bayzed123/SmartGenQR.oi/blob/main/Contributing.md" class="link-secondary">Learn how to contribute</a></p>
                </div>

                <div class="help-box">
                    <h3>Still need help?</h3>
                    <p>👥 <a href="https://github.com/bayzed123/SmartGenQR.oi/discussions" class="link-secondary">Ask the SmartGen community</a></p>
                    <p>💬 <a href="https://smartgentools.com/contact/" class="link-secondary">Contact support</a></p>
                </div>
            </div>

            <div class="footer-legal">
                <p><small>© 2026 SmartGen. &nbsp; <a href="https://smartgentools.com/terms/">Terms</a> &nbsp; <a href="https://smartgentools.com/privacy/">Privacy</a> &nbsp; <a href="https://smartgentools.com/tools/">Expert services</a> &nbsp; <a href="https://smartgentools.com/blog/">Blog</a></small></p>
            </div>
        </div>
    `;

    const onPageTocHtml = tocList.length > 0 ? `
        <aside class="toc-sidebar desktop-only">
            <div class="toc-heading">On This Page</div>
            <ul class="toc-list">
                ${tocList.map(item => `
                    <li class="toc-item ${item.level === 3 ? 'toc-sub' : 'toc-main'}">
                        <a href="#${item.slug}" class="toc-link">${item.text}</a>
                    </li>
                `).join('')}
            </ul>
        </aside>` : '';

    const categories = [...new Set(allDocs.map(d => d.category))];
    let sidebarNav = '';

    categories.forEach(cat => {
        sidebarNav += `<div class="nav-section-title">${cat}</div>`;
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
    
    <!-- HTTPS Redirect Script -->
    <script>
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            location.replace('https:' + location.href.substring(location.protocol.length));
        }
    </script>

    <link rel="stylesheet" href="../../assets/css/docs.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">

    <!-- Google AdSense Code -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9789336661158068" crossorigin="anonymous"></script>

    <style>
      .toc-sidebar { min-width: 200px; padding-left: 1.5rem; border-left: 1px solid #e5e7eb; }
      .toc-heading { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; color: #888; margin-bottom: 0.75rem; }
      .toc-list { list-style: none; padding: 0; margin: 0; }
      .toc-list li { margin-bottom: 0.5rem; }
      .toc-main a { font-size: 0.9rem; color: #444; text-decoration: none; }
      .toc-sub a { font-size: 0.85rem; color: #777; text-decoration: none; padding-left: 1rem; display:block; }
      .toc-link:hover, .toc-link.active { color: #3b82f6; font-weight: 500; }
      .doc-layout-with-toc { display: flex; gap: 2rem; }
      @media (max-width: 900px) { .toc-sidebar { display: none; } }
      
      /* GitHub-style Footer */
      .doc-footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; }
      .nav-table { display: table; width: 100%; margin-bottom: 2rem; }
      .nav-row { display: table-row; }
      .nav-cell { display: table-cell; padding: 1rem; width: 50%; }
      .nav-prev { text-align: left; padding-right: 2rem; }
      .nav-next { text-align: right; padding-left: 2rem; border-left: 1px solid #e5e7eb; }
      .nav-label { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; font-weight: 500; }
      .nav-link-footer { color: #0969da; text-decoration: none; font-weight: 600; font-size: 1.05rem; }
      .nav-link-footer:hover { text-decoration: underline; }
      .nav-empty { height: 2.5rem; }
      .footer-divider { margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb; }
      .help-section { margin: 2rem 0; }
      .help-box { margin-bottom: 2rem; }
      .help-box h3 { font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem 0; }
      .help-box p { margin: 0.5rem 0; color: #555; font-size: 0.95rem; line-height: 1.5; }
      .btn-contribute { display: inline-block; padding: 0.5rem 1rem; background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; color: #0969da; text-decoration: none; font-weight: 500; margin: 0.75rem 0; }
      .btn-contribute:hover { background: #eaeef2; }
      .link-secondary { color: #0969da; text-decoration: none; }
      .link-secondary:hover { text-decoration: underline; }
      .footer-legal { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; }
      .footer-legal small { color: #666; font-size: 0.85rem; }
      .footer-legal a { color: #0969da; text-decoration: none; }
      .footer-legal a:hover { text-decoration: underline; }
      
      @media (max-width: 768px) {
        .nav-cell { display: block; width: 100%; padding: 1rem 0; border-left: none; }
        .nav-next { border-left: none; border-top: 1px solid #e5e7eb; padding-top: 1rem; text-align: left; }
        .nav-prev { padding-right: 0; }
      }
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
                    ${footerHtml}
                </article>

                ${onPageTocHtml}
            </div>
        </main>
    </div>

    <script src="../../assets/js/docs.js"></script>
    <script>
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

    docs.forEach((doc, index) => {
        const docDir = path.join(DOCS_OUTPUT_DIR, doc.slug);
        if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
        let html = generateDocHTML(doc, docs);
        
        // Apply Adsterra ad injections with CLS prevention
        html = BuildTimeAdInjector.injectAllAds(html);
        
        fs.writeFileSync(path.join(docDir, 'index.html'), html);
        console.log(`✅ Built: /docs/${doc.slug}/  (title: "${doc.title}") - with Adsterra ads`);
    });

    if (docs.length > 0) {
        const firstDocSlug = docs[0].slug;
        const indexHtmlContent = `<meta http-equiv="refresh" content="0; url=/docs/${firstDocSlug}/">`;
        fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'index.html'), indexHtmlContent);
    }

    // Generate docs.json for feed integration
    const docsJsonData = docs.map(doc => ({
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        category: doc.category || 'Guides',
        date: new Date().toISOString().split('T')[0]
    }));
    fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'docs.json'), JSON.stringify(docsJsonData, null, 2));
    console.log(`✅ Generated: /docs/docs.json`);

    console.log(`\n🎉 Docs build completed successfully! ${docs.length} pages generated.`);
    console.log('🎯 Adsterra ads injected with 100% CLS prevention');
}

buildDocs();
