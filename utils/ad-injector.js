/**
 * Ad Injector Utilities
 * Handles both build-time and runtime ad injection with CLS optimization
 */

const AD_CONFIG = typeof require !== 'undefined' ? require('../config/ad-config.js') : window.AD_CONFIG;

/**
 * Build-Time Ad Injector (Node.js - used in build-blog.js)
 */
class BuildTimeAdInjector {
  /**
   * Inject 300x250 ads after 4th and 8th paragraphs
   */
  static injectInContentAds(htmlContent) {
    const ad = AD_CONFIG.getAd('rect300x250');
    if (!ad) return htmlContent;

    const wrappedAd = AD_CONFIG.getClsWrapper(ad.id, ad.code, ad.height);
    
    // Parse HTML and find paragraphs
    const paragraphRegex = /<p[^>]*>[\s\S]*?<\/p>/g;
    const paragraphs = htmlContent.match(paragraphRegex) || [];
    
    if (paragraphs.length === 0) return htmlContent;

    let result = htmlContent;
    let injectedCount = 0;

    // Inject after 4th paragraph
    if (paragraphs.length >= 4) {
      const targetParagraph = paragraphs[3];
      const replacement = targetParagraph + '\n' + wrappedAd;
      result = result.replace(targetParagraph, replacement);
      injectedCount++;
    }

    // Inject after 8th paragraph (accounting for first injection)
    if (paragraphs.length >= 8 && injectedCount > 0) {
      const updatedParagraphs = result.match(paragraphRegex) || [];
      if (updatedParagraphs.length >= 8) {
        const targetParagraph = updatedParagraphs[7];
        const replacement = targetParagraph + '\n' + wrappedAd;
        result = result.replace(targetParagraph, replacement);
      }
    }

    return result;
  }

  /**
   * Inject header ads (728x90 for desktop, 320x50 for mobile)
   */
  static injectHeaderAds(htmlContent) {
    const desktopAd = AD_CONFIG.getAd('leaderboard728x90');
    const mobileAd = AD_CONFIG.getAd('mobile320x50');

    if (!desktopAd || !mobileAd) return htmlContent;

    const wrappedDesktopAd = AD_CONFIG.getClsWrapper(desktopAd.id, desktopAd.code, desktopAd.height);
    const wrappedMobileAd = AD_CONFIG.getClsWrapper(mobileAd.id, mobileAd.code, mobileAd.height);

    // Find H1 tag
    const h1Regex = /<h1[^>]*>[\s\S]*?<\/h1>/;
    const h1Match = htmlContent.match(h1Regex);

    if (h1Match) {
      const headerAdsContainer = `<div class="header-ads-container">
  <div class="desktop-only">
    ${wrappedDesktopAd}
  </div>
  <div class="mobile-only">
    ${wrappedMobileAd}
  </div>
</div>`;
      return htmlContent.replace(h1Match[0], h1Match[0] + '\n' + headerAdsContainer);
    }

    return htmlContent;
  }

  /**
   * Inject native banner at bottom of content
   */
  static injectNativeBanner(htmlContent) {
    const ad = AD_CONFIG.getAd('nativeBanner');
    if (!ad) return htmlContent;

    const wrappedAd = AD_CONFIG.getClsWrapper(ad.id, ad.code, 'auto');

    // Find the last closing tag before author box or related posts
    const authorBoxRegex = /<div[^>]*class="[^"]*author[^"]*"[^>]*>/i;
    const relatedPostsRegex = /<div[^>]*class="[^"]*related[^"]*"[^>]*>/i;

    let insertPoint = -1;

    const authorMatch = htmlContent.search(authorBoxRegex);
    const relatedMatch = htmlContent.search(relatedPostsRegex);

    if (authorMatch !== -1) {
      insertPoint = authorMatch;
    } else if (relatedMatch !== -1) {
      insertPoint = relatedMatch;
    } else {
      // Insert before closing article tag
      const articleCloseRegex = /<\/article>/i;
      insertPoint = htmlContent.search(articleCloseRegex);
    }

    if (insertPoint !== -1) {
      return htmlContent.slice(0, insertPoint) + wrappedAd + '\n' + htmlContent.slice(insertPoint);
    }

    return htmlContent;
  }

  /**
   * Inject sidebar ad (160x600 - desktop only)
   */
  static injectSidebarAd(htmlContent) {
    const ad = AD_CONFIG.getAd('skyscraper160x600');
    if (!ad) return htmlContent;

    const wrappedAd = AD_CONFIG.getClsWrapper(ad.id, ad.code, ad.height);

    const sidebarContainer = `<aside class="sidebar desktop-only">
  <div class="sidebar-ad sticky">
    ${wrappedAd}
  </div>
</aside>`;

    // Insert before closing main tag or at the end of content
    const mainCloseRegex = /<\/main>/i;
    const mainMatch = htmlContent.search(mainCloseRegex);

    if (mainMatch !== -1) {
      return htmlContent.slice(0, mainMatch) + '\n' + sidebarContainer + '\n' + htmlContent.slice(mainMatch);
    }

    return htmlContent + '\n' + sidebarContainer;
  }

  /**
   * Inject social bar script before </body>
   */
  static injectSocialBar(htmlContent) {
    const ad = AD_CONFIG.getAd('socialBar');
    if (!ad) return htmlContent;

    const bodyCloseRegex = /<\/body>/i;
    const bodyMatch = htmlContent.search(bodyCloseRegex);

    if (bodyMatch !== -1) {
      return htmlContent.slice(0, bodyMatch) + '\n' + ad.code + '\n' + htmlContent.slice(bodyMatch);
    }

    return htmlContent + '\n' + ad.code;
  }

  /**
   * Apply all ad injections
   */
  static injectAllAds(htmlContent) {
    let result = htmlContent;
    result = this.injectHeaderAds(result);
    result = this.injectInContentAds(result);
    result = this.injectSidebarAd(result);
    result = this.injectNativeBanner(result);
    result = this.injectSocialBar(result);
    return result;
  }
}

/**
 * Runtime Ad Injector (Browser - used in app.js)
 */
class RuntimeAdInjector {
  /**
   * Detect device type
   */
  static getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Inject in-content ads dynamically
   */
  static injectInContentAds() {
    const ad = AD_CONFIG.getAd('rect300x250');
    if (!ad) return;

    const paragraphs = document.querySelectorAll('article p');
    const positions = ad.positions || [4, 8];

    positions.forEach(position => {
      if (paragraphs[position - 1]) {
        const wrapper = document.createElement('div');
        wrapper.id = `ad-wrapper-${ad.id}-${position}`;
        wrapper.className = 'ad-cls-wrapper';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;

        paragraphs[position - 1].parentNode.insertBefore(wrapper, paragraphs[position - 1].nextSibling);
      }
    });
  }

  /**
   * Inject header ads based on device type
   */
  static injectHeaderAds() {
    const deviceType = this.getDeviceType();
    const h1 = document.querySelector('h1');

    if (!h1) return;

    const container = document.createElement('div');
    container.className = 'header-ads-container';

    if (deviceType === 'desktop') {
      const ad = AD_CONFIG.getAd('leaderboard728x90');
      if (ad) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-cls-wrapper desktop-only';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;
        container.appendChild(wrapper);
      }
    } else if (deviceType === 'mobile') {
      const ad = AD_CONFIG.getAd('mobile320x50');
      if (ad) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-cls-wrapper mobile-only';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;
        container.appendChild(wrapper);
      }
    }

    h1.parentNode.insertBefore(container, h1.nextSibling);
  }

  /**
   * Inject sidebar ad (desktop only)
   */
  static injectSidebarAd() {
    const deviceType = this.getDeviceType();
    if (deviceType !== 'desktop') return;

    const ad = AD_CONFIG.getAd('skyscraper160x600');
    if (!ad) return;

    const main = document.querySelector('main') || document.querySelector('article');
    if (!main) return;

    const aside = document.createElement('aside');
    aside.className = 'sidebar desktop-only';

    const wrapper = document.createElement('div');
    wrapper.id = `ad-wrapper-${ad.id}`;
    wrapper.className = 'ad-cls-wrapper sticky';
    wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden; position: sticky; top: 20px;`;
    wrapper.innerHTML = ad.code;

    aside.appendChild(wrapper);
    main.parentNode.insertBefore(aside, main.nextSibling);
  }

  /**
   * Inject native banner
   */
  static injectNativeBanner() {
    const ad = AD_CONFIG.getAd('nativeBanner');
    if (!ad) return;

    const article = document.querySelector('article');
    const authorBox = document.querySelector('[class*="author"]');

    let insertBefore = authorBox;
    if (!insertBefore) {
      insertBefore = document.querySelector('[class*="related"]');
    }

    if (insertBefore) {
      const wrapper = document.createElement('div');
      wrapper.id = `ad-wrapper-${ad.id}`;
      wrapper.className = 'ad-cls-wrapper';
      wrapper.style.cssText = 'min-height: auto; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;';
      wrapper.innerHTML = ad.code;

      insertBefore.parentNode.insertBefore(wrapper, insertBefore);
    } else if (article) {
      const wrapper = document.createElement('div');
      wrapper.id = `ad-wrapper-${ad.id}`;
      wrapper.className = 'ad-cls-wrapper';
      wrapper.style.cssText = 'min-height: auto; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;';
      wrapper.innerHTML = ad.code;

      article.appendChild(wrapper);
    }
  }

  /**
   * Inject social bar
   */
  static injectSocialBar() {
    const ad = AD_CONFIG.getAd('socialBar');
    if (!ad) return;

    const script = document.createElement('script');
    script.src = 'https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js';
    script.async = true;
    document.body.appendChild(script);
  }

  /**
   * Apply all ad injections
   */
  static injectAllAds() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.injectHeaderAds();
        this.injectInContentAds();
        this.injectSidebarAd();
        this.injectNativeBanner();
        this.injectSocialBar();
      });
    } else {
      this.injectHeaderAds();
      this.injectInContentAds();
      this.injectSidebarAd();
      this.injectNativeBanner();
      this.injectSocialBar();
    }
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BuildTimeAdInjector, RuntimeAdInjector };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.BuildTimeAdInjector = BuildTimeAdInjector;
  window.RuntimeAdInjector = RuntimeAdInjector;
}
