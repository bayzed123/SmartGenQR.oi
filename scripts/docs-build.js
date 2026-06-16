const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');

const DOCS_POSTS_DIR = path.join(__dirname, '../docs-posts');
const DOCS_OUTPUT_DIR = path.join(__dirname, '../docs');
const SITE_URL = 'https://smartgentools.com'; // Replace with your actual site URL

// Ensure docs output directory exists
if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
    fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
}

/**
 * Reads all Markdown files from the docs-posts directory
 * and parses their front-matter and content.
 * @returns {Array} An array of doc post objects.
 */
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


        const slug = slugify(attributes.title || file.replace('.md', ''), {
            lower: true,
            strict: true,
        });

        docs.push({
            slug,
            title: attributes.title || 'Untitled',
            description: attributes.description || '',
            content: body,
            order: attributes.order || 999, // Default order for sorting
        });
    });

    // Sort docs by the 'order' property
    return docs.sort((a, b) => a.order - b.order);
}

/**
 * Generates the HTML content for a single documentation page.
 * @param {Object} doc - The doc post object.
 * @param {Array} allDocs - All doc post objects for sidebar generation.
 * @returns {string} The full HTML content for the doc page.
 */
function generateDocHTML(doc, allDocs) {
    const htmlContent = marked(doc.content);

    const sidebarNav = allDocs.map(d => `
        <a href="/docs/${d.slug}/" class="nav-link ${d.slug === doc.slug ? 'active' : ''}">${d.title}</a>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title} - SmartGen Docs</title>
    <meta name="description" content="${doc.description}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${doc.title} - SmartGen Docs">
    <meta property="og:description" content="${doc.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/docs/${doc.slug}/">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${SITE_URL}/docs/${doc.slug}/">
    
    <!-- Styles -->
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --bg-primary: #ffffff;
            --bg-secondary: #f6f8fa;
            --bg-tertiary: #eaeef2;
            --text-primary: #24292f;
            --text-secondary: #57606a;
            --text-tertiary: #8c959f;
            --border-color: #d0d7de;
            --code-bg: #f6f8fa;
            --code-text: #24292f;
        }

        [data-theme="dark"] {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-tertiary: #6e7681;
            --border-color: #30363d;
            --code-bg: #161b22;
            --code-text: #e6edf3;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            transition: background-color 0.3s, color 0.3s;
        }

        header {
            border-bottom: 1px solid var(--border-color);
            background-color: var(--bg-secondary);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logo-icon {
            font-size: 1.8rem;
        }

        .theme-toggle {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: background-color 0.2s;
        }

        .theme-toggle:hover {
            background-color: var(--bg-tertiary);
        }

        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        .docs-layout {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
            padding: 2rem 0;
            min-height: calc(100vh - 60px);
        }

        .sidebar {
            background-color: var(--bg-secondary);
            border-radius: 8px;
            padding: 1.5rem;
            height: fit-content;
            position: sticky;
            top: 80px;
            border: 1px solid var(--border-color);
        }

        .sidebar-title {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-tertiary);
            margin-bottom: 1rem;
            letter-spacing: 0.05em;
        }

        .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .sidebar-nav a {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 0.9rem;
            transition: all 0.2s;
            border-left: 2px solid transparent;
        }

        .sidebar-nav a:hover {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .sidebar-nav a.active {
            background-color: rgba(37, 99, 235, 0.1);
            color: var(--primary);
            border-left-color: var(--primary);
        }

        .main-content {
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 2rem;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        h2 {
            font-size: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        h3 {
            font-size: 1.1rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        a {
            color: var(--primary);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        code {
            background-color: var(--code-bg);
            color: var(--code-text);
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Fira Code', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
            margin: 1rem 0;
        }

        pre code {
            background: none;
            padding: 0;
            color: var(--code-text);
        }

        ul, ol {
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }

        li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 0.75rem;
            text-align: left;
        }

        th {
            background-color: var(--bg-secondary);
            font-weight: 600;
            color: var(--text-primary);
        }

        tr:nth-child(even) {
            background-color: var(--bg-secondary);
        }

        .alert {
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            border-left: 4px solid;
        }

        .alert-info {
            background-color: rgba(37, 99, 235, 0.1);
            border-left-color: var(--primary);
            color: var(--text-primary);
        }

        .alert-warning {
            background-color: rgba(255, 193, 7, 0.1);
            border-left-color: #ffc107;
            color: var(--text-primary);
        }

        .alert-success {
            background-color: rgba(76, 175, 80, 0.1);
            border-left-color: #4caf50;
            color: var(--text-primary);
        }

        .breadcrumb {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: var(--text-tertiary);
        }

        .breadcrumb a {
            color: var(--primary);
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 1.5rem 0;
        }

        .feature-card {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.2s;
        }

        .feature-card:hover {
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .feature-card h3 {
            margin-top: 0;
            color: var(--primary);
        }

        .feature-card p {
            margin-bottom: 0;
        }

        @media (max-width: 768px) {
            .docs-layout {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .sidebar {
                position: static;
                padding: 1rem;
            }

            h1 {
                font-size: 1.5rem;
            }

            h2 {
                font-size: 1.25rem;
            }

            .main-content {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <a href="/" class="logo">
                <div class="logo-icon">⚡</div>
                SmartGen Docs
            </a>
            <div class="header-actions">
                <button class="theme-toggle" id="theme-toggle" title="Toggle Theme">🌓</button>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="docs-layout">
            <aside class="sidebar">
                <div class="sidebar-title">Documentation</div>
                <nav class="sidebar-nav">
                    ${sidebarNav}
                </nav>
            </aside>

            <main class="main-content">
                <div class="breadcrumb">
                    <a href="/">Home</a>
                    <span>/</span>
                    <a href="/docs/">Documentation</a>
                    <span>/</span>
                    <span>${doc.title}</span>
                </div>

                <h1>${doc.title}</h1>
                <p class="doc-description">${doc.description}</p>

                <div class="doc-content">
                    ${htmlContent}
                </div>
            </main>
        </div>
    </div>

    <script>
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Smooth scroll for navigation links (optional, can be added later if needed)
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                // e.preventDefault(); // Prevent default if using client-side routing
                // For static pages, default behavior is fine, but we can add active class logic
                document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Set active class on load based on current URL
        const currentPath = window.location.pathname;
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Main build function for documentation.
 */
function buildDocs() {
    console.log('🚀 Starting SmartGen Docs Build...\n');

    const docs = readDocPosts();
    console.log(`✅ Found ${docs.length} documentation page(s)\n`);

    if (docs.length === 0) {
        console.log('⚠️  No documentation files found. Create .md files in docs-posts/ directory.');
        console.log('📝 Example: docs-posts/getting-started.md\n');
        return;
    }

    // Generate individual doc pages
    docs.forEach(doc => {
        const docDir = path.join(DOCS_OUTPUT_DIR, doc.slug);
        if (!fs.existsSync(docDir)) {
            fs.mkdirSync(docDir, { recursive: true });
        }

        const docHTML = generateDocHTML(doc, docs); // Pass all docs for sidebar
        fs.writeFileSync(path.join(docDir, 'index.html'), docHTML);
        console.log(`✅ Generated: /docs/${doc.slug}/index.html`);
    });

    // Generate main docs index.html (optional, can be a redirect or a landing page)
    // For now, let's create a simple redirect to the first doc post
    if (docs.length > 0) {
        const firstDocSlug = docs[0].slug;
        const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/docs/${firstDocSlug}/">
    <link rel="canonical" href="${SITE_URL}/docs/${firstDocSlug}/">
    <title>Redirecting to ${docs[0].title}</title>
</head>
<body>
    <p>Redirecting to <a href="/docs/${firstDocSlug}/">${docs[0].title}</a></p>
</body>
</html>`;
        fs.writeFileSync(path.join(DOCS_OUTPUT_DIR, 'index.html'), indexHtmlContent);
        console.log(`✅ Generated: /docs/index.html (redirect to /docs/${firstDocSlug}/)`);
    }

    console.log('\n🎉 Docs build completed successfully!');
    console.log(`📊 Total docs: ${docs.length}`);
    console.log(`🌐 Docs URL: ${SITE_URL}/docs/\n`);
}

// Run the build
buildDocs();
