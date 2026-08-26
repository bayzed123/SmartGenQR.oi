const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const { BuildTimeAdInjector } = require('../utils/ad-injector.js');

const REPOSITORY_ROOT = path.join(__dirname, '..');
const DOCS_POSTS_DIR = path.join(REPOSITORY_ROOT, 'docs-posts');
const DOCS_OUTPUT_DIR = path.join(REPOSITORY_ROOT, 'docs');
const SITE_URL = 'https://smartgentools.com';
const REPOSITORY_URL = 'https://github.com/bayzed123/SmartGenQR.oi/blob/main';
const TITLE_SUFFIX = ' - SmartGen Docs';
const TITLE_LIMIT = 60;

marked.setOptions({ breaks: true, gfm: true });

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function toPosix(value) {
    return value.split(path.sep).join('/');
}

function slug(value) {
    return slugify(String(value || '').trim(), { lower: true, strict: true });
}

function titleFromMarkdown(markdown) {
    const match = markdown.match(/^\s*#\s+(.+?)\s*$/m);
    return match ? match[1].replace(/[*_`]/g, '').trim() : '';
}

function titleFromFile(file) {
    return file.replace(/\.md$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function listMarkdownFiles(dir, prefix = '') {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        if (entry.name.startsWith('.')) return [];
        if (entry.isFile() && entry.name.toLowerCase() === 'navigation.md') return [];
        const relativePath = path.join(prefix, entry.name);
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return listMarkdownFiles(fullPath, relativePath);
        return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [relativePath] : [];
    });
}

function routeForSource(relativePath, attributes, legacyTitle) {
    const parts = toPosix(relativePath).split('/');
    const sourceFile = parts.pop();
    const sourceBase = sourceFile.replace(/\.md$/i, '');

    // Existing root files retain the exact legacy single-segment URL logic.
    if (parts.length === 0) {
        return [attributes.slug ? slug(attributes.slug) : slug(legacyTitle)];
    }

    const folderSegments = parts.map(slug);
    if (sourceBase.toLowerCase() === 'index') return folderSegments;
    return [...folderSegments, attributes.slug ? slug(attributes.slug) : slug(sourceBase)];
}

function aliasesFor(attributes) {
    const raw = attributes.aliases || attributes.legacy_urls || attributes.legacyUrls || [];
    const values = Array.isArray(raw) ? raw : String(raw).split(',');
    return values
        .map(value => String(value || '').trim())
        .filter(Boolean)
        .map(value => value.replace(/^\/?docs\//, '').replace(/^\/+|\/+$/g, ''))
        .filter(Boolean);
}

function categoryFor(routeParts, attributes) {
    if (attributes.category) return String(attributes.category);
    if (routeParts.length > 1 || (routeParts.length === 1 && routeParts[0] === 'barcode-system')) {
        return routeParts[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return 'Guides';
}

function readDocPosts() {
    ensureDir(DOCS_POSTS_DIR);
    return listMarkdownFiles(DOCS_POSTS_DIR).map(relativePath => {
        const sourcePath = path.join(DOCS_POSTS_DIR, relativePath);
        const parsed = matter(fs.readFileSync(sourcePath, 'utf8'));
        const legacyTitle = parsed.data.title || titleFromFile(path.basename(relativePath));
        const title = parsed.data.title || titleFromMarkdown(parsed.content) || legacyTitle;
        const routeParts = routeForSource(relativePath, parsed.data, legacyTitle);
        const folder = routeParts.length > 1 || (routeParts.length === 1 && path.basename(relativePath).toLowerCase() === 'index.md')
            ? routeParts[0]
            : null;

        return {
            title,
            legacyTitle,
            routeParts,
            route: routeParts.join('/'),
            sourcePath,
            sourceRelative: toPosix(relativePath),
            content: parsed.content,
            description: parsed.data.description || 'SmartGen Developer Documentation',
            seoTitle: String(parsed.data.seo_title || parsed.data.seoTitle || '').trim(),
            category: categoryFor(routeParts, parsed.data),
            order: Number.isFinite(Number(parsed.data.order)) ? Number(parsed.data.order) : 999,
            aliases: aliasesFor(parsed.data),
            folder,
            isFolderIndex: path.basename(relativePath).toLowerCase() === 'index.md'
        };
    }).sort((a, b) => a.order - b.order || a.route.localeCompare(b.route));
}

function docUrl(doc) {
    return `/docs/${doc.route}/`;
}

function pageTitle(doc) {
    const base = (doc.seoTitle || doc.title || '').trim();
    return base.length + TITLE_SUFFIX.length <= TITLE_LIMIT ? base + TITLE_SUFFIX : base;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function normaliseOutline(htmlContent) {
    const depth = [{ original: 0, emitted: 1 }];
    const openTags = [];
    return htmlContent.replace(/<(\/)?h([1-6])\b/gi, (match, closing, level) => {
        const original = Number(level);
        if (closing) return `</h${openTags.length ? openTags.pop() : original}`;
        while (depth.length > 1 && depth[depth.length - 1].original >= original) depth.pop();
        const emitted = Math.min(depth[depth.length - 1].emitted + 1, 6);
        depth.push({ original, emitted });
        openTags.push(emitted);
        return `<h${emitted}`;
    });
}

function createMaps(docs) {
    const byRoute = new Map();
    const bySource = new Map();
    const aliases = new Map();
    const collisions = [];

    docs.forEach(doc => {
        if (byRoute.has(doc.route)) collisions.push(`/docs/${doc.route}/ from ${byRoute.get(doc.route).sourceRelative} and ${doc.sourceRelative}`);
        byRoute.set(doc.route, doc);
        bySource.set(doc.sourceRelative, doc);
    });
    docs.forEach(doc => doc.aliases.forEach(alias => {
        if (byRoute.has(alias) || aliases.has(alias)) collisions.push(`legacy alias /docs/${alias}/ conflicts with another documentation route`);
        aliases.set(alias, doc);
    }));
    if (collisions.length) throw new Error(`Documentation URL collision(s):\n${collisions.join('\n')}`);
    return { byRoute, bySource, aliases };
}

function resolveDocLink(href, doc, maps) {
    if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return href;
    const [rawPath, hash = ''] = href.split('#');
    const fragment = hash ? `#${hash}` : '';

    if (rawPath.startsWith('/docs/')) {
        const route = rawPath.replace(/^\/docs\//, '').replace(/^\/+|\/+$/g, '');
        const target = maps.byRoute.get(route) || maps.aliases.get(route);
        return target ? `${docUrl(target)}${fragment}` : href;
    }

    if (!/\.md$/i.test(rawPath)) return href;
    const sourceTarget = toPosix(path.normalize(path.join(path.dirname(doc.sourceRelative), rawPath)));
    const targetDoc = maps.bySource.get(sourceTarget);
    if (targetDoc) return `${docUrl(targetDoc)}${fragment}`;

    // Markdown files outside docs-posts are repository documentation links.
    const repositoryTarget = path.resolve(DOCS_POSTS_DIR, sourceTarget);
    if (repositoryTarget.startsWith(REPOSITORY_ROOT) && fs.existsSync(repositoryTarget)) {
        return `${REPOSITORY_URL}/${toPosix(path.relative(REPOSITORY_ROOT, repositoryTarget))}${fragment}`;
    }
    return href;
}

function createRenderer(doc, maps, tocList) {
    const renderer = new marked.Renderer();
    renderer.heading = function (...args) {
        const token = typeof args[0] === 'object' && args[0] !== null && 'depth' in args[0] ? args[0] : null;
        const text = token ? (this.parser ? this.parser.parseInline(token.tokens) : token.text || '') : args[0];
        const level = token ? token.depth : args[1];
        const plainText = String(text).replace(/<[^>]*>/g, '');
        const headingSlug = slug(plainText);
        if (level === 2 || level === 3) tocList.push({ level, text: plainText, slug: headingSlug });
        return `<h${level} id="${headingSlug}">${text}</h${level}>\n`;
    };
    renderer.link = function (...args) {
        const token = typeof args[0] === 'object' && args[0] !== null && 'href' in args[0] ? args[0] : null;
        const href = resolveDocLink(token ? token.href : args[0], doc, maps);
        const title = token ? token.title : args[1];
        const text = token ? token.text : args[2];
        return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}>${text}</a>`;
    };
    renderer.image = function (...args) {
        const token = typeof args[0] === 'object' && args[0] !== null && 'href' in args[0] ? args[0] : null;
        const href = token ? token.href : args[0];
        const title = token ? token.title : args[1];
        const text = token ? token.text : args[2];
        const source = href && !href.startsWith('http') && !href.startsWith('/') ? `/${href}` : href || '';
        return `<img src="${escapeHtml(source)}" alt="${escapeHtml(text)}" title="${escapeHtml(title)}" class="doc-image">\n`;
    };
    return renderer;
}

function groupsFor(docs) {
    const groups = new Map();
    docs.forEach(doc => {
        const key = doc.folder ? `folder:${doc.folder}` : `category:${doc.category}`;
        const title = doc.folder ? doc.folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : doc.category;
        if (!groups.has(key)) groups.set(key, { title, docs: [] });
        groups.get(key).docs.push(doc);
    });
    return [...groups.values()].map(group => ({
        ...group,
        docs: group.docs.sort((a, b) => Number(b.isFolderIndex) - Number(a.isFolderIndex) || a.order - b.order || a.title.localeCompare(b.title))
    }));
}

function sidebarHtml(doc, docs) {
    return groupsFor(docs).map(group => `
        <div class="nav-section-title">${escapeHtml(group.title)}</div>
        ${group.docs.map(item => {
            const active = item.route === doc.route ? 'active' : '';
            const nested = item.folder && !item.isFolderIndex ? 'nav-link-subpage' : '';
            return `<a href="${docUrl(item)}" class="nav-link ${nested} ${active}" ${active ? 'aria-current="page"' : ''} data-doc-nav-link>
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                ${escapeHtml(item.title)}
            </a>`;
        }).join('')}`).join('');
}

function navigationDocs(doc, docs) {
    const candidates = doc.folder ? docs.filter(item => item.folder === doc.folder) : docs.filter(item => !item.folder && item.category === doc.category);
    const sorted = candidates.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    const index = sorted.findIndex(item => item.route === doc.route);
    return { previous: index > 0 ? sorted[index - 1] : null, next: index < sorted.length - 1 ? sorted[index + 1] : null };
}

function generateDocHtml(doc, docs, maps) {
    const tocList = [];
    const renderer = createRenderer(doc, maps, tocList);
    const htmlContent = normaliseOutline(marked.parse(doc.content, { renderer }));
    const nav = navigationDocs(doc, docs);
    const assetsPrefix = '../'.repeat(doc.routeParts.length + 1);
    const toc = tocList.length ? `<aside class="toc-sidebar desktop-only"><div class="toc-heading">On This Page</div><ul class="toc-list">${tocList.map(item => `<li class="toc-item ${item.level === 3 ? 'toc-sub' : 'toc-main'}"><a href="#${item.slug}" class="toc-link">${escapeHtml(item.text)}</a></li>`).join('')}</ul></aside>` : '';
    const footer = `<div class="doc-footer"><div class="nav-table"><div class="nav-row"><div class="nav-cell nav-prev">${nav.previous ? `<div class="nav-label">← Previous</div><a href="${docUrl(nav.previous)}" class="nav-link-footer">${escapeHtml(nav.previous.title)}</a>` : '<div class="nav-empty"></div>'}</div><div class="nav-cell nav-next">${nav.next ? `<div class="nav-label">Next →</div><a href="${docUrl(nav.next)}" class="nav-link-footer">${escapeHtml(nav.next.title)}</a>` : '<div class="nav-empty"></div>'}</div></div></div><hr class="footer-divider"><div class="help-section"><div class="help-box"><h3>Did you find what you needed?</h3><p>SmartGen documentation is open source. You can report unclear content or submit an improvement through GitHub.</p></div><div class="help-box"><h3>Still need help?</h3><p><a href="https://github.com/bayzed123/SmartGenQR.oi/discussions" class="link-secondary">Ask the SmartGen community</a> or <a href="https://smartgentools.com/contact/" class="link-secondary">contact support</a>.</p></div></div><div class="footer-legal"><p><small>© 2026 SmartGen. <a href="https://smartgentools.com/terms/">Terms</a> · <a href="https://smartgentools.com/privacy/">Privacy</a></small></p></div></div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle(doc))}</title>
  <meta name="description" content="${escapeHtml(doc.description)}">
  <link rel="canonical" href="${SITE_URL}${docUrl(doc)}">
  <link rel="stylesheet" href="${assetsPrefix}assets/css/docs.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9789336661158068" crossorigin="anonymous"></script>
  <style>.toc-sidebar{min-width:200px;padding-left:1.5rem;border-left:1px solid #e5e7eb}.toc-heading{font-weight:600;font-size:.85rem;text-transform:uppercase;color:#888;margin-bottom:.75rem}.toc-list{list-style:none;padding:0;margin:0}.toc-list li{margin-bottom:.5rem}.toc-main a{font-size:.9rem;color:#444;text-decoration:none}.toc-sub a{font-size:.85rem;color:#777;padding-left:1rem;display:block}.toc-link:hover,.toc-link.active{color:#3b82f6;font-weight:500}.doc-layout-with-toc{display:flex;gap:2rem}.nav-link-subpage{padding-left:1.4rem!important;font-size:.92em}@media(max-width:900px){.toc-sidebar{display:none}}.doc-footer{margin-top:3rem;padding-top:2rem;border-top:1px solid #e5e7eb}.nav-table{display:table;width:100%;margin-bottom:2rem}.nav-row{display:table-row}.nav-cell{display:table-cell;padding:1rem;width:50%}.nav-next{text-align:right;border-left:1px solid #e5e7eb}.nav-label{font-size:.85rem;color:#666;margin-bottom:.5rem;font-weight:500}.nav-link-footer,.link-secondary{color:#0969da;text-decoration:none;font-weight:600}.nav-link-footer:hover,.link-secondary:hover{text-decoration:underline}.nav-empty{height:2.5rem}.footer-divider{margin:2rem 0;border:none;border-top:1px solid #e5e7eb}.help-section{margin:2rem 0}.help-box{margin-bottom:1.5rem}.help-box h3{font-size:1rem;margin:0 0 .5rem}.help-box p{margin:.5rem 0;color:#555;line-height:1.5}.footer-legal{text-align:center;color:#666}@media(max-width:768px){.nav-cell{display:block;width:100%;padding:1rem 0}.nav-next{text-align:left;border-left:0;border-top:1px solid #e5e7eb}}</style>
</head>
<body>
  <header class="docs-header"><div class="header-left"><button id="mobile-menu-btn" class="icon-btn mobile-only" aria-label="Menu"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><a href="/" class="logo">SmartGen Docs</a></div><div class="header-right"><button id="theme-toggle" class="icon-btn" aria-label="Toggle Theme">Theme</button></div></header>
  <div class="docs-layout"><div id="sidebar-overlay" class="sidebar-overlay"></div><aside id="sidebar" class="sidebar"><nav class="sidebar-nav">${sidebarHtml(doc, docs)}</nav><div class="sidebar-footer"><a href="https://smartgentools.com" class="footer-link">Home</a><a href="https://smartgentools.com/blog" class="footer-link">Blog</a></div></aside><main class="main-content"><div class="doc-layout-with-toc"><article class="doc-article"><div class="breadcrumb"><a href="/docs/">Docs</a> <span class="separator">/</span> <span>${escapeHtml(doc.category)}</span></div><h1 class="doc-title">${escapeHtml(doc.title)}</h1><div class="doc-body">${htmlContent}</div>${footer}</article>${toc}</div></main></div>
  <script src="${assetsPrefix}assets/js/docs.js"></script>
  <script>document.querySelectorAll('.toc-link').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));</script>
</body>
</html>`;
}

function redirectHtml(target) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${SITE_URL}${target}"><title>Redirecting to SmartGen Docs</title><script>location.replace(${JSON.stringify(target)});</script></head><body><p>Redirecting to <a href="${target}">SmartGen Docs</a>…</p></body></html>`;
}

function writeDoc(doc, html) {
    const outputDir = path.join(DOCS_OUTPUT_DIR, ...doc.routeParts);
    ensureDir(outputDir);
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

function writeAlias(alias, target, generatedRoutes) {
    if (generatedRoutes.has(alias)) return;
    const outputDir = path.join(DOCS_OUTPUT_DIR, ...alias.split('/'));
    ensureDir(outputDir);
    fs.writeFileSync(path.join(outputDir, 'index.html'), redirectHtml(target));
}

function clearGeneratedFolderOutputs(docs) {
    const folderRoots = [...new Set(docs.map(doc => doc.folder).filter(Boolean))];
    folderRoots.forEach(folder => {
        // Folder routes are regenerated as a complete unit. Flat legacy routes
        // in /docs remain untouched, so existing published URLs are preserved.
        fs.rmSync(path.join(DOCS_OUTPUT_DIR, folder), { recursive: true, force: true });
    });
}

function buildDocs() {
    console.log('Starting SmartGen documentation build with legacy and folder URL support.');
    ensureDir(DOCS_OUTPUT_DIR);
    const docs = readDocPosts();
    const maps = createMaps(docs);
    const generatedRoutes = new Set(docs.map(doc => doc.route));
    clearGeneratedFolderOutputs(docs);

    docs.forEach(doc => {
        let html = generateDocHtml(doc, docs, maps);
        html = BuildTimeAdInjector.injectAllAds(html);
        writeDoc(doc, html);
        console.log(`Built ${docUrl(doc)} from ${doc.sourceRelative}`);
    });

    maps.aliases.forEach((doc, alias) => {
        writeAlias(alias, docUrl(doc), generatedRoutes);
        console.log(`Preserved legacy alias /docs/${alias}/ → ${docUrl(doc)}`);
    });

    // Preserve the established /docs/ landing behavior for existing visitors.
    const firstLegacyDoc = docs.find(doc => !doc.folder) || docs[0];
    if (firstLegacyDoc) fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'index.html'), redirectHtml(docUrl(firstLegacyDoc)));

    const manifest = docs.map(doc => ({
        title: doc.title,
        url: docUrl(doc),
        legacyUrls: doc.aliases.map(alias => `/docs/${alias}/`),
        source: `docs-posts/${doc.sourceRelative}`,
        category: doc.category,
        description: doc.description
    }));
    fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'docs.json'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'url-manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), routes: manifest }, null, 2));
    console.log(`Documentation build completed: ${docs.length} pages, legacy URLs preserved, folder routes generated.`);
}

buildDocs();
