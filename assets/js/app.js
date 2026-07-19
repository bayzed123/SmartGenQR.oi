/**
 * SmartGen Shared Header & Footer Logic - PREMIUM VERSION
 * This script injects the shared header and footer across all pages.
 * Header: Premium Ahrefs-style Navigation
 * Footer: Detailed Multi-Column SEO Footer
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initDropdowns();
});

/**
 * Injects the premium navigation header.
 */
function injectHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <div class="logo-icon-wrapper">
                        <svg class="logo-icon" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                            <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                        </svg>
                    </div>
                    <span class="logo-text">SmartGen</span>
                </a>

                <nav id="nav-links" class="nav-links">
                    <a href="/" class="nav-link">Home</a>
                    
                    <div class="dropdown">
                        <button class="dropdown-btn">
                            <span class="emoji-animate">🛠️</span> Products <span class="arrow">▾</span>
                        </button>
                        <div class="dropdown-content">
                            <a href="/tools/" class="dropdown-item">
                                <strong>Explore All Tools</strong>
                                <span>131+ Professional Utilities</span>
                            </a>
                            <a href="/html-code-library/" class="dropdown-item">
                                <strong>HTML Code Library</strong>
                                <span>Visual to Code Components</span>
                            </a>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button class="dropdown-btn">
                            <span class="emoji-animate">📖</span> Resources <span class="arrow">▾</span>
                        </button>
                        <div class="dropdown-content">
                            <a href="/blog/" class="dropdown-item">
                                <strong>SmartGen Academy</strong>
                                <span>Expert SEO & Dev Guides</span>
                            </a>
                            <a href="/docs/" class="dropdown-item">
                                <strong>Documentation</strong>
                                <span>API & Script References</span>
                            </a>
                            <a href="/updates/" class="dropdown-item">
                                <strong>Daily Changelog</strong>
                                <span>Latest Improvements</span>
                            </a>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button class="dropdown-btn">
                            <span class="emoji-animate">🏢</span> Company <span class="arrow">▾</span>
                        </button>
                        <div class="dropdown-content">
                            <a href="/trust-center/" class="dropdown-item">
                                <strong>Trust Centre</strong>
                                <span>Privacy & Security Info</span>
                            </a>
                            <a href="/smartgen-legal-info/" class="dropdown-item">
                                <strong>Legal Info</strong>
                                <span>Terms & Compliance</span>
                            </a>
                            <a href="/help-center/" class="dropdown-item">
                                <strong>Help Centre</strong>
                                <span>Support & FAQs</span>
                            </a>
                            <a href="/about/" class="dropdown-item">
                                <strong>About Us</strong>
                                <span>Our Mission & Vision</span>
                            </a>
                            <a href="/contact/" class="dropdown-item">
                                <strong>Contact Us</strong>
                                <span>Get in Touch</span>
                            </a>
                        </div>
                    </div>

                    <a href="https://github.com/bayzed123/SmartGenQR.oi" class="btn-github" target="_blank" rel="noopener noreferrer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>Star</span>
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
                    <span>SmartGen</span>
                </a>
                <button id="sidebar-close" class="sidebar-close-btn" title="Close Menu">✕</button>
            </div>

            <div class="sidebar-nav-links">
                <a href="/" class="sidebar-link">Home</a>
                
                <div class="sidebar-section">
                    <span class="sidebar-section-title">Products</span>
                    <a href="/tools/" class="sidebar-link">Explore All Tools</a>
                    <a href="/html-code-library/" class="sidebar-link">HTML Code Library</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-section-title">Resources</span>
                    <a href="/blog/" class="sidebar-link">SmartGen Academy</a>
                    <a href="/docs/" class="sidebar-link">Documentation</a>
                    <a href="/updates/" class="sidebar-link">Daily Changelog</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-section-title">Company</span>
                    <a href="/trust-center/" class="sidebar-link">Trust Centre</a>
                    <a href="/smartgen-legal-info/" class="sidebar-link">Legal Info</a>
                    <a href="/help-center/" class="sidebar-link">Help Centre</a>
                    <a href="/about/" class="sidebar-link">About Us</a>
                    <a href="/contact/" class="sidebar-link">Contact Us</a>
                </div>

                <a href="https://github.com/bayzed123/SmartGenQR.oi" class="sidebar-link github-sidebar" target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>Star on GitHub</span>
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
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', openMenu);
    if (close) close.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/**
 * Initialize dropdown menus for desktop navigation
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (!btn || !content) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = content.style.display === 'block';
            
            // Close all dropdowns
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.style.display = 'none';
            });
            
            // Open clicked dropdown
            if (!isActive) {
                content.style.display = 'block';
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(d => {
                d.style.display = 'none';
            });
        }
    });
}

/**
 * Injects the premium shared footer.
 */
function injectFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <svg class="logo-icon" width="40" height="40" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                            <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                        </svg>
                        <span class="logo-text">SmartGen</span>
                    </div>
                    <p class="footer-tagline">Fast, secure, and 100% free client-side web utilities. Everything runs locally in your browser with zero data tracking.</p>
                    <div class="footer-social-links">
                        <a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                    </div>
                </div>
                <div class="footer-links-column">
                    <h4>Developer Tools</h4>
                    <a href="/qr-generator/">QR Code Generator</a>
                    <a href="/json-formatter-validator/">JSON Formatter</a>
                    <a href="/uuid-generator/">UUID Generator</a>
                    <a href="/html-code-preview/">HTML Previewer</a>
                    <a href="/image-to-base64/">Image to Base64</a>
                    <a href="/base64-to-image/">Base64 to Image</a>
                </div>
                <div class="footer-links-column">
                    <h4>SEO & Marketing</h4>
                    <a href="/utm-builder/">UTM Link Builder</a>
                    <a href="/meta-tag-generator/">Meta Tag Generator</a>
                    <a href="/serp-preview-tool/">SERP Preview Tool</a>
                    <a href="/blog-title-generator/">Blog Title Generator</a>
                    <a href="/robots-txt-generator/">Robots.txt Generator</a>
                    <a href="/schema-generator/">Schema Generator</a>
                </div>
                <div class="footer-links-column">
                    <h4>Daily Utilities</h4>
                    <a href="/age-calculator/">Age Calculator</a>
                    <a href="/bmi-bmr-calculator/">BMI & BMR Calculator</a>
                    <a href="/image-compressor/">Image Compressor</a>
                    <a href="/password-generator/">Password Generator</a>
                    <a href="/word-counter/">Word Counter</a>
                    <a href="/unit-converter/">Unit Converter</a>
                </div>
                <div class="footer-links-column">
                    <h4>Resources</h4>
                    <a href="/blog/">SmartGen Academy</a>
                    <a href="/docs/">Documentation</a>
                    <a href="/updates/">Daily Changelog</a>
                    <a href="/help-center/">Help Centre</a>
                    <a href="/sitemap.xml">Sitemap (XML)</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© ${new Date().getFullYear()} SmartGen Tools. All rights reserved. Built with ❤️ for the community.</p>
                <div class="footer-legal-links">
                    <a href="/smartgen-legal-info/">Legal Info</a>
                    <a href="/trust-center/">Trust Centre</a>
                    <a href="/about/">About Us</a>
                    <a href="/contact/">Contact Us</a>
                </div>
            </div>
        </div>
    `;
}
