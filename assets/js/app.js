/**
 * SmartGen Header & Footer Injection - BULLETPROOF VERSION
 * Clean, robust logic with zero style conflicts
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initializeNavigation();
});

function injectHeader() {
    const headerEl = document.getElementById('main-header');
    if (!headerEl) return;

    headerEl.innerHTML = `
        <nav class="sg-navbar">
            <div class="sg-navbar-container">
                <!-- Logo -->
                <div class="sg-navbar-brand">
                    <a href="/" class="sg-logo">
                        <svg width="32" height="32" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                            <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                        </svg>
                        <span>SmartGen</span>
                    </a>
                </div>

                <!-- Desktop Navigation -->
                <div class="sg-navbar-menu">
                    <a href="/" class="sg-nav-item">Home</a>

                    <div class="sg-dropdown">
                        <button class="sg-nav-item sg-dropdown-toggle">
                            Products <span class="sg-arrow">▾</span>
                        </button>
                        <div class="sg-dropdown-menu">
                            <a href="/tools/" class="sg-dropdown-item">
                                <span class="sg-item-title">Explore All Tools</span>
                                <span class="sg-item-desc">131+ Professional Utilities</span>
                            </a>
                            <a href="/html-code-library/" class="sg-dropdown-item">
                                <span class="sg-item-title">HTML Code Library</span>
                                <span class="sg-item-desc">Visual to Code Components</span>
                            </a>
                        </div>
                    </div>

                    <div class="sg-dropdown">
                        <button class="sg-nav-item sg-dropdown-toggle">
                            Resources <span class="sg-arrow">▾</span>
                        </button>
                        <div class="sg-dropdown-menu">
                            <a href="/blog/" class="sg-dropdown-item">
                                <span class="sg-item-title">SmartGen Academy</span>
                                <span class="sg-item-desc">Expert Guides & Tutorials</span>
                            </a>
                            <a href="/docs/" class="sg-dropdown-item">
                                <span class="sg-item-title">Documentation</span>
                                <span class="sg-item-desc">API References</span>
                            </a>
                            <a href="/updates/" class="sg-dropdown-item">
                                <span class="sg-item-title">Daily Changelog</span>
                                <span class="sg-item-desc">Latest Updates</span>
                            </a>
                        </div>
                    </div>

                    <div class="sg-dropdown">
                        <button class="sg-nav-item sg-dropdown-toggle">
                            Company <span class="sg-arrow">▾</span>
                        </button>
                        <div class="sg-dropdown-menu">
                            <a href="/trust-center/" class="sg-dropdown-item">
                                <span class="sg-item-title">Trust Centre</span>
                                <span class="sg-item-desc">Privacy & Security</span>
                            </a>
                            <a href="/smartgen-legal-info/" class="sg-dropdown-item">
                                <span class="sg-item-title">Legal Info</span>
                                <span class="sg-item-desc">Terms & Compliance</span>
                            </a>
                            <a href="/help-center/" class="sg-dropdown-item">
                                <span class="sg-item-title">Help Centre</span>
                                <span class="sg-item-desc">Support & FAQs</span>
                            </a>
                            <a href="/about/" class="sg-dropdown-item">
                                <span class="sg-item-title">About Us</span>
                                <span class="sg-item-desc">Our Story</span>
                            </a>
                            <a href="/contact/" class="sg-dropdown-item">
                                <span class="sg-item-title">Contact Us</span>
                                <span class="sg-item-desc">Get in Touch</span>
                            </a>
                        </div>
                    </div>

                    <a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" rel="noopener noreferrer" class="sg-btn-github">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>Star</span>
                    </a>
                </div>

                <!-- Mobile Toggle Button -->
                <button class="sg-mobile-toggle" id="sg-mobile-toggle" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <!-- Mobile Menu -->
            <div class="sg-mobile-menu" id="sg-mobile-menu">
                <a href="/" class="sg-mobile-item">Home</a>
                <div class="sg-mobile-section">
                    <span class="sg-mobile-title">Products</span>
                    <a href="/tools/" class="sg-mobile-subitem">Explore All Tools</a>
                    <a href="/html-code-library/" class="sg-mobile-subitem">HTML Code Library</a>
                </div>
                <div class="sg-mobile-section">
                    <span class="sg-mobile-title">Resources</span>
                    <a href="/blog/" class="sg-mobile-subitem">SmartGen Academy</a>
                    <a href="/docs/" class="sg-mobile-subitem">Documentation</a>
                    <a href="/updates/" class="sg-mobile-subitem">Daily Changelog</a>
                </div>
                <div class="sg-mobile-section">
                    <span class="sg-mobile-title">Company</span>
                    <a href="/trust-center/" class="sg-mobile-subitem">Trust Centre</a>
                    <a href="/smartgen-legal-info/" class="sg-mobile-subitem">Legal Info</a>
                    <a href="/help-center/" class="sg-mobile-subitem">Help Centre</a>
                    <a href="/about/" class="sg-mobile-subitem">About Us</a>
                    <a href="/contact/" class="sg-mobile-subitem">Contact Us</a>
                </div>
                <a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" rel="noopener noreferrer" class="sg-mobile-github">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Star on GitHub
                </a>
            </div>
        </nav>
    `;
}

function initializeNavigation() {
    // Desktop Dropdowns
    const dropdowns = document.querySelectorAll('.sg-dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.sg-dropdown-toggle');
        const menu = dropdown.querySelector('.sg-dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = menu.style.display === 'block';
                
                // Close all menus
                document.querySelectorAll('.sg-dropdown-menu').forEach(m => {
                    m.style.display = 'none';
                });
                
                // Open this menu
                if (!isOpen) {
                    menu.style.display = 'block';
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sg-dropdown')) {
            document.querySelectorAll('.sg-dropdown-menu').forEach(m => {
                m.style.display = 'none';
            });
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('sg-mobile-toggle');
    const mobileMenu = document.getElementById('sg-mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('sg-mobile-menu-open');
            if (isOpen) {
                mobileMenu.classList.remove('sg-mobile-menu-open');
                mobileToggle.classList.remove('sg-mobile-toggle-active');
                document.body.style.overflow = '';
            } else {
                mobileMenu.classList.add('sg-mobile-menu-open');
                mobileToggle.classList.add('sg-mobile-toggle-active');
                document.body.style.overflow = 'hidden';
            }
        });

        // Close mobile menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('sg-mobile-menu-open');
                mobileToggle.classList.remove('sg-mobile-toggle-active');
                document.body.style.overflow = '';
            });
        });
    }
}

function injectFooter() {
    const footerEl = document.getElementById('main-footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
        <div class="sg-footer-container">
            <div class="sg-footer-grid">
                <div class="sg-footer-brand">
                    <div class="sg-footer-logo">
                        <svg width="40" height="40" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q10 10 30 10 L45 10 Q55 10 55 20 L55 25 L45 25 L45 20 Q45 18 40 18 L30 18 Q20 18 20 30 Q20 42 30 42 L40 42 Q45 42 45 40 L45 35 L55 35 L55 40 Q55 50 45 50 L30 50 Q10 50 10 30" fill="#2563eb" />
                            <path d="M32 15 L45 30 L35 30 L40 45 L27 30 L37 30 Z" fill="#ff8800" />
                        </svg>
                        <span>SmartGen</span>
                    </div>
                    <p>Fast, secure, and 100% free client-side web utilities for developers, marketers, and creators.</p>
                </div>
                <div class="sg-footer-col">
                    <h4>Developer Tools</h4>
                    <a href="/qr-generator/">QR Generator</a>
                    <a href="/json-formatter-validator/">JSON Formatter</a>
                    <a href="/uuid-generator/">UUID Generator</a>
                    <a href="/html-code-preview/">HTML Previewer</a>
                    <a href="/image-to-base64/">Image to Base64</a>
                </div>
                <div class="sg-footer-col">
                    <h4>SEO & Marketing</h4>
                    <a href="/utm-builder/">UTM Builder</a>
                    <a href="/meta-tag-generator/">Meta Tags</a>
                    <a href="/serp-preview-tool/">SERP Preview</a>
                    <a href="/blog-title-generator/">Blog Titles</a>
                    <a href="/schema-generator/">Schema Generator</a>
                </div>
                <div class="sg-footer-col">
                    <h4>Resources</h4>
                    <a href="/blog/">SmartGen Academy</a>
                    <a href="/docs/">Documentation</a>
                    <a href="/updates/">Changelog</a>
                    <a href="/help-center/">Help Centre</a>
                    <a href="/sitemap.xml">Sitemap</a>
                </div>
                <div class="sg-footer-col">
                    <h4>Company</h4>
                    <a href="/trust-center/">Trust Centre</a>
                    <a href="/smartgen-legal-info/">Legal Info</a>
                    <a href="/about/">About Us</a>
                    <a href="/contact/">Contact Us</a>
                </div>
            </div>
            <div class="sg-footer-bottom">
                <p>© ${new Date().getFullYear()} SmartGen Tools. All rights reserved.</p>
            </div>
        </div>
    `;
}
