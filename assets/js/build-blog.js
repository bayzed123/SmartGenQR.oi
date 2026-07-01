#!/usr/bin/env node

/**
 * SmartGen Blog Builder
 * Converts Markdown files from blog-posts/ into static HTML pages
 * Generates blog.json for dynamic frontend rendering
 * Includes SEO, Open Graph, and JSON-LD Schema
 */

const fs = require('fs');
const path = require('path');
const matter = require('front-matter');
const { marked } = require('marked');
const slugify = require('slugify');

// Configuration
const BLOG_POSTS_DIR = path.join(__dirname, '../blog-posts');
const BLOG_OUTPUT_DIR = path.join(__dirname, '../blog');
const TEMPLATES_DIR = path.join(__dirname, '../templates');
const AUTHOR_NAME = 'Sayad Md Bayezid Hosan';
const SITE_URL = 'https://smartgentools.com';

// Ensure directories exist
if (!fs.existsSync(BLOG_OUTPUT_DIR)) {
  fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
}

// Configure marked for better HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Read all markdown files from blog-posts directory
 */
function readBlogPosts() {
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    console.log('â ï¸  blog-posts directory not found. Creating it...');
    fs.mkdirSync(BLOG_POSTS_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(BLOG_POSTS_DIR).filter(file => file.endsWith('.md'));
  const posts = [];

  files.forEach(file => {
    const filePath = path.join(BLOG_POSTS_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { attributes, body } = matter(fileContent);

    const slug = slugify(attributes.title || file.replace('.md', ''), {
      lower: true,
      strict: true,
    });

    posts.push({
      slug,
      title: attributes.title || 'Untitled',
      description: attributes.description || '',
      content: body,
      date: attributes.date || new Date().toISOString().split('T')[0],
      tags: attributes.tags || [],
      image: attributes.image || `${SITE_URL}/assets/images/blog-default.jpg`,
      author: attributes.author || AUTHOR_NAME,
      category: attributes.category || 'General',
    });
  });

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Generate HTML for a single blog post
 */
function generatePostHTML(post) {
  const htmlContent = marked(post.content);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - SmartGen Blog</title>
    <meta name="description" content="${post.description}">
    <meta name="author" content="${post.author}">
    <meta name="keywords" content="${post.tags.join(', ')}">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.description}">
    <meta property="og:image" content="${post.image}">
    <meta property="og:url" content="${SITE_URL}/blog/${post.slug}/">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:author" content="${post.author}">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.description}">
    <meta name="twitter:image" content="${post.image}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${SITE_URL}/blog/${post.slug}/">
    
    <!-- JSON-LD Article Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${post.title}",
        "description": "${post.description}",
        "image": "${post.image}",
        "datePublished": "${post.date}",
        "author": {
            "@type": "Person",
            "name": "${post.author}",
            "url": "${SITE_URL}/about/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "SmartGen",
            "logo": {
                "@type": "ImageObject",
                "url": "${SITE_URL}/assets/images/logo.png"
            }
        }
    }
    </script>

    <!-- Fonts & Styles -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="stylesheet" href="../../assets/css/blog.css">
    
    <!-- Print Styles -->
    <style>
        @media print {
            header, footer, .newsletter-section, .blog-related-posts, #print-button, #share-button, #main-header, #main-footer {
                display: none !important;
            }
            body {
                background: white;
                color: black;
            }
            .blog-post-container {
                max-width: 100%;
                padding: 0;
            }
            .blog-post-article {
                box-shadow: none;
                border: none;
            }
            .blog-post-title {
                page-break-after: avoid;
            }
            .blog-post-content {
                color: black;
            }
            .blog-post-content a {
                color: #0066cc;
                text-decoration: underline;
            }
            img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
            }
            h2, h3, h4 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            p {
                orphans: 3;
                widows: 3;
            }
            pre {
                background: #f5f5f5 !important;
                border: 1px solid #ddd !important;
                page-break-inside: avoid;
            }
        }
    </style>
    
    <!-- Scripts -->
    <script src="../../assets/js/app.js" defer></script>
    <script src="../../assets/js/blog.js" defer></script>
</head>
<body>
    <header id="main-header"></header>

    <main class="blog-post-container">
        <article class="blog-post-article reveal-up">
            <header class="blog-post-header">
                <div class="blog-post-meta">
                    <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span class="meta-separator">â¢</span>
                    <span class="blog-post-category">${post.category}</span>
                    <span class="meta-separator">â¢</span>
                    <span class="blog-post-author">By ${post.author}</span>
                </div>
                <h1 class="blog-post-title">${post.title}</h1>
                <p class="blog-post-excerpt">${post.description}</p>
            </header>

            <img src="${post.image}" alt="${post.title}" class="blog-post-featured-image reveal-up delay-100">

            <div class="blog-post-content reveal-up delay-200">
                ${htmlContent}
            </div>

            <footer class="blog-post-footer reveal-up delay-300">
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button id="print-button" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;" title="Print or download this article as PDF">
                        <span>ð¨ï¸</span>
                        <span>Print / Download</span>
                    </button>
                    <button id="share-button" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;" title="Share this article">
                        <span>ð¤</span>
                        <span>Share</span>
                    </button>
                </div>
            </footer>
        </article>

        <!-- Newsletter Section -->
        <section class="newsletter-section reveal-up" style="background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); padding: 5rem 2rem; border-radius: 30px; margin: 4rem auto; max-width: 900px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.03);">
            <h2 style="font-size: 2.2rem; color: #2c3e50; margin-bottom: 1rem; font-weight: 800;">Join the SmartGen Community</h2>
            <p style="color: #666; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.6;">Get our latest tech updates, open-source guidelines, and tool reviews delivered straight to your inbox.</p>
            <form action="#" style="display: flex; gap: 10px; max-width: 500px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
                <input type="email" placeholder="Enter your email address" required style="flex: 1; min-width: 250px; padding: 15px 25px; border-radius: 50px; border: 1px solid #ddd; font-size: 1rem; outline: none; transition: border-color 0.3s ease;">
                <button type="submit" style="background: #2563eb; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Subscribe</button>
            </form>
        </section>

        <!-- Related Posts Section -->
        <section class="blog-related-posts reveal-up" data-post-slug="${post.slug}" data-post-tags="${post.tags.join(',')}">
            <h2 class="related-posts-title">ð Related Posts</h2>
            <div id="related-posts-grid" class="blog-grid">
                <!-- Related posts will be injected by JS -->
            </div>
        </section>
    </main>

    <footer id="main-footer"></footer>
    
    <script>
        // Print button functionality
        document.getElementById('print-button').addEventListener('click', function() {
            window.print();
        });
        
        // Share button functionality
        document.getElementById('share-button').addEventListener('click', function() {
            const title = document.querySelector('.blog-post-title').textContent;
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: title,
                    text: '${post.description}',
                    url: url
                }).catch(err => console.log('Share failed:', err));
            } else {
                const shareText = title + '\n' + url;
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Article link copied to clipboard!');
                }).catch(err => {
                    alert('Share URL: ' + url);
                });
            }
        });
    </script>
</body>
</html>`;

  return html;
}

/**
 * Generate the main Blog Archive page
 */
function generateArchiveHTML() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - SmartGen | Insights, Tutorials & Digital Tool Updates</title>
    <meta name="description" content="Explore the SmartGen blog for the latest tutorials, digital marketing insights, and web utility updates. Stay ahead with expert advice from Sayad Md Bayezid Hosan.">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="SmartGen Blog - Digital Insights & Web Tools">
    <meta property="og:description" content="Expert tutorials and insights on web utilities, SEO, and digital growth.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE_URL}/blog/">
    <meta property="og:image" content="${SITE_URL}/assets/images/blog-og.jpg">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="SmartGen Blog">
    <meta name="twitter:description" content="Expert tutorials and insights on web utilities, SEO, and digital growth.">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${SITE_URL}/blog/">
    
    <!-- JSON-LD Blog Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "SmartGen Blog",
        "description": "Digital insights and web tool tutorials.",
        "url": "${SITE_URL}/blog/",
        "publisher": {
            "@type": "Organization",
            "name": "SmartGen",
            "logo": {
                "@type": "ImageObject",
                "url": "${SITE_URL}/assets/images/logo.png"
            }
        }
    }
    </script>

    <!-- Fonts & Styles -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/blog.css">
    
    <!-- Scripts -->
    <script src="../assets/js/app.js" defer></script>
    <script src="../assets/js/blog.js" defer></script>
</head>
<body>
    <header id="main-header"></header>

    <main>
        <section class="blog-hero reveal-up">
            <div class="container">
                <h1 class="blog-hero-title">ð SmartGen Blog</h1>
                <p class="blog-hero-subtitle">Discover expert insights, step-by-step tutorials, and the latest updates from the SmartGen ecosystem.</p>
                
                <div class="blog-search-bar reveal-up delay-100">
                    <input type="text" id="blog-search-input" placeholder="Search posts..." class="blog-search-input">
                </div>
                
                <div id="blog-filters" class="blog-filters reveal-up delay-200">
                    <!-- Filters will be injected by JS -->
                </div>
            </div>
        </section>

        <section class="container reveal-up delay-300">
            <div id="blog-grid" class="blog-grid">
                <!-- Blog cards will be injected by JS -->
                <div class="loading-spinner" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p>â¨ Loading amazing stories...</p>
                </div>
            </div>
        </section>
        
        <!-- Premium Newsletter Section -->
        <section class="newsletter-section reveal-up" style="background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); padding: 5rem 2rem; border-radius: 30px; margin: 4rem auto; max-width: 1000px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.03);">
            <h2 style="font-size: 2.5rem; color: #2c3e50; margin-bottom: 1rem; font-weight: 800;">Join the SmartGen Community</h2>
            <p style="color: #666; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.6;">Get our latest tech updates, open-source guidelines, and tool reviews delivered straight to your inbox every week.</p>
            
            <form action="#" style="display: flex; gap: 10px; max-width: 500px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
                <input type="email" placeholder="Enter your email address" required style="flex: 1; min-width: 250px; padding: 15px 25px; border-radius: 50px; border: 1px solid #ddd; font-size: 1rem; outline: none; transition: border-color 0.3s ease;">
                <button type="submit" style="background: #2563eb; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Subscribe Now</button>
            </form>
            <p style="font-size: 0.8rem; color: #999; margin-top: 1.5rem;">No spam, ever. Unsubscribe at any time.</p>
        </section>

    </main>

    <footer id="main-footer"></footer>
</body>
</html>`;

  return html;
}

/**
 * Generate blog.json metadata file
 */
function generateBlogJSON(posts) {
  return JSON.stringify(posts, null, 2);
}

/**
 * Update sitemap.xml with blog posts
 */
function updateSitemap(posts) {
  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.log('â ï¸  sitemap.xml not found at root. Skipping sitemap update.');
    return;
  }

  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Remove existing blog entries to avoid duplicates
  // This regex finds <url> blocks that contain /blog/ in the <loc> tag
  const urlRegex = /<url>[\s\S]*?<loc>https:\/\/smartgentools\.com\/blog\/[\s\S]*?<\/url>/g;
  sitemapContent = sitemapContent.replace(urlRegex, '');

  // Clean up any double newlines caused by replacement
  sitemapContent = sitemapContent.replace(/\n\s*\n/g, '\n');

  // Prepare new blog entries
  let blogEntries = '';
  
  // Add main blog page if not present
  if (!sitemapContent.includes('https://smartgentools.com/blog/')) {
    blogEntries += `  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  }

  // Add individual posts
  posts.forEach(post => {
    // Use the post's actual date for lastmod for better SEO
    let postDate = today;
    if (post.date) {
      if (post.date instanceof Date) {
        postDate = post.date.toISOString().split('T')[0];
      } else if (typeof post.date === 'string') {
        postDate = post.date.split('T')[0];
      }
    }
    blogEntries += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}/</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });

  // Insert before the closing </urlset> tag
  if (sitemapContent.includes('</urlset>')) {
    sitemapContent = sitemapContent.replace('</urlset>', `${blogEntries}</urlset>`);
    // Final cleanup to ensure proper formatting
    sitemapContent = sitemapContent.replace(/<\/url>\s*<url>/g, '</url>\n  <url>');
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`â Updated: sitemap.xml with ${posts.length} blog posts\n`);
  } else {
    console.log('â ï¸  Could not find </urlset> in sitemap.xml. Sitemap update failed.');
  }
}

/**
 * Main build function
 */
function buildBlog() {
  console.log('ð Starting SmartGen Blog Build...\n');

  // Read all blog posts
  const posts = readBlogPosts();
  console.log(`â Found ${posts.length} blog post(s)\n`);

  if (posts.length === 0) {
    console.log('â ï¸  No blog posts found. Create .md files in blog-posts/ directory.');
    console.log('ð Example: blog-posts/my-first-post.md\n');
  }

  // Generate individual post pages
  posts.forEach(post => {
    const postDir = path.join(BLOG_OUTPUT_DIR, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    const postHTML = generatePostHTML(post);
    fs.writeFileSync(path.join(postDir, 'index.html'), postHTML);
    console.log(`â Generated: /blog/${post.slug}/index.html`);
  });

  // Generate blog archive page
  const archiveHTML = generateArchiveHTML();
  fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, 'index.html'), archiveHTML);
  console.log(`â Generated: /blog/index.html\n`);

  // Generate blog.json
  const blogJSON = generateBlogJSON(posts);
  fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, 'blog.json'), blogJSON);
  console.log(`â Generated: /blog/blog.json\n`);

  // Update sitemap.xml
  updateSitemap(posts);

  console.log('ð Blog build completed successfully!');
  console.log(`ð Total posts: ${posts.length}`);
  console.log(`ð Blog URL: ${SITE_URL}/blog/\n`);
}

// Run the build
buildBlog();