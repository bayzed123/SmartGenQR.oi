/**
 * SmartGen Modern Redesign - Blog Feed & Interactivity
 * This script handles the dynamic parts of the homepage including blog feed.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimations();
    initSmoothScroll();
    initIntersectionObserver();
    loadBlogFeed();
});

/**
 * Adds subtle parallax or movement to background SVG elements
 */
function initHeroAnimations() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;

        const svgs = hero.querySelectorAll('.floating-svg');
        svgs.forEach((svg, index) => {
            const factor = (index + 1) * 0.5;
            svg.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)`;
        });
    });

    // Reset on mouse leave
    hero.addEventListener('mouseleave', () => {
        const svgs = hero.querySelectorAll('.floating-svg');
        svgs.forEach(svg => {
            svg.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Reveal elements on scroll with smooth animations
 */
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.category-card, .trust-item, .section-header, .blog-post-card, .stat-card');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });
}

/**
 * Load and render latest 20 blog posts with direct redirection
 */
function loadBlogFeed() {
    const feedContainer = document.getElementById('blog-feed') || document.getElementById('blog-feed-placeholder');
    if (!feedContainer) return;

    // Latest real blog posts from blog.json
    const blogPosts = [
        {
            slug: "dynamic-sitemap-generation-with-real-time-updates-the-complete-programmatic-seo-blueprint",
            title: "Dynamic Sitemap Generation with Real-Time Updates",
            excerpt: "Learn how to build automated XML sitemaps with real-time updates, faster indexing, and advanced optimization strategies.",
            category: "SEO & Strategy",
            date: "2026-07-14",
            author: "Sayad Md Bayezid Hosan",
            verified: true,
            image: "https://i.ibb.co/cKCS74vJ/auto-sitemap-xml-generator.jpg"
        },
        {
            slug: "master-your-marketing-the-ultimate-guide-to-the-utm-campaign-link-builder",
            title: "Master Your Marketing: Ultimate UTM Guide",
            excerpt: "Learn how to use a UTM link builder to track your marketing campaigns in Google Analytics. Generate error-free URLs instantly.",
            category: "Marketing",
            date: "2026-06-01",
            author: "SmartGen Academy",
            verified: true,
            image: "https://i.ibb.co/WqNHgyw/IMG-4319.jpg"
        },
        {
            slug: "python-data-structures-guide",
            title: "Python Data Structures: A Comprehensive Guide",
            excerpt: "Master lists, dictionaries, and tuples. Learn when to use each structure for maximum efficiency in your Python projects.",
            category: "Development",
            date: "2026-07-10",
            author: "Developer Hub",
            verified: true,
            image: "https://i.ibb.co/cKCS74vJ/auto-sitemap-xml-generator.jpg"
        },
        {
            slug: "digital-marketing-course-2026",
            title: "Digital Marketing Masterclass 2026",
            excerpt: "Stay ahead of the curve with our latest digital marketing course. From AI integration to advanced analytics.",
            category: "Marketing",
            date: "2026-07-18",
            author: "Marketing Insights",
            verified: true,
            image: "https://i.ibb.co/WqNHgyw/IMG-4319.jpg"
        }
        // ... In production, this would be dynamically loaded from blog.json
    ];

    // Simulate loading delay for better UX
    setTimeout(() => {
        let postsHTML = '<div class="blog-posts-grid">';
        
        blogPosts.forEach((post, index) => {
            const categoryColor = getCategoryColor(post.category);
            const postUrl = `/blog/${post.slug}/`;
            
            postsHTML += `
                <article class="blog-post-card" style="animation-delay: ${index * 0.05}s;">
                    <div class="blog-post-header">
                        <div class="blog-post-meta">
                            <span class="blog-category" style="background: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}40;">
                                ${post.category}
                            </span>
                            ${post.verified ? '<span class="verified-badge" title="Verified Content">✓ Verified</span>' : ''}
                        </div>
                    </div>
                    <h3 class="blog-post-title">${post.title}</h3>
                    <p class="blog-post-excerpt">${post.excerpt}</p>
                    <div class="blog-post-footer">
                        <div class="blog-post-info">
                            <span class="blog-author">${post.author}</span>
                            <span class="blog-date">${post.date}</span>
                        </div>
                        <div class="blog-post-actions">
                            <a href="${postUrl}" class="blog-action-btn" title="Read Full Article">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Read
                            </a>
                            <button class="blog-action-btn share-btn" title="Share Article" onclick="sharePost('${post.title}', '${postUrl}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="18" cy="5" r="3"></circle>
                                    <circle cx="6" cy="12" r="3"></circle>
                                    <circle cx="18" cy="19" r="3"></circle>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>
                </article>
            `;
        });
        
        postsHTML += '</div>';
        feedContainer.innerHTML = postsHTML;

        // Add fade-in animation to newly loaded posts
        const posts = feedContainer.querySelectorAll('.blog-post-card');
        posts.forEach((post) => {
            post.style.opacity = '0';
            post.style.animation = `fadeInUp 0.6s ease-out forwards`;
        });
    }, 500);
}

/**
 * Get color for category badge
 */
function getCategoryColor(category) {
    const colors = {
        'SEO & Strategy': '#2563eb',
        'Development': '#7c3aed',
        'Marketing': '#ec4899',
        'Design & Tools': '#f97316',
        'Security': '#ef4444',
        'AI & Tools': '#06b6d4',
        'Productivity': '#10b981',
        'Finance': '#f59e0b'
    };
    return colors[category] || '#2563eb';
}

/**
 * Share post functionality with popup feedback
 */
function sharePost(title, url) {
    const shareUrl = `${window.location.origin}${url}`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(`${title}\n${shareUrl}`).then(() => {
            showToast('Link copied to clipboard! 🚀');
        });
    }
}

/**
 * Show a professional toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Add CSS animation keyframes and toast styles
 */
function ensureAnimationStyles() {
    if (document.getElementById('feed-animations')) return;

    const style = document.createElement('style');
    style.id = 'feed-animations';
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .toast-notification {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #0f172a;
            color: white;
            padding: 1rem 2rem;
            border-radius: 99px;
            font-weight: 600;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            opacity: 0;
        }

        .toast-notification.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .blog-posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
        }

        .blog-post-card {
            background: var(--white);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        [data-theme="dark"] .blog-post-card {
            background: #1e293b;
        }

        .blog-post-card:hover {
            border-color: var(--primary);
            transform: translateY(-8px);
            box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.15);
        }

        .blog-post-header {
            margin-bottom: 1.5rem;
        }

        .blog-post-meta {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .blog-category {
            display: inline-block;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .verified-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.8rem;
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
        }

        .blog-post-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-primary);
            line-height: 1.4;
        }

        .blog-post-excerpt {
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 1.5rem;
            flex-grow: 1;
        }

        .blog-post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border);
        }

        .blog-post-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .blog-author {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .blog-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .blog-post-actions {
            display: flex;
            gap: 0.75rem;
        }

        .blog-action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }

        .blog-action-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
        }

        .share-btn {
            background: var(--accent);
        }

        .share-btn:hover {
            background: #e67e00;
        }

        @media (max-width: 768px) {
            .blog-posts-grid {
                grid-template-columns: 1fr;
            }

            .blog-post-footer {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Ensure animation styles are loaded
ensureAnimationStyles();
