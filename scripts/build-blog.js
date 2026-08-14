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
const { BuildTimeAdInjector } = require('../utils/ad-injector.js');

// Configuration
const BLOG_POSTS_DIR = path.join(__dirname, '../blog-posts');
const BLOG_OUTPUT_DIR = path.join(__dirname, '../blog');
const TEMPLATES_DIR = path.join(__dirname, '../templates');
const INCLUDES_DIR = path.join(__dirname, '../_includes');
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
    console.log('⚠️  blog-posts directory not found. Creating it...');
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
 * Load author profile box
 */
function loadAuthorProfileBox() {
  try {
    const profilePath = path.join(INCLUDES_DIR, 'author-profile-box.html');
    if (fs.existsSync(profilePath)) {
      return fs.readFileSync(profilePath, 'utf8');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not load author profile box:', error.message);
  }
  return '';
}

/**
 * Load author footer box
 */
function loadAuthorFooterBox() {
  try {
    const footerPath = path.join(INCLUDES_DIR, 'author-blog-fotter-box.html');
    if (fs.existsSync(footerPath)) {
      return fs.readFileSync(footerPath, 'utf8');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not load author footer box:', error.message);
  }
  return '';
}

/**
 * Check if footer box is already in content
 */
function hasAuthorFooterBox(content) {
  return content.includes('author-blog-fotter-box') || content.includes('author-footer-box') || content.includes('E-E-A-T Signal') || content.includes('<!--AUTHOR_FOOTER-->');
}

/**
 * Replace manual tags with actual content
 * Supports: <!--AUTHOR_PROFILE--> and <!--AUTHOR_FOOTER-->
 */
function replaceManualTags(htmlContent, authorProfileBox, authorFooterBox) {
  let processedContent = htmlContent;
  
  // Replace manual profile tag if present
  if (processedContent.includes('<!--AUTHOR_PROFILE-->')) {
    processedContent = processedContent.replace('<!--AUTHOR_PROFILE-->', authorProfileBox);
  }
  
  // Replace manual footer tag if present
  if (processedContent.includes('<!--AUTHOR_FOOTER-->')) {
    processedContent = processedContent.replace('<!--AUTHOR_FOOTER-->', authorFooterBox);
  }
  
  return processedContent;
}

/**
 * Generate HTML for a single blog post
 */
function generatePostHTML(post) {
  let htmlContent = marked(post.content);
  const authorProfileBox = loadAuthorProfileBox();
  const authorFooterBox = loadAuthorFooterBox();
  
  // Check if profile/footer were manually placed
  const hasManualProfile = post.content.includes('<!--AUTHOR_PROFILE-->');
  const hasManualFooter = post.content.includes('<!--AUTHOR_FOOTER-->');
  
  // Replace manual tags if they exist in the markdown
  htmlContent = replaceManualTags(htmlContent, authorProfileBox, authorFooterBox);
  
  // Only add auto cards if they're not manually placed
  const autoProfileBox = hasManualProfile ? '' : authorProfileBox;
  const autoFooterBox = hasManualFooter ? '' : authorFooterBox;

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
    
    <!-- HTTPS Redirect Script -->
    <script>
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            location.replace('https:' + location.href.substring(location.protocol.length));
        }
    </script>
    
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

    <!-- JSON-LD BreadcrumbList Schema (rich-result breadcrumb trail) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${SITE_URL}/blog/" },
            { "@type": "ListItem", "position": 3, "name": "${post.title.replace(/"/g, '\\"')}", "item": "${SITE_URL}/blog/${post.slug}/" }
        ]
    }
    </script>

    <!-- Fonts & Styles -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="stylesheet" href="../../assets/css/blog.css">
    <link rel="stylesheet" href="../../assets/css/ads.css">
    
    <!-- Inline Styles for Print and Share Modal -->
    <style>
        /* Print Styles */
        @media print {
            header, footer, .newsletter-section, .blog-related-posts, #print-button, #share-button, #main-header, #main-footer, .share-modal {
                display: none !important;
            }
            body { background: white; color: black; }
            .blog-post-container { max-width: 100%; padding: 0; }
            .blog-post-article { box-shadow: none; border: none; }
            .blog-post-title { page-break-after: avoid; }
            .blog-post-content { color: black; }
            .blog-post-content a { color: #0066cc; text-decoration: underline; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            h2, h3, h4 { page-break-after: avoid; page-break-inside: avoid; }
            p { orphans: 3; widows: 3; }
            pre { background: #f5f5f5 !important; border: 1px solid #ddd !important; page-break-inside: avoid; }
        }

        /* Share Modal Styles */
        .share-modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .share-modal.show {
            display: flex;
            opacity: 1;
        }
        .share-modal-content {
            background: white;
            padding: 2.5rem 2rem;
            border-radius: 16px;
            max-width: 350px;
            width: 90%;
            position: relative;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .share-modal.show .share-modal-content {
            transform: translateY(0);
        }
        .share-close {
            position: absolute;
            right: 15px;
            top: 10px;
            font-size: 28px;
            color: #666;
            cursor: pointer;
            transition: color 0.2s;
        }
        .share-close:hover { color: #000; }
        .share-modal h3 {
            margin-top: 0;
            margin-bottom: 1.5rem;
            color: #1f2937;
            font-size: 1.5rem;
        }
        .share-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .share-btn {
            padding: 12px;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: transform 0.2s, opacity 0.2s;
        }
        .share-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .share-btn.fb { background: #1877F2; }
        .share-btn.tw { background: #000000; }
        .share-btn.li { background: #0A66C2; }
        .share-btn.wa { background: #25D366; }
        .share-btn.copy { background: #4b5563; }
    </style>
    
    <!-- Scripts -->
    <script src="../../assets/js/app.js" defer></script>
    <script src="../../assets/js/search-data.js" defer></script>
    <script src="../../assets/js/blog.js" defer></script>

    <!-- Google AdSense Code -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9789336661158068" crossorigin="anonymous"></script>
</head>
<body>
    <header id="main-header"></header>

    <main class="blog-post-container">
        <nav class="blog-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span class="blog-breadcrumb-sep">/</span>
            <a href="/blog/">Blog</a>
            <span class="blog-breadcrumb-sep">/</span>
            <span class="blog-breadcrumb-current">${post.title}</span>
        </nav>
        <article class="blog-post-article reveal-up">
            <header class="blog-post-header">
                <div class="blog-post-meta">
                    <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span class="meta-separator">•</span>
                    <span class="blog-post-category">${post.category}</span>
                    <span class="meta-separator">•</span>
                    <span class="blog-post-author">By ${post.author}</span>
                </div>
                <h1 class="blog-post-title">${post.title}</h1>
                <p class="blog-post-excerpt">${post.description}</p>
            </header>

            <!-- Author Profile Section - Right after title (Auto-inserted if not manually placed) -->
            ${autoProfileBox}

            <img src="${post.image}" alt="${post.title}" class="blog-post-featured-image reveal-up delay-100">

            <div class="blog-post-content reveal-up delay-200">
                ${htmlContent}
            </div>

            <!-- Adsterra In-Content Ads (Auto-injected) -->
            <div id="adsterra-in-content-container"></div>

            <footer class="blog-post-footer reveal-up delay-300">
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button id="print-button" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;" title="Print or download this article as PDF">
                        <span>🖨️</span>
                        <span>Print / Download</span>
                    </button>
                    <button id="share-button" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;" title="Share this article">
                        <span>📤</span>
                        <span>Share</span>
                    </button>
                </div>
            </footer>
        </article>

        <!-- Author Footer Section - E-E-A-T Signal (After Article, Auto-inserted if not manually placed) -->
        ${autoFooterBox ? autoFooterBox : ''}

        <!-- Newsletter Section -->
        <section class="newsletter-section reveal-up" style="background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); padding: 5rem 2rem; border-radius: 30px; margin: 4rem auto; max-width: 900px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.03);">
            <h2 style="font-size: 2.2rem; color: #2c3e50; margin-bottom: 1rem; font-weight: 800;">Join the SmartGen Community</h2>
            <p style="color: #666; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.6;">Get our latest tech updates, open-source guidelines, and tool reviews delivered straight to your inbox.</p>
            <form class="newsletter-form" action="#" style="display: flex; gap: 10px; max-width: 500px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
                <input type="email" name="email" placeholder="Enter your email address" required style="flex: 1; min-width: 250px; padding: 15px 25px; border-radius: 50px; border: 1px solid #ddd; font-size: 1rem; outline: none; transition: border-color 0.3s ease;">
                <input type="text" name="company_website" class="newsletter-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
                <button type="submit" class="newsletter-submit-btn" style="background: #2563eb; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Subscribe</button>
            </form>
            <p class="newsletter-feedback" role="status" aria-live="polite"></p>
        </section>

        <!-- Related Posts Section -->
        <section class="blog-related-posts reveal-up" data-post-slug="${post.slug}" data-post-tags="${post.tags.join(',')}">
            <h2 class="related-posts-title">📚 Related Posts</h2>
            <div id="related-posts-grid" class="blog-grid">
                <!-- Related posts will be injected by JS -->
            </div>
        </section>
    </main>

    <footer id="main-footer"></footer>

    <!-- Custom Share Modal -->
    <div id="shareModal" class="share-modal">
        <div class="share-modal-content">
            <span class="share-close">&times;</span>
            <h3>Share this article</h3>
            <div class="share-buttons">
                <button onclick="shareTo('facebook')" class="share-btn fb">📘 Facebook</button>
                <button onclick="shareTo('twitter')" class="share-btn tw">𝕏 Twitter</button>
                <button onclick="shareTo('linkedin')" class="share-btn li">💼 LinkedIn</button>
                <button onclick="shareTo('whatsapp')" class="share-btn wa">💬 WhatsApp</button>
                <button onclick="shareTo('copy')" class="share-btn copy">🔗 Copy Link</button>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Print & Download Functionality
            const printBtn = document.getElementById('print-button');
            if (printBtn) {
                printBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.print();
                });
            }
            
            // Share Modal Functionality
            const shareBtn = document.getElementById('share-button');
            const modal = document.getElementById('shareModal');
            const closeBtn = document.querySelector('.share-close');
            
            if (shareBtn && modal) {
                shareBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    modal.classList.add('show');
                });
                
                closeBtn.addEventListener('click', function() {
                    modal.classList.remove('show');
                });
                
                // Close modal when clicking outside
                window.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });
            }
        });

        // Social Sharing Logic
        function shareTo(platform) {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            let shareUrl = '';
            
            switch(platform) {
                case 'facebook':
                    shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
                    break;
                case 'twitter':
                    shareUrl = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
                    break;
                case 'linkedin':
                    shareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title;
                    break;
                case 'whatsapp':
                    shareUrl = 'https://api.whatsapp.com/send?text=' + title + ' ' + url;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('✅ Link copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                    });
                    return; // Exit early for copy
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=no,resizable=no');
            }
        }
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

    <!-- Google AdSense Code -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9789336661158068" crossorigin="anonymous"></script>
</head>
<body>
    <header id="main-header"></header>

    <main>
        <section class="blog-hero reveal-up">
            <div class="container">
                <h1 class="blog-hero-title">📖 SmartGen Blog</h1>
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
                    <p>✨ Loading amazing stories...</p>
                </div>
            </div>
        </section>
        
        <!-- Premium Newsletter Section -->
        <section class="newsletter-section reveal-up" style="background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); padding: 5rem 2rem; border-radius: 30px; margin: 4rem auto; max-width: 1000px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.03);">
            <h2 style="font-size: 2.5rem; color: #2c3e50; margin-bottom: 1rem; font-weight: 800;">Join the SmartGen Community</h2>
            <p style="color: #666; font-size: 1.1rem; max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.6;">Get our latest tech updates, open-source guidelines, and tool reviews delivered straight to your inbox every week.</p>
            
            <form class="newsletter-form" action="#" style="display: flex; gap: 10px; max-width: 500px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
                <input type="email" name="email" placeholder="Enter your email address" required style="flex: 1; min-width: 250px; padding: 15px 25px; border-radius: 50px; border: 1px solid #ddd; font-size: 1rem; outline: none; transition: border-color 0.3s ease;">
                <input type="text" name="company_website" class="newsletter-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
                <button type="submit" class="newsletter-submit-btn" style="background: #2563eb; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Subscribe Now</button>
            </form>
            <p class="newsletter-feedback" role="status" aria-live="polite"></p>
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
    console.log('⚠️  sitemap.xml not found at root. Skipping sitemap update.');
    return;
  }

  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  const imageNamespace = 'http://www.google.com/schemas/sitemap-image/1.1';
  const escapeXml = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  if (!sitemapContent.includes('xmlns:image=')) {
    sitemapContent = sitemapContent.replace(
      /<urlset([^>]*)>/,
      `<urlset$1 xmlns:image="${imageNamespace}">`
    );
  }

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
    const imageUrl = post.image && !post.image.endsWith('/assets/images/blog-default.jpg')
      ? (post.image.startsWith('http') ? post.image : `${SITE_URL}/${post.image.replace(/^\//, '')}`)
      : '';
    const imageEntry = imageUrl
      ? `\n    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n    </image:image>`
      : '';
    blogEntries += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}/</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageEntry}
  </url>\n`;
  });

  // Insert before the closing </urlset> tag
  if (sitemapContent.includes('</urlset>')) {
    sitemapContent = sitemapContent.replace('</urlset>', `${blogEntries}</urlset>`);
    // Final cleanup to ensure proper formatting
    sitemapContent = sitemapContent.replace(/<\/url>\s*<url>/g, '</url>\n  <url>');
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`✅ Updated: sitemap.xml with ${posts.length} blog posts\n`);
  } else {
    console.log('⚠️  Could not find </urlset> in sitemap.xml. Sitemap update failed.');
  }
}

/**
 * Main build function
 */
function buildBlog() {
  console.log('🚀 Starting SmartGen Blog Build...\n');

  // Read all blog posts
  const posts = readBlogPosts();
  console.log(`✅ Found ${posts.length} blog post(s)\n`);

  if (posts.length === 0) {
    console.log('⚠️  No blog posts found. Create .md files in blog-posts/ directory.');
    console.log('📝 Example: blog-posts/my-first-post.md\n');
  }

  // Generate individual post pages
  posts.forEach(post => {
    const postDir = path.join(BLOG_OUTPUT_DIR, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    let postHTML = generatePostHTML(post);
    
    // Apply Adsterra ad injections with CLS prevention
    postHTML = BuildTimeAdInjector.injectAllAds(postHTML);
    
    fs.writeFileSync(path.join(postDir, 'index.html'), postHTML);
    console.log(`✅ Generated: /blog/${post.slug}/index.html (with Adsterra ads)`);
  });

  // Generate blog archive page
  const archiveHTML = generateArchiveHTML();
  fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, 'index.html'), archiveHTML);
  console.log(`✅ Generated: /blog/index.html\n`);

  // Generate blog.json
  const blogJSON = generateBlogJSON(posts);
  fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, 'blog.json'), blogJSON);
  console.log(`✅ Generated: /blog/blog.json\n`);

  // Update sitemap.xml
  updateSitemap(posts);

  console.log('🎉 Blog build completed successfully!');
  console.log(`📊 Total posts: ${posts.length}`);
  console.log('🎯 Adsterra ads injected with 100% CLS prevention');
  console.log(`🌐 Blog URL: ${SITE_URL}/blog/\n`);
}

// Run the build
buildBlog();
