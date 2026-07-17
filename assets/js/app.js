document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();
    injectFooter();
    initTheme();
    initAccordion();
    initCookieConsent();
    
    // Inject Adsterra ads on tool pages (runtime injection for static pages)
    if (typeof RuntimeAdInjector !== 'undefined' && RuntimeAdInjector.injectAllAds) {
        RuntimeAdInjector.injectAllAds();
    }
});

function initCookieConsent() {
    const banner = document.getElementById('cookie-consent-banner') || document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('accept-cookies') || document.getElementById('acceptCookies');
    
    if (!banner || !acceptBtn) return;

    const consentKey = banner.id === 'cookieBanner' ? 'smartgen_cookie_consent' : 'cookie-consent-accepted';

    if (!localStorage.getItem(consentKey)) {
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem(consentKey, 'true');
        localStorage.setItem('cookie-consent-accepted', 'true'); // Sync both keys
        localStorage.setItem('smartgen_cookie_consent', 'accepted');
        banner.style.display = 'none';
    });

    const declineBtn = document.getElementById('declineCookies');
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem(consentKey, 'declined');
            banner.style.display = 'none';
        });
    }
}

function injectNavbar() {
    const header = document.getElementById('main-header');
    if (!header) return;

    // Absolute paths (/) are used to prevent routing errors like 'blog/blog/'
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
                    <a href="/tools/">Products/Tools</a>
                    <a href="/blog/">Blog</a>
                    <div class="dropdown" id="resources-dropdown">
                        <a href="#" class="dropdown-trigger">Resources ▼</a>
                        <div class="dropdown-content">
                            <div class="dropdown-category">
                                <h4>📚 Learning</h4>
                                <a href="/html-code-library/" class="dropdown-item">HTML Code Library</a>
                                <a href="/docs/" class="dropdown-item">Documentation</a>
                                <a href="/blog/" class="dropdown-item">SmartGen Blog</a>
                            </div>
                            <div class="dropdown-category">
                                <h4>🔧 Developer</h4>
                                <a href="/qr-generator/" class="dropdown-item">QR Generator</a>
                                <a href="/meta-tag-generator/" class="dropdown-item">Meta Tags</a>
                                <a href="/json-formatter-validator/" class="dropdown-item">JSON Formatter</a>
                            </div>
                            <div class="dropdown-category">
                                <h4>📈 SEO & Marketing</h4>
                                <a href="/utm-builder/" class="dropdown-item">UTM Builder</a>
                                <a href="/keyword-density-checker/" class="dropdown-item">Keyword Density</a>
                                <a href="/serp-preview-tool/" class="dropdown-item">SERP Preview</a>
                            </div>
                            <div class="dropdown-category">
                                <h4>⚙️ Utilities</h4>
                                <a href="/voice-remover/" class="dropdown-item">Voice Remover (AI)</a>
                                <a href="/image-compressor/" class="dropdown-item">Image Compressor</a>
                                <a href="/password-generator/" class="dropdown-item">Password Generator</a>
                            </div>
                        </div>
                    </div>
                    <a href="/updates/">Changelog</a>
                    <a href="/help-center/">Help</a>
                </nav>
                <div class="header-actions">
                    <button id="theme-toggle" class="icon-btn" title="Toggle Theme">🌓</button>
                    <button id="mobile-menu-toggle" class="icon-btn mobile-only" title="Toggle Menu">☰</button>
                </div>
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
                <a href="/" class="nav-item">🏠 Home</a>
                <a href="/tools/" class="nav-item">🛠️ Products/Tools</a>
                <a href="/blog/" class="nav-item">📝 Blog</a>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid var(--border-color, #e5e7eb);">
                
                <div class="nav-category">📚 Resources</div>
                <a href="/html-code-library/" class="nav-item">HTML Code Library</a>
                <a href="/docs/" class="nav-item">Documentation</a>
                <a href="/blog/" class="nav-item">SmartGen Blog</a>
                
                <div class="nav-category">🔧 Developer Tools</div>
                <a href="/qr-generator/" class="nav-item">• QR Generator</a>
                <a href="/json-formatter-validator/" class="nav-item">• JSON Formatter</a>
                <a href="/uuid-generator/" class="nav-item">• UUID Generator</a>
                <a href="/meta-tag-generator/" class="nav-item">• Meta Tags</a>
                <a href="/tools/" class="nav-item" style="color: #2563EB; font-weight: 600;">View All →</a>

                <div class="nav-category">📈 SEO & Marketing</div>
                <a href="/utm-builder/" class="nav-item">• UTM Builder</a>
                <a href="/keyword-density-checker/" class="nav-item">• Keyword Density</a>
                <a href="/serp-preview-tool/" class="nav-item">• SERP Preview</a>
                <a href="/tools/" class="nav-item" style="color: #2563EB; font-weight: 600;">View All →</a>

                <div class="nav-category">⚙️ Daily Utilities</div>
                <a href="/voice-remover/" class="nav-item">• Voice Remover (AI)</a>
                <a href="/image-compressor/" class="nav-item">• Image Compressor</a>
                <a href="/password-generator/" class="nav-item">• Password Generator</a>
                <a href="/tools/" class="nav-item" style="color: #2563EB; font-weight: 600;">View All →</a>

                <hr style="margin: 15px 0; border: 0; border-top: 1px solid var(--border-color, #e5e7eb);">
                
                <div class="nav-category">📋 Company</div>
                <a href="/about/" class="nav-item">About Us</a>
                <a href="/contact/" class="nav-item">Contact Us</a>
                <a href="/updates/" class="nav-item">Changelog</a>
                <a href="/help-center/" class="nav-item">Help Center</a>
                <a href="/trust-center/" class="nav-item">Trust Center</a>
                <a href="/smartgen-legal-info/" class="nav-item">Legal Info</a>
                <a href="/privacy/" class="nav-item">Privacy Policy</a>
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

    // Desktop dropdown toggle
    const resourcesDropdown = document.getElementById('resources-dropdown');
    if (resourcesDropdown && window.innerWidth > 768) {
        const dropdownTrigger = resourcesDropdown.querySelector('.dropdown-trigger');
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            resourcesDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!resourcesDropdown.contains(e.target)) {
                resourcesDropdown.classList.remove('active');
            }
        });
    }
}

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
                        <h4 class="footer-accordion-trigger">Developer Tools <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/qr-generator/">QR Code Generator</a></li>
                            <li><a href="/html-code-preview/">Live HTML Previewer</a></li>
                            <li><a href="/json-formatter-validator/">JSON Formatter & Validator</a></li>
                            <li><a href="/uuid-generator/">UUID / GUID Generator</a></li>
                            <li><a href="/ip-address-lookup/">IP Address Lookup</a></li>
                            <li><a href="/url-encoder-decoder/">URL Encoder/Decoder</a></li>
                            <li><a href="/hash-generator/">MD5/SHA Hash Generator</a></li>
                            <li><a href="/image-to-base64/">Image to Base64</a></li>
                            <li><a href="/base64-to-image/">Base64 to Image Decoder</a></li>
                            <li><a href="/css-gradient-generator/">CSS Gradient Generator</a></li>
                            <li><a href="/random-choice-picker/">Random Choice Picker</a></li>
                            <li><a href="/text-to-changelog-json-generator/">Text to Changelog JSON Generator</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">SEO & Marketing <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/blog-title-generator/">Blog Title Generator</a></li>
                            <li><a href="/utm-builder/">Build UTM Links</a></li>
                            <li><a href="/keyword-density-checker/">Keyword Density Checker</a></li>
                            <li><a href="/robots-txt-generator/">Robots.txt Generator</a></li>
                            <li><a href="/serp-preview-tool/">SERP Preview Tool</a></li>
                            <li><a href="/schema-generator/">Schema Generator</a></li>
                            <li><a href="/meta-tag-generator/">Meta Tag Generator</a></li>
                            <li><a href="/youtube-thumbnail-downloader/">YouTube Thumbnail Downloader</a></li>
                            <li><a href="/whatsapp-link/">WhatsApp Link Creator</a></li>
                            <li><a href="/hashtag-generator/">Hashtag Generator</a></li>
                            <li><a href="/mailto-generator/">Mailto Link Generator</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">Daily Utilities <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/age-calculator/">Age Calculator</a></li>
                            <li><a href="/bmi-bmr-calculator/">BMI & BMR Calculator</a></li>
                            <li><a href="/emi-calculator/">EMI Calculator</a></li>
                            <li><a href="/percentage-calculator/">Percentage Calculator</a></li>
                            <li><a href="/pomodoro-timer/">Pomodoro Timer</a></li>
                            <li><a href="/secure-notepad/">Secure Notepad</a></li>
                            <li><a href="/unit-converter/">Unit Converter</a></li>
                            <li><a href="/image-compressor/">Image Compressor</a></li>
                            <li><a href="/picture-url-generator/">Picture URL Generator</a></li>
                            <li><a href="/fancy-font-generator/">Fancy Font Generator</a></li>
                            <li><a href="/word-counter/">Word Counter</a></li>
                            <li><a href="/text-case-converter/">Text Case Converter</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">📚 Resources <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/blog/">📖 SmartGen Blog</a></li>
                            <li><a href="/html-code-library/">📚 HTML Code Library</a></li>
                            <li><a href="/docs/">📖 Documentation</a></li>
                            <li><a href="/updates/">📋 Changelog</a></li>
                            <li><a href="/trust-center/">🛡️ Trust Center</a></li>
                            <li><a href="/smartgen-legal-info/">⚖️ Legal Info</a></li>
                            <li><a href="/help-center/">❓ Help Center</a></li>
                            <li><a href="/about/">About Us</a></li>
                            <li><a href="/contact/">Contact Support</a></li>
                            <li><a href="https://github.com/bayzed123/SmartGenQR.oi">⭐ Star on GitHub</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 SmartGen. All rights reserved. | <a href="/privacy/">Privacy Policy</a> | <a href="/smartgen-legal-info/">Terms & Conditions</a></p>
            </div>
        </div>
    `;

    // Accordion functionality for footer
    const triggers = footer.querySelectorAll('.footer-accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const column = this.closest('.footer-column');
            const links = column.querySelector('.footer-links');
            
            if (window.innerWidth <= 768) {
                links.style.display = links.style.display === 'none' ? 'block' : 'none';
                this.classList.toggle('active');
            }
        });
    });
}

function initTheme() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initAccordion() {
    const triggers = document.querySelectorAll('.footer-accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const column = this.closest('.footer-column');
                const links = column.querySelector('.footer-links');
                
                if (links) {
                    links.style.display = links.style.display === 'none' ? 'block' : 'none';
                    this.classList.toggle('active');
                }
            }
        });
    });
}
