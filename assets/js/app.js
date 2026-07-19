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
    /**
 * SmartGen Shared Header & Footer Logic
 * This script injects the shared header and footer across all pages.
 * FIXED VERSION: Updated navigation with all valid links and proper styling
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initDropdowns();
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
                    <span class="logo-text">SmartGen</span>
                </a>

                <nav id="nav-links" class="nav-links">
                    <a href="/" class="nav-link">Home</a>
                    
                    <div class="dropdown">
                        <button class="dropdown-btn">Products/Tools <span class="arrow">▾</span></button>
                        <div class="dropdown-content">
                            <a href="/tools/">Explore All Tools</a>
                            <a href="/html-code-library/">HTML Code Library</a>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button class="dropdown-btn">Resources <span class="arrow">▾</span></button>
                        <div class="dropdown-content">
                            <a href="/blog/">SmartGen Academy</a>
                            <a href="/docs/">Documentation</a>
                            <a href="/updates/">Daily Changelog</a>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button class="dropdown-btn">Company <span class="arrow">▾</span></button>
                        <div class="dropdown-content">
                            <a href="/trust-center/">Trust Centre</a>
                            <a href="/smartgen-legal-info/">Legal Info</a>
                            <a href="/help-center/">Help Centre</a>
                            <a href="/about/">About Us</a>
                            <a href="/contact/">Contact Us</a>
                        </div>
                    </div>

                    <a href="https://github.com/bayzed123/SmartGenQR.oi" class="github-link" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
                    <span class="sidebar-section-title">Products/Tools</span>
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
    const toolsDropdown = document.getElementById('tools-dropdown');
    if (window.innerWidth > 768) {
        const dropdownTrigger = toolsDropdown.querySelector('.dropdown-trigger');
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            toolsDropdown.classList.toggle('active');
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
                        <div class="logo-icon" style="width: 40px; height: 40px; font-size: 1.5rem;">â¡</div>
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
                            <li><a href="/word-counter/">Word Counter Tool</a></li>
                            <li><a href="/text-case-converter/">Text Case Converter</a></li>
                            <li><a href="/password-generator/">Password Generator</a></li>
                            <li><a href="/cpm-roi-calculator/">CPM & ROI Calculator</a></li>
                            <li><a href="/color-palette-extractor/">Color Palette Extractor</a></li>
                            <li><a href="/lorem-ipsum-generator/">Lorem Ipsum Generator</a></li>
                            <li><a href="/facebook-id-finder/">Facebook ID Finder</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">ð RESOURCES <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/blog/" style="font-weight: 700; color: #2563eb;">ð Read Our Blog</a></li>
                            <li><a href="/tools/" style="font-weight: 700; color: #2563eb;">ð ï¸ Tool Directory</a></li>
                            <li><a href="/about/">About Us</a></li>
                            <li><a href="/contact/">Contact Support</a></li>
                            <li><a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank">â­ Star on GitHub</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">Legal Info Generation <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/privacy-policy-generator/">Privacy Policy Generator</a></li>
                            <li><a href="/terms-conditions-generator/">Terms & Conditions Generator</a></li>
                            <li><a href="/disclaimer-generator/">Disclaimer Generator</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4 class="footer-accordion-trigger">Legal & Info <span class="accordion-icon"></span></h4>
                        <ul class="footer-links">
                            <li><a href="/about/">About Us</a></li>
                            <li><a href="/contact/">Contact Us</a></li>
                            <li><a href="/privacy/">Privacy Policy</a></li>
                            <li><a href="/terms/">Terms of Service</a></li>
                            <li><a href="/disclaimer/">Disclaimer</a></li>
                            <li><a href="/cookies/">Cookie Policy</a></li>
                            <li><a href="/updates/">Updates & Changelog</a></li>
                            <li><a href="/docs/">Developer Docs</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-left">
                    <p>&copy; 2026 SmartGen. Developed by <a href="https://sayadbayezid.com" target="_blank" rel="noopener noreferrer" class="developer-link">Sayad Md Bayezid Hosan</a></p>
                </div>
                <div class="footer-social-icons">
                    <a href="https://github.com/bayzed123" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Visit our GitHub Repository"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a>
                    <a href="https://linkedin.com/in/sayadbayezid" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Visit our LinkedIn Profile"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.736 0-9.646h3.554v1.364c.429-.646 1.199-1.538 2.914-1.538 2.127 0 3.72 1.395 3.72 4.393v5.427zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.704 0-.951.77-1.704 1.963-1.704 1.193 0 1.915.753 1.929 1.704 0 .946-.736 1.704-1.977 1.704zm1.582 11.597H3.635V9.859h3.284v10.593zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
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