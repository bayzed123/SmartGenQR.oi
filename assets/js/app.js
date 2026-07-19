/**
 * SmartGen Shared Header & Footer Logic
 * This script injects the shared header and footer across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
});

/**
 * Injects the navigation header into the #main-header element.
 */
function injectHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <svg class="logo-icon" width="32" height="32" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                        <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                    </svg>
                    SmartGen
                </a>
                <nav id="nav-links">
                    <a href="/">Home</a>
                    <a href="/tools/">Tool Directory</a>
                    <a href="/html-code-library/">HTML Code Library</a>
                    <div class="dropdown">
                        <button class="dropdown-btn">📚 Resources <span class="arrow">▾</span></button>
                        <div class="dropdown-content">
                            <a href="/blog/">SmartGen Blog</a>
                            <a href="/docs/">SGDocs</a>
                            <a href="/updates/">Changelog</a>
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="dropdown-btn">Company <span class="arrow">▾</span></button>
                        <div class="dropdown-content">
                            <a href="/about/">About Us</a>
                            <a href="/contact/">Contact Us</a>
                            <a href="/smartgen-legal-info/">Legal Info</a>
                            <a href="/help-center/">Help Center</a>
                        </div>
                    </div>
                    <a href="https://github.com/bayzed123/SmartGenQR.oi" class="github-link" target="_blank">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Star
                    </a>
                </nav>
                <button id="mobile-toggle" class="mobile-toggle-btn" title="Open Menu">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
            </div>
        </div>

        <aside id="mobile-sidebar" class="mobile-sidebar">
            <div class="sidebar-header">
                <a href="/" class="sidebar-logo">
                    <svg class="sidebar-logo-icon" width="28" height="28" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                        <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                    </svg>
                    SmartGen
                </a>
                <button id="sidebar-close" class="sidebar-close-btn" title="Close Menu">✕</button>
            </div>

            <div class="sidebar-nav-links">
                <a href="/" class="sidebar-link">Home</a>
                <a href="/tools/" class="sidebar-link">Tool Directory</a>
                <a href="/html-code-library/" class="sidebar-link">HTML Code Library</a>
                
                <div class="sidebar-section">
                    <span class="sidebar-section-title">📚 Resources</span>
                    <a href="/blog/" class="sidebar-link">SmartGen Blog</a>
                    <a href="/docs/" class="sidebar-link">SGDocs</a>
                    <a href="/updates/" class="sidebar-link">Changelog</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-section-title">Company</span>
                    <a href="/about/" class="sidebar-link">About Us</a>
                    <a href="/contact/" class="sidebar-link">Contact Us</a>
                    <a href="/smartgen-legal-info/" class="sidebar-link">Legal Info</a>
                    <a href="/help-center/" class="sidebar-link">Help Center</a>
                </div>

                <a href="https://github.com/bayzed123/SmartGenQR.oi" class="sidebar-link github-sidebar" target="_blank">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Star on GitHub
                </a>
            </div>
        </aside>
        <div id="sidebar-overlay" class="sidebar-overlay"></div>
    `;

    // Initialize Menu Interactivity
    initMobileMenu();
}

/**
 * Handles mobile menu toggle, close, and overlay clicks.
 */
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const close = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!toggle || !sidebar || !overlay) return;

    const openMenu = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    };

    const closeMenu = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    };

    toggle.addEventListener('click', openMenu);
    if (close) close.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Close on link click
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/**
 * Injects the shared footer into the #main-footer element.
 */
function injectFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    footer.innerHTML = `
        <div class="container">
            <div class="footer-top">
                <div class="footer-brand-section">
                    <div class="footer-logo">
                        <svg class="logo-icon" style="width: 40px; height: 40px;" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                            <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                        </svg>
                        <h3>SmartGen</h3>
                    </div>
                    <p class="footer-description">Fast, secure, and 100% free client-side web utilities for developers, marketers, and everyday users.</p>
                </div>
                <div class="footer-quick-links-grid">
                    <div class="footer-column">
                        <h4>Platform</h4>
                        <a href="/tools/">Tool Directory</a>
                        <a href="/html-code-library/">HTML Code Library</a>
                        <a href="/updates/">Changelog</a>
                    </div>
                    <div class="footer-column">
                        <h4>Resources</h4>
                        <a href="/blog/">SmartGen Blog</a>
                        <a href="/docs/">SGDocs</a>
                        <a href="/help-center/">Help Center</a>
                    </div>
                    <div class="footer-column">
                        <h4>Company</h4>
                        <a href="/about/">About Us</a>
                        <a href="/contact/">Contact Us</a>
                        <a href="/smartgen-legal-info/">Legal Info</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-copyright">
                    © ${new Date().getFullYear()} SmartGen Tools. All rights reserved. Built with ❤️ for the community.
                </div>
                <div class="footer-social">
                    <a href="https://github.com/bayzed123/SmartGenQR.oi" title="GitHub" target="_blank">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                </div>
            </div>
        </div>
    `;
}
