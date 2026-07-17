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

    const fadeElements = document.querySelectorAll('.category-card, .trust-item, .section-header, .blog-post-card');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });
}

/**
 * Load and render latest 20 blog posts with share buttons
 */
function loadBlogFeed() {
    // Target the correct feed container ID
    const feedContainer = document.getElementById('blog-feed') || document.getElementById('blog-feed-placeholder');
    if (!feedContainer) return;

    // Sample blog posts data (in production, fetch from API)
    const blogPosts = [
        {
            id: 1,
            title: "The 2026 Programmatic SEO Blueprint",
            excerpt: "Master automated sitemaps and real-time updates for scalable growth. Learn how to implement dynamic sitemap generation that adapts to your content in real-time.",
            category: "SEO & Strategy",
            date: "2 days ago",
            author: "SmartGen Academy",
            verified: true,
            link: "/blog/"
        },
        {
            id: 2,
            title: "Python Data Structures Explained",
            excerpt: "From lists to dictionaries, learn when to use which structure for maximum efficiency. A comprehensive guide covering performance implications and best practices.",
            category: "Development",
            date: "5 days ago",
            author: "Developer Hub",
            verified: true,
            link: "/blog/"
        },
        {
            id: 3,
            title: "Mastering UTM Campaign Tracking",
            excerpt: "Track every click and conversion with precision using our free builder. Understand UTM parameters and how to structure them for maximum analytics clarity.",
            category: "Marketing",
            date: "1 week ago",
            author: "Marketing Insights",
            verified: true,
            link: "/blog/"
        },
        {
            id: 4,
            title: "Building Scalable Web Applications",
            excerpt: "Discover best practices for creating web applications that scale with your user base. Learn about architecture patterns, caching strategies, and performance optimization.",
            category: "Development",
            date: "2 weeks ago",
            author: "Tools & Utilities",
            verified: true,
            link: "/blog/"
        },
        {
            id: 5,
            title: "Advanced Image Compression Techniques",
            excerpt: "Reduce file sizes without losing quality. Explore modern compression algorithms and when to use each one for optimal web performance.",
            category: "Design & Tools",
            date: "3 weeks ago",
            author: "SmartGen Academy",
            verified: true,
            link: "/blog/"
        },
        {
            id: 6,
            title: "Privacy-First Web Development",
            excerpt: "Build applications that respect user privacy from the ground up. Learn about client-side processing, data minimization, and secure practices.",
            category: "Security",
            date: "1 month ago",
            author: "Security Team",
            verified: true,
            link: "/blog/"
        },
        {
            id: 7,
            title: "JSON Formatting Best Practices",
            excerpt: "Structure your data correctly for better API integration and debugging. Learn validation techniques and common pitfalls to avoid.",
            category: "Development",
            date: "1 month ago",
            author: "Developer Hub",
            verified: true,
            link: "/blog/"
        },
        {
            id: 8,
            title: "QR Code Generation for Marketing",
            excerpt: "Leverage QR codes to bridge digital and physical marketing. Track engagement and create dynamic campaigns with our free generator.",
            category: "Marketing",
            date: "1 month ago",
            author: "Marketing Insights",
            verified: true,
            link: "/blog/"
        },
        {
            id: 9,
            title: "SEO Meta Tags That Actually Work",
            excerpt: "Optimize your meta tags for search engines and social sharing. Learn what Google really cares about in 2026.",
            category: "SEO & Strategy",
            date: "2 months ago",
            author: "SmartGen Academy",
            verified: true,
            link: "/blog/"
        },
        {
            id: 10,
            title: "Voice Removal AI: Technology Explained",
            excerpt: "Understand how AI-powered voice removal works. Explore use cases from music production to content creation.",
            category: "AI & Tools",
            date: "2 months ago",
            author: "Tech Insights",
            verified: true,
            link: "/blog/"
        },
        {
            id: 11,
            title: "Color Psychology in Web Design",
            excerpt: "Choose the right colors for your brand. Learn how color impacts user behavior and conversion rates.",
            category: "Design & Tools",
            date: "2 months ago",
            author: "Design Team",
            verified: true,
            link: "/blog/"
        },
        {
            id: 12,
            title: "Password Security: Best Practices",
            excerpt: "Create and manage secure passwords. Learn about password managers and multi-factor authentication.",
            category: "Security",
            date: "3 months ago",
            author: "Security Team",
            verified: true,
            link: "/blog/"
        },
        {
            id: 13,
            title: "Unit Conversion Guide for Developers",
            excerpt: "Master common unit conversions used in web development. From pixels to ems, understand responsive design units.",
            category: "Development",
            date: "3 months ago",
            author: "Developer Hub",
            verified: true,
            link: "/blog/"
        },
        {
            id: 14,
            title: "WhatsApp Marketing Automation",
            excerpt: "Leverage WhatsApp for customer engagement. Learn how to create shareable links and track campaign performance.",
            category: "Marketing",
            date: "3 months ago",
            author: "Marketing Insights",
            verified: true,
            link: "/blog/"
        },
        {
            id: 15,
            title: "Base64 Encoding Explained",
            excerpt: "Understand binary-to-text encoding. Learn when and why to use Base64 in your applications.",
            category: "Development",
            date: "3 months ago",
            author: "Developer Hub",
            verified: true,
            link: "/blog/"
        },
        {
            id: 16,
            title: "CSS Gradient Design Trends 2026",
            excerpt: "Create stunning visual effects with CSS gradients. Explore modern design trends and implementation techniques.",
            category: "Design & Tools",
            date: "4 months ago",
            author: "Design Team",
            verified: true,
            link: "/blog/"
        },
        {
            id: 17,
            title: "Robots.txt Optimization Guide",
            excerpt: "Control search engine crawling with robots.txt. Learn best practices for SEO-friendly site structure.",
            category: "SEO & Strategy",
            date: "4 months ago",
            author: "SmartGen Academy",
            verified: true,
            link: "/blog/"
        },
        {
            id: 18,
            title: "Pomodoro Technique for Productivity",
            excerpt: "Boost your productivity with time management. Learn how the Pomodoro technique can transform your workflow.",
            category: "Productivity",
            date: "4 months ago",
            author: "Productivity Tips",
            verified: true,
            link: "/blog/"
        },
        {
            id: 19,
            title: "EMI Calculator for Financial Planning",
            excerpt: "Understand loan calculations and EMI. Learn how to plan your finances with our free calculator.",
            category: "Finance",
            date: "5 months ago",
            author: "Finance Hub",
            verified: true,
            link: "/blog/"
        },
        {
            id: 20,
            title: "Keyword Density: The Complete Guide",
            excerpt: "Balance keyword usage for SEO success. Learn optimal density rates and how to avoid over-optimization.",
            category: "SEO & Strategy",
            date: "5 months ago",
            author: "SmartGen Academy",
            verified: true,
            link: "/blog/"
        }
    ];

    // Simulate loading delay for better UX
    setTimeout(() => {
        let postsHTML = '<div class="blog-posts-grid">';
        
        blogPosts.forEach((post, index) => {
            const categoryColor = getCategoryColor(post.category);
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
                            <a href="${post.link}" class="blog-action-btn" title="Read Full Article">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Read
                            </a>
                            <button class="blog-action-btn share-btn" title="Share Article" onclick="sharePost('${post.title}', '${post.link}')">
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
 * Share post functionality
 */
function sharePost(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        const shareUrl = `${window.location.origin}${url}`;
        navigator.clipboard.writeText(`${title}\n${shareUrl}`).then(() => {
            alert('Post link copied to clipboard!');
        });
    }
}

/**
 * Add CSS animation keyframes dynamically if not already present
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
