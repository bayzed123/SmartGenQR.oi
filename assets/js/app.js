/**
 * THE single place the SmartGen backend URL is configured.
 *
 * The SEO Audit Tool and the AI assistant both read this. Change it here and
 * both follow. An individual page can still override it with
 * <meta name="smartgen-api" content="https://…">.
 *
 * This must match the Worker's deployed URL, which `wrangler deploy` prints:
 *   https://<worker-name>.<your-workers.dev-subdomain>.workers.dev
 */
window.SMARTGEN_API_BASE =
    window.SMARTGEN_API_BASE || 'https://smartgen-platforms.sayadmdbayezidhosan.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
    initTheme();
    initAccordion();
    loadChatbot();
});

/**
 * Bring the SmartGen assistant to every page, without paying for it on load.
 *
 * The widget and its stylesheet are fetched only once the browser is idle (or
 * on the first real interaction), so Core Web Vitals stay untouched on pages
 * where nobody opens the chat. Pages that already include chatbot.js directly
 * are skipped.
 */
function loadChatbot() {
    if (document.querySelector('script[src*="chatbot.js"]')) return;
    if (document.getElementById('smartgen-chatbot')) return;

    const root = document.querySelector('script[src*="assets/js/app.js"]');
    const base = root ? root.getAttribute('src').replace(/app\.js.*$/, '') : '/assets/js/';

    let started = false;
    const start = () => {
        if (started) return;
        started = true;

        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = `${base}../css/chatbot.css`;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = `${base}chatbot.js`;
        script.defer = true;
        document.body.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(start, { timeout: 4000 });
    } else {
        setTimeout(start, 2500);
    }
    ['pointerdown', 'keydown'].forEach((event) =>
        document.addEventListener(event, start, { once: true, passive: true })
    );
}

function injectNavbar() {
    const header = document.getElementById('main-header');
    if (!header) return;

    // Absolute paths (/) are used to prevent routing errors like 'blog/blog/'
    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo" aria-label="SmartGen Home" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
                    <img src="/assets/img/logo-icon.svg" width="44" height="40" alt="" style="display: block; height: 40px; width: auto;" loading="eager" decoding="async">
                    <span style="font-family: Inter, sans-serif; font-weight: 800; font-size: 24px; line-height: 1; color: var(--navy, #0f172a);">Smart<span style="color:#ff8800;">Gen</span></span>
                </a>
                <div class="header-actions">
                    <button id="theme-toggle" class="icon-btn" title="Toggle Theme">🌓</button>
                    <button id="mobile-menu-toggle" class="icon-btn mobile-only" title="Toggle Menu">☰</button>
                </div>
                <nav id="nav-links">
                    <a href="/">Home</a>
                    <a href="/blog/">Blog</a>
                    <a href="/tools/">All Tools</a>
                    <a href="/paid-tools/">Paid Tools</a>
                    <a href="/html-code-library/">HTML Library</a>
                    <a href="/docs/">Docs</a>
                    <a href="/smartgen-legal-info/">Legal Info</a>
                    <a href="/about/">About Us</a>
                    <a href="/contact/">Contact Us</a>
                </nav>
            </div>
        </div>

        <aside id="mobile-sidebar" class="mobile-sidebar">
            <div class="sidebar-header">
                <a href="/" class="sidebar-logo" aria-label="SmartGen Home" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
                    <img src="/assets/img/logo-icon.svg" width="44" height="40" alt="" style="display: block; height: 40px; width: auto;" loading="eager" decoding="async">
                    <span style="font-family: Inter, sans-serif; font-weight: 800; font-size: 24px; line-height: 1; color: var(--navy, #0f172a);">Smart<span style="color:#ff8800;">Gen</span></span>
                </a>
                <button id="sidebar-close" class="sidebar-close-btn" title="Close Menu">✕</button>
            </div>

            <div class="sidebar-nav-links" style="display: flex; flex-direction: column; padding: 20px; overflow-y: auto;">
                <a href="/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">🏠 Home</a>
                <a href="/blog/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">📝 Blog</a>
                <a href="/tools/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">🛠️ All Tools</a>
                <a href="/paid-tools/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">💎 Paid Tools</a>
                <a href="/html-code-library/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">💻 HTML Code Library</a>
                <a href="/docs/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">📑 Developer Docs</a>
                <a href="/smartgen-legal-info/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; font-weight: 600; font-size: 1rem;">⚖️ Legal Info</a>
                
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid var(--border-color, #e5e7eb);">
                <a href="/about/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; display: block; font-weight: 500;">📄 About Us</a>
                <a href="/contact/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; display: block; font-weight: 500;">📩 Contact Us</a>
                <a href="/privacy/" class="nav-item" style="color: var(--text-primary); padding: 10px 0; text-decoration: none; display: block; font-weight: 500;">🔒 Privacy Policy</a>
            </div>
        </aside>

        <div id="sidebar-overlay" class="sidebar-overlay"></div>
    `;

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('mobile-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Toggle sidebar
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close sidebar
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking a link
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeSidebar();
        });
    });
}

function injectFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    footer.innerHTML = `
        <!-- Top Info Bar -->
        <div class="footer-top-bar">
            <div class="container footer-top-grid">
                <!-- Location -->
                <div class="footer-info-item">
                    <div class="footer-info-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div class="footer-info-text">
                        <h4>Find us</h4>
                        <a href="https://maps.app.goo.gl/4HJUjquV4dRVoXvm6?g_st=ic" target="_blank">Auliabad, Kalihati, Tangail, Bangladesh</a>
                    </div>
                </div>
                <!-- Phone -->
                <div class="footer-info-item">
                    <div class="footer-info-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div class="footer-info-text">
                        <h4>Call us</h4>
                        <p>01519601517<br>+880 1518-740295</p>
                    </div>
                </div>
                <!-- Email -->
                <div class="footer-info-item">
                    <div class="footer-info-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div class="footer-info-text">
                        <h4>Mail us</h4>
                        <a href="mailto:cwb.agency@outlook.com">cwb.agency@outlook.com</a><br>
                        <a href="mailto:support@sayadbayezid.com">support@sayadbayezid.com</a><br>
                         <a href="mailto:info@sayadbayezid.com">info@sayadbayezid.com</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Footer Links -->
        <div class="container footer-main">
            <!-- Brand Column -->
            <div class="footer-col footer-brand">
                <a href="/" aria-label="SmartGen Home" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 12px;">
                    <img src="/assets/img/logo-icon.svg" width="49" height="44" alt="" style="display: block; height: 44px; width: auto;" loading="lazy" decoding="async">
                    <span style="font-family: Inter, sans-serif; font-weight: 800; font-size: 26px; line-height: 1; color: #ffffff;">Smart<span style="color:#ff8800;">Gen</span></span>
                </a>
                <p>An advanced digital utility platform bringing 131+ SEO tools, web generators, and dev docs. Operated by Connect with Bayezid.</p>
                <div class="footer-socials">
                    <a href="https://www.facebook.com/smartgenutility" class="footer-social-btn" target="_blank" aria-label="Facebook">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="https://x.com/sayadbayezid?s=11" class="footer-social-btn" target="_blank" aria-label="X (Twitter)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                    </a>
                    <a href="https://www.linkedin.com/in/sayadbayezid" class="footer-social-btn" target="_blank" aria-label="LinkedIn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="https://github.com/Sayadbayezid" class="footer-social-btn" target="_blank" aria-label="Github">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </a>
                    <a href="https://youtube.com/@connectwithbayezid" class="footer-social-btn" target="_blank" aria-label="Youtube">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.13 1 12 1 12s0 3.87.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.87 23 12 23 12s0-3.87-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                    </a>
                </div>
            </div>

            <!-- Useful Links / Products -->
            <div class="footer-col">
                <h3>Our Tools</h3>
                <ul>
                    <li><a href="https://smartgentools.com/tools/">Free Tools</a></li>
                    <li><a href="https://smartgentools.com/paid-tools/">Paid Tools</a></li>
                    <li><a href="https://smartgentools.com/html-code-library/">HTML Code Library (80+)</a></li>
                    <li><a href="https://smartleadgen-frontend.sayadmdbayezidhosan.workers.dev" target="_blank">Pro Lead Collector</a></li>
                    <li><a href="https://connectwithbayezid.it.com" target="_blank">Automation Chatbots</a></li>
                    <li><a href="https://www.genzfrontir.com" target="_blank">GenZ Frontier</a></li>
                </ul>
            </div>

            <!-- Legal & Resouces -->
            <div class="footer-col">
                <h3>Resources</h3>
                <ul>
                    <li><a href="https://smartgentools.com/smartgen-legal-info/">Trust Centre</a></li>
                    <li><a href="https://smartgentools.com/privacy/">Privacy Policy</a></li>
                    <li><a href="https://sayadbayezid.com/privacy-policy-meta-product.html">Meta Privacy</a></li>
                    <li><a href="https://docs.smartgentools.com">Open Source Docs</a></li>
                    <li><a href="https://smartgentools.com/blog/">Education Blog</a></li>
                    <li><a href="https://smartgentools.com/help-center/">Help Center</a></li>
                    <li><a href="https://smartgentools.com/docs/">Developerdocs</a></li>
                </ul>
            </div>

            <!-- Connect & Review -->
            <div class="footer-col">
                <h3>Connect & Review</h3>
                <ul class="dev-profiles-grid">
                    <li><a href="https://sayadbayezid.com/" target="_blank">Meet Developer</a></li>
                    <li><a href="https://pypi.org/user/Sayadbayezid/" target="_blank">PyPi Profile</a></li>
                    <li><a href="https://g.dev/SayadBayezid" target="_blank">Google Dev</a></li>
                    <li><a href="https://orcid.org/0009-0003-6568-6648" target="_blank">ORCID</a></li>
                    <li><a href="https://stackoverflow.com/users/32930880/sayad-md-bayezid-hosan" target="_blank">StackOverflow</a></li>
                    <li><a href="https://gitlab.com/Sayadbayezid" target="_blank">GitLab</a></li>
                    <li><a href="https://linktr.ee/sayadbayezid" target="_blank">Linktr.ee (All)</a></li>
                </ul>
                <div class="footer-review-box">
                    <p>Love using SmartGen? Share your experience with us!</p>
                    <a href="https://smartgentools.com/review/" class="btn-review">Leave a Review</a>
                </div>
            </div>
        </div>

        <!-- Bottom Copyright Bar -->
        <div class="footer-bottom-bar">
            <div class="container footer-bottom-flex">
                <p>Copyright © 2026 SmartGen. Developed by <span>Sayad Md Bayezid Hosan</span>.</p>
                <div class="footer-bottom-links">
                    <a href="https://smartgentools.com">Home</a>
                    <a href="https://smartgentools.com/about/">About Us</a>
                    <a href="https://smartgentools.com/contact/">Contact Us</a>
                     <a href="https://smartgentools.com/sitemap.xml">Sitemap</a>
                </div>
            </div>
        </div>
    `;

    // Add footer accordion logic for mobile
    initFooterAccordion();
}

function initFooterAccordion() {
    const triggers = document.querySelectorAll('.footer-accordion-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                const column = trigger.parentElement;
                const isActive = column.classList.contains('active');
                
                // Close all other footer accordion items
                document.querySelectorAll('.footer-column').forEach(otherCol => {
                    if (otherCol !== column) {
                        otherCol.classList.remove('active');
                    }
                });
                
                // Toggle current item
                column.classList.toggle('active');
            }
        });
    });
}

function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other accordion items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}