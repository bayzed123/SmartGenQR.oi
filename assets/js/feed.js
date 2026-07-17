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
 * Reveal elements on scroll
 */
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1
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

    const fadeElements = document.querySelectorAll('.category-card, .trust-item, .section-header');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });
}

/**
 * Mock blog feed loader (integrates with existing feed.js)
 */
function loadBlogFeed() {
    const placeholder = document.getElementById('blog-feed-placeholder');
    if (!placeholder) return;

    // In a real implementation, this would call the existing feed.js logic
    // or fetch from a JSON file. For now, we'll simulate a clean grid.
    setTimeout(() => {
        placeholder.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; text-align: left;">
                <article class="category-card">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1.5rem;" alt="SEO Guide">
                    <small style="color: var(--primary); font-weight: 600;">SEO & STRATEGY</small>
                    <h4 style="font-size: 1.25rem; margin: 0.5rem 0;">The 2026 Programmatic SEO Blueprint</h4>
                    <p style="font-size: 0.9rem;">Master automated sitemaps and real-time updates for scalable growth.</p>
                    <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Read Guide →</a>
                </article>
                <article class="category-card">
                    <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1.5rem;" alt="Python Tutorial">
                    <small style="color: var(--primary); font-weight: 600;">DEVELOPMENT</small>
                    <h4 style="font-size: 1.25rem; margin: 0.5rem 0;">Python Data Structures Explained</h4>
                    <p style="font-size: 0.9rem;">From lists to dictionaries, learn when to use which structure for maximum efficiency.</p>
                    <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Read Guide →</a>
                </article>
                <article class="category-card">
                    <img src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1.5rem;" alt="Marketing">
                    <small style="color: var(--primary); font-weight: 600;">MARKETING</small>
                    <h4 style="font-size: 1.25rem; margin: 0.5rem 0;">Mastering UTM Campaign Tracking</h4>
                    <p style="font-size: 0.9rem;">Track every click and conversion with precision using our free builder.</p>
                    <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Read Guide →</a>
                </article>
            </div>
        `;
    }, 1000);
}
