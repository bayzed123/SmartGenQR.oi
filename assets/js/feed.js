/**
 * SmartGen Modern Redesign - Interactivity & Animations
 * This script handles the dynamic parts of the new homepage.
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

    const fadeElements = document.querySelectorAll('.category-card, .trust-item, .section-header, .feed-post');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });
}

/**
 * Load and render blog feed with proper styling
 */
function loadBlogFeed() {
    // Target the correct feed container ID
    const feedContainer = document.getElementById('blog-feed') || document.getElementById('blog-feed-placeholder');
    if (!feedContainer) return;

    // Simulate loading delay for better UX
    setTimeout(() => {
        feedContainer.innerHTML = `
            <div class="feed-container">
                <article class="feed-post">
                    <div class="feed-post-header">
                        <div class="author-avatar">📚</div>
                        <div class="post-meta-info">
                            <div class="post-author-name">SmartGen Academy</div>
                            <div class="post-date">2 days ago</div>
                        </div>
                    </div>
                    <div class="feed-post-content">
                        <h3 class="feed-post-title">The 2026 Programmatic SEO Blueprint</h3>
                        <p class="feed-post-excerpt">Master automated sitemaps and real-time updates for scalable growth. Learn how to implement dynamic sitemap generation that adapts to your content in real-time.</p>
                    </div>
                    <div class="feed-post-footer">
                        <a href="/blog/" class="feed-action-btn">📖 Read Guide</a>
                        <a href="/blog/" class="feed-action-btn">💬 Comments</a>
                        <a href="/blog/" class="feed-action-btn">❤️ Like</a>
                    </div>
                </article>

                <article class="feed-post">
                    <div class="feed-post-header">
                        <div class="author-avatar">🔧</div>
                        <div class="post-meta-info">
                            <div class="post-author-name">Developer Hub</div>
                            <div class="post-date">5 days ago</div>
                        </div>
                    </div>
                    <div class="feed-post-content">
                        <h3 class="feed-post-title">Python Data Structures Explained</h3>
                        <p class="feed-post-excerpt">From lists to dictionaries, learn when to use which structure for maximum efficiency. A comprehensive guide covering performance implications and best practices.</p>
                    </div>
                    <div class="feed-post-footer">
                        <a href="/blog/" class="feed-action-btn">📖 Read Guide</a>
                        <a href="/blog/" class="feed-action-btn">💬 Comments</a>
                        <a href="/blog/" class="feed-action-btn">❤️ Like</a>
                    </div>
                </article>

                <article class="feed-post">
                    <div class="feed-post-header">
                        <div class="author-avatar">📈</div>
                        <div class="post-meta-info">
                            <div class="post-author-name">Marketing Insights</div>
                            <div class="post-date">1 week ago</div>
                        </div>
                    </div>
                    <div class="feed-post-content">
                        <h3 class="feed-post-title">Mastering UTM Campaign Tracking</h3>
                        <p class="feed-post-excerpt">Track every click and conversion with precision using our free builder. Understand UTM parameters and how to structure them for maximum analytics clarity.</p>
                    </div>
                    <div class="feed-post-footer">
                        <a href="/blog/" class="feed-action-btn">📖 Read Guide</a>
                        <a href="/blog/" class="feed-action-btn">💬 Comments</a>
                        <a href="/blog/" class="feed-action-btn">❤️ Like</a>
                    </div>
                </article>

                <article class="feed-post">
                    <div class="feed-post-header">
                        <div class="author-avatar">🛠️</div>
                        <div class="post-meta-info">
                            <div class="post-author-name">Tools & Utilities</div>
                            <div class="post-date">2 weeks ago</div>
                        </div>
                    </div>
                    <div class="feed-post-content">
                        <h3 class="feed-post-title">Building Scalable Web Applications</h3>
                        <p class="feed-post-excerpt">Discover best practices for creating web applications that scale with your user base. Learn about architecture patterns, caching strategies, and performance optimization.</p>
                    </div>
                    <div class="feed-post-footer">
                        <a href="/blog/" class="feed-action-btn">📖 Read Guide</a>
                        <a href="/blog/" class="feed-action-btn">💬 Comments</a>
                        <a href="/blog/" class="feed-action-btn">❤️ Like</a>
                    </div>
                </article>
            </div>
        `;

        // Add fade-in animation to newly loaded posts
        const posts = feedContainer.querySelectorAll('.feed-post');
        posts.forEach((post, index) => {
            post.style.opacity = '0';
            post.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
        });
    }, 500);
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
    `;
    document.head.appendChild(style);
}

// Ensure animation styles are loaded
ensureAnimationStyles();
