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

// GA4 for smartgentools.com. Defined here so there is exactly one place to
// change it, rather than the ~45 pages that used to hard-code it.
//   Measurement ID : G-982HBP86V8   (public; appears in the page source)
//   GA4 property   : properties/538210008  ("SmartGenTools")
// The property id is what the Analytics Data API needs; recorded here so it
// does not have to be rediscovered through the Admin API every time.
const SMARTGEN_GA4_ID = 'G-982HBP86V8';

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
    injectGlobalNavFallback();
    injectFavicon();
    initTheme();
    initAccordion();
    loadChatbot();
    injectCookieConsent();
    initAnalytics();
});

/**
 * Site favicon.
 *
 * The site shipped without one: no page declared a rel="icon", and the only
 * three that tried (/terms/, /cookies/, /disclaimer/) pointed at
 * assets/img/favicon.png, which has never existed. Browsers therefore fell
 * back to requesting /favicon.ico and getting a 404, so every tab showed a
 * blank page icon -- a small but very visible credibility problem on a site
 * being reviewed for ad approval.
 *
 * Declared here rather than edited into ~300 static files, matching how the
 * nav, footer, cookie banner and analytics tag are handled. Pages that
 * already declare their own icon are left alone.
 */
function injectFavicon() {
    if (document.querySelector('link[rel~="icon"]')) return;
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/favicon.svg';
    document.head.appendChild(link);
}

/**
 * Google Analytics 4.
 *
 * Two separate bugs were losing most of this site's traffic data:
 *
 *  1. Only 47 of 388 pages had any analytics tag at all. The homepage,
 *     every blog post and the whole HTML Code Library were invisible.
 *  2. The pages that DID have it only loaded gtag after a `touchstart`,
 *     `scroll`, `mousemove` or `click`. A visitor who landed, read, and
 *     left without interacting was never counted -- which is exactly the
 *     bounce traffic you most need to measure, and on mobile `mousemove`
 *     never fires at all.
 *
 * app.js is already on 301 of 386 real pages, so loading GA here fixes
 * coverage everywhere at once with no extra request. The tag is loaded
 * immediately rather than on interaction: the script is `async`, so it
 * does not block rendering, and undercounting real visits to protect a
 * synthetic Lighthouse number is a bad trade.
 */
function initAnalytics() {
    if (!SMARTGEN_GA4_ID) return;

    // A handful of pages still carry their own inline gtag snippet.
    // Loading a second one would double-count every pageview.
    if (window.__smartgenGaLoaded) return;
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

    // Honour an explicit cookie refusal from injectCookieConsent().
    try {
        if (localStorage.getItem('sg-cookies-declined')) return;
    } catch (e) {
        // localStorage can throw in private mode; fall through and load.
    }

    window.__smartgenGaLoaded = true;

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${SMARTGEN_GA4_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', SMARTGEN_GA4_ID);
}

/**
 * Global navigation for pages that don't have the standard #main-header /
 * #main-footer mount points.
 *
 * Whole sections of this site were built as self-contained pages with their
 * own header markup -- most of the HTML Code Library (150+ pages) and the
 * docs pages. Their navigation only ever linked to their own section index
 * and in-page anchors, so a visitor (or a reviewer) landing on any of them
 * had no route to Home, Blog, About, Contact, or the policy pages. That's a
 * real dead end, and "readers can't find your pages" is exactly the kind of
 * navigation problem an ad-network site review flags.
 *
 * Rather than rewrite every one of those pages' bespoke layouts, this adds a
 * slim global bar above whatever header they already have, plus a matching
 * link strip at the very bottom. Pages that DO have #main-header are
 * untouched -- they already get the full navbar from injectNavbar().
 */
function injectGlobalNavFallback() {
    if (document.getElementById('main-header')) return;      // real navbar already present
    if (document.getElementById('global-nav-fallback')) return; // never double-inject

    // A page that already links out to the wider site in its own chrome
    // doesn't need this (e.g. /tools/, /qr-generator/ ship a full nav).
    const SECTIONS = [
        ['/', 'Home'],
        ['/tools/', 'All Tools'],
        ['/html-code-library/', 'HTML Library'],
        ['/blog/', 'Blog'],
        ['/docs/', 'Docs'],
        ['/paid-tools/', 'Paid Tools'],
        ['/about/', 'About'],
        ['/contact/', 'Contact'],
    ];

    const style = document.createElement('style');
    style.textContent = `
        #global-nav-fallback {
            background: #0f172a; color: #e2e8f0; font-family: Inter, -apple-system, sans-serif;
            border-bottom: 1px solid rgba(255,255,255,.12); position: relative; z-index: 9000;
        }
        #global-nav-fallback .gnf-inner {
            max-width: 1200px; margin: 0 auto; padding: 8px 16px;
            display: flex; align-items: center; gap: 18px;
            overflow-x: auto; scrollbar-width: none;
        }
        #global-nav-fallback .gnf-inner::-webkit-scrollbar { display: none; }
        #global-nav-fallback .gnf-brand {
            font-weight: 800; font-size: 15px; text-decoration: none; color: #fff;
            white-space: nowrap; flex: 0 0 auto;
        }
        #global-nav-fallback .gnf-brand span { color: #ff8800; }
        #global-nav-fallback a.gnf-link {
            color: #cbd5e1; text-decoration: none; font-size: 13.5px; font-weight: 500;
            white-space: nowrap; flex: 0 0 auto; padding: 2px 0;
        }
        #global-nav-fallback a.gnf-link:hover { color: #fff; text-decoration: underline; }
        #global-footer-fallback {
            background: #0f172a; color: #94a3b8; font-family: Inter, -apple-system, sans-serif;
            padding: 28px 16px; text-align: center; font-size: 13px;
            border-top: 1px solid rgba(255,255,255,.12);
        }
        #global-footer-fallback nav {
            display: flex; flex-wrap: wrap; gap: 10px 20px;
            justify-content: center; margin-bottom: 14px;
        }
        #global-footer-fallback a { color: #cbd5e1; text-decoration: none; }
        #global-footer-fallback a:hover { color: #fff; text-decoration: underline; }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'global-nav-fallback';
    bar.innerHTML =
        '<div class="gnf-inner">' +
        '<a class="gnf-brand" href="/">Smart<span>Gen</span></a>' +
        SECTIONS.map(([href, label]) => `<a class="gnf-link" href="${href}">${label}</a>`).join('') +
        '</div>';
    document.body.insertBefore(bar, document.body.firstChild);

    const foot = document.createElement('div');
    foot.id = 'global-footer-fallback';
    foot.innerHTML =
        '<nav aria-label="Site links">' +
        SECTIONS.concat([
            ['/privacy/', 'Privacy Policy'],
            ['/terms/', 'Terms'],
            ['/cookies/', 'Cookie Policy'],
            ['/disclaimer/', 'Disclaimer'],
        ]).map(([href, label]) => `<a href="${href}">${label}</a>`).join('') +
        '</nav>' +
        `<div>&copy; ${new Date().getFullYear()} SmartGen — free, privacy-first web tools.</div>`;
    document.body.appendChild(foot);
}

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
                    <span style="font-family: Inter, sans-serif; font-weight: 800; font-size: 24px; line-height: 1; color: var(--navy, #0f172a);">Smart<span class="sg-wordmark-accent">Gen</span></span>
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
                    <span style="font-family: Inter, sans-serif; font-weight: 800; font-size: 24px; line-height: 1; color: var(--navy, #0f172a);">S<span class="sg-wordmark-accent">Gen</span>pan></span>
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

/**
 * Sitewide cookie consent banner.
 *
 * A handful of pages (tools/index.html and friends) already carry their own
 * hand-written copy of this banner from before app.js existed on every page.
 * This function is a no-op wherever that's already present, so it never
 * shows a second banner -- it only fills the gap on pages that had none at
 * all (the homepage, every blog post, docs pages that load app.js, etc.).
 * Both this version and the legacy embedded ones read/write the same
 * `sg-cookies-accepted` localStorage key, so accepting once anywhere on the
 * site is remembered everywhere.
 */
function injectCookieConsent() {
    if (document.getElementById('cookie-consent-banner')) return;
    if (localStorage.getItem('sg-cookies-accepted') || localStorage.getItem('sg-cookies-declined')) return;

    const style = document.createElement('style');
    style.id = 'cookie-consent-styles';
    style.textContent = `
        #cookie-consent-banner {
            box-sizing: border-box;
            position: fixed; left: 50%; bottom: 1.25rem; transform: translate(-50%, 140%);
            width: min(680px, calc(100% - 2rem)); z-index: 10000;
            background: var(--card-bg, #12141a); color: var(--text-primary, #e8eaf0);
            border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
            padding: 1.5rem; display: flex; gap: 1.25rem; align-items: flex-start;
            font-family: inherit; opacity: 0;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
        }
        #cookie-consent-banner *, #cookie-consent-banner *::before, #cookie-consent-banner *::after { box-sizing: border-box; }
        #cookie-consent-banner.is-visible { transform: translate(-50%, 0); opacity: 1; }
        #cookie-consent-banner .cc-icon { font-size: 1.9rem; line-height: 1; flex-shrink: 0; }
        #cookie-consent-banner .cc-body { flex: 1; min-width: 0; }
        #cookie-consent-banner h3 { margin: 0 0 0.4rem; font-size: 1.05rem; font-weight: 700; }
        #cookie-consent-banner p { margin: 0; font-size: 0.88rem; line-height: 1.55; opacity: 0.8; }
        #cookie-consent-banner a { color: #2563eb; font-weight: 600; text-decoration: none; }
        #cookie-consent-banner a:hover { text-decoration: underline; }
        #cookie-consent-banner .cc-actions { display: flex; gap: 0.6rem; margin-top: 1rem; flex-wrap: wrap; }
        #cookie-consent-banner button {
            border-radius: 50px; padding: 0.6rem 1.4rem; font-size: 0.85rem; font-weight: 700;
            cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; border: none;
        }
        #cookie-consent-banner button:hover { transform: translateY(-2px); }
        #cookie-consent-banner #cc-accept {
            background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
        }
        #cookie-consent-banner #cc-decline {
            background: transparent; color: var(--text-secondary, #9aa0b2);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        @media (max-width: 560px) {
            #cookie-consent-banner { flex-direction: column; padding: 1.25rem; bottom: 0; border-radius: 18px 18px 0 0; width: 100%; left: 0; transform: translateY(140%); }
            #cookie-consent-banner.is-visible { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
        <span class="cc-icon" aria-hidden="true">🍪</span>
        <div class="cc-body">
            <h3>We value your privacy</h3>
            <p>
                We use cookies to keep the site running smoothly, understand how it's used, and — with
                your consent — show relevant ads. Read our <a href="/privacy/">Privacy Policy</a> to learn more.
            </p>
            <div class="cc-actions">
                <button type="button" id="cc-accept">Accept All</button>
                <button type="button" id="cc-decline">Decline</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);

    requestAnimationFrame(() => banner.classList.add('is-visible'));

    const dismiss = (key) => {
        localStorage.setItem(key, '1');
        banner.classList.remove('is-visible');
        setTimeout(() => banner.remove(), 500);
    };
    document.getElementById('cc-accept').addEventListener('click', () => dismiss('sg-cookies-accepted'));
    document.getElementById('cc-decline').addEventListener('click', () => dismiss('sg-cookies-declined'));
}