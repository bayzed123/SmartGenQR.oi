/**
 * SmartGen Ad Injector
 * Handles ad placement for both build-time (SSG) and runtime (Browser)
 */

/**
 * Build-time Ad Injector (Node.js - used in build-blog.js and docs-build.js)
 */
class BuildTimeAdInjector {
  constructor(adConfig) {
    this.adConfig = adConfig;
  }

  /**
   * Inject header ads after the main H1
   */
  injectHeaderAds(content) {
    const leaderboard = this.adConfig.getAd('leaderboard728x90');
    const mobileBanner = this.adConfig.getAd('mobile320x50');
    
    if (!leaderboard || !mobileBanner) return content;

    const desktopWrapper = this.adConfig.getClsWrapper('leaderboard728x90', leaderboard.code, leaderboard.height);
    const mobileWrapper = this.adConfig.getClsWrapper('mobile320x50', mobileBanner.code, mobileBanner.height);

    const adContainer = `
<div class="header-ads-container">
  <div class="desktop-only">${desktopWrapper}</div>
  <div class="mobile-only">${mobileWrapper}</div>
</div>`;

    return content.replace(/<\/h1>/, `</h1>\n${adContainer}`);
  }

  /**
   * Inject in-content ads after specific paragraph positions
   */
  injectInContentAds(content) {
    const ad = this.adConfig.getAd('rect300x250');
    if (!ad) return content;

    const paragraphs = content.split('</p>');
    if (paragraphs.length < 5) return content;

    const positions = ad.positions || [4, 8];
    let offset = 0;

    positions.forEach(pos => {
      const index = pos + offset;
      if (index < paragraphs.length) {
        const wrapper = this.adConfig.getClsWrapper(`${ad.id}-${pos}`, ad.code, ad.height);
        paragraphs[index] = `\n${wrapper}\n${paragraphs[index]}`;
        offset++;
      }
    });

    return paragraphs.join('</p>');
  }

  /**
   * Inject sidebar skyscraper (Desktop only)
   */
  injectSidebarAd(content) {
    const ad = this.adConfig.getAd('skyscraper160x600');
    if (!ad) return content;

    const wrapper = `<div class="ad-cls-wrapper sticky" style="min-height: ${ad.height}px; position: sticky; top: 20px;">${ad.code}</div>`;
    const sidebar = `\n<aside class="sidebar desktop-only">\n  ${wrapper}\n</aside>\n`;

    // Insert after the closing </main> or </article>
    if (content.includes('</main>')) {
      return content.replace(/<\/main>/, `</main>\n${sidebar}`);
    } else if (content.includes('</article>')) {
      return content.replace(/<\/article>/, `</article>\n${sidebar}`);
    }
    return content;
  }

  /**
   * Inject native banner before author box or at end of content
   */
  injectNativeBanner(content) {
    const ad = this.adConfig.getAd('nativeBanner');
    if (!ad) return content;

    const wrapper = this.adConfig.getClsWrapper(ad.id, ad.code, 'auto');
    
    // Try to insert before author box
    if (content.includes('class="author-card"')) {
      return content.replace(/<div class="author-card"/, `${wrapper}\n<div class="author-card"`);
    }
    
    // Fallback: insert before footer
    if (content.includes('<footer')) {
      return content.replace(/<footer/, `${wrapper}\n<footer`);
    }

    return content + `\n${wrapper}`;
  }

  /**
   * Inject social bar before closing body tag
   */
  injectSocialBar(content) {
    const ad = this.adConfig.getAd('socialBar');
    // `enabled: false` is an explicit opt-out, not a missing config -- honour
    // it so a unit can be switched off in one place instead of being hunted
    // down across every generated page.
    if (!ad || ad.enabled === false) return content;

    return content.replace(/<\/body>/, `${ad.code}\n</body>`);
  }

  /**
   * Apply all ad injections (Static helper for build scripts)
   */
  static injectAllAds(content) {
    const AD_CONFIG = require('../config/ad-config.js');
    const injector = new BuildTimeAdInjector(AD_CONFIG);
    
    let processedContent = content;
    processedContent = injector.injectHeaderAds(processedContent);
    processedContent = injector.injectInContentAds(processedContent);
    processedContent = injector.injectSidebarAd(processedContent);
    processedContent = injector.injectNativeBanner(processedContent);
    processedContent = injector.injectSocialBar(processedContent);
    
    return processedContent;
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
   * Helper to execute scripts within a container
   * Required because innerHTML doesn't execute scripts
   */
  static executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * Inject in-content ads dynamically
   */
  static injectInContentAds() {
    const ad = AD_CONFIG.getAd('rect300x250');
    if (!ad) return;

    // Expanded selectors for better tool page coverage
    const paragraphs = document.querySelectorAll('article p, .seo-content p, .seo-content-container p, section p, .tool-container p');
    if (paragraphs.length === 0) return;

    let positions = ad.positions || [4, 8];
    
    // Fallback for short content
    if (paragraphs.length < 4) {
      positions = [1];
    } else if (paragraphs.length < 8) {
      positions = [2];
    }

    positions.forEach(position => {
      const targetIdx = Math.min(position - 1, paragraphs.length - 1);
      if (paragraphs[targetIdx]) {
        const wrapper = document.createElement('div');
        wrapper.id = `ad-wrapper-${ad.id}-${position}`;
        wrapper.className = 'ad-cls-wrapper';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;

        paragraphs[targetIdx].parentNode.insertBefore(wrapper, paragraphs[targetIdx].nextSibling);
        this.executeScripts(wrapper);
        console.log(`[AdInjector] Injected in-content ad at position ${targetIdx + 1}`);
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

    let injected = false;
    if (deviceType === 'desktop') {
      const ad = AD_CONFIG.getAd('leaderboard728x90');
      if (ad) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-cls-wrapper desktop-only';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;
        container.appendChild(wrapper);
        this.executeScripts(wrapper);
        injected = true;
      }
    } else {
      const ad = AD_CONFIG.getAd('mobile320x50');
      if (ad) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-cls-wrapper mobile-only';
        wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;`;
        wrapper.innerHTML = ad.code;
        container.appendChild(wrapper);
        this.executeScripts(wrapper);
        injected = true;
      }
    }

    if (injected) {
      h1.parentNode.insertBefore(container, h1.nextSibling);
      console.log(`[AdInjector] Injected header ad for ${deviceType}`);
    }
  }

  /**
   * Inject sidebar ad (desktop only)
   */
  static injectSidebarAd() {
    const deviceType = this.getDeviceType();
    if (deviceType !== 'desktop') return;

    const ad = AD_CONFIG.getAd('skyscraper160x600');
    if (!ad) return;

    const main = document.querySelector('main') || document.querySelector('article') || document.querySelector('.tool-container');
    if (!main) return;

    const aside = document.createElement('aside');
    aside.className = 'sidebar desktop-only';

    const wrapper = document.createElement('div');
    wrapper.id = `ad-wrapper-${ad.id}`;
    wrapper.className = 'ad-cls-wrapper sticky';
    wrapper.style.cssText = `min-height: ${ad.height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden; position: sticky; top: 20px;`;
    wrapper.innerHTML = ad.code;

    aside.appendChild(wrapper);
    this.executeScripts(wrapper);
    main.parentNode.insertBefore(aside, main.nextSibling);
    console.log(`[AdInjector] Injected sidebar ad`);
  }

  /**
   * Inject native banner
   */
  static injectNativeBanner() {
    const ad = AD_CONFIG.getAd('nativeBanner');
    if (!ad) return;

    const article = document.querySelector('article, .seo-content, .seo-content-container, section');
    const authorBox = document.querySelector('[class*="author"]');

    let insertBefore = authorBox;
    if (!insertBefore) {
      insertBefore = document.querySelector('[class*="related"], #dynamic-related-tools');
    }

    if (insertBefore) {
      const wrapper = document.createElement('div');
      wrapper.id = `ad-wrapper-${ad.id}`;
      wrapper.className = 'ad-cls-wrapper';
      wrapper.style.cssText = 'min-height: auto; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;';
      wrapper.innerHTML = ad.code;

      insertBefore.parentNode.insertBefore(wrapper, insertBefore);
      this.executeScripts(wrapper);
      console.log(`[AdInjector] Injected native banner`);
    } else if (article) {
      const wrapper = document.createElement('div');
      wrapper.id = `ad-wrapper-${ad.id}`;
      wrapper.className = 'ad-cls-wrapper';
      wrapper.style.cssText = 'min-height: auto; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;';
      wrapper.innerHTML = ad.code;

      article.appendChild(wrapper);
      this.executeScripts(wrapper);
      console.log(`[AdInjector] Injected native banner at end of content`);
    }
  }

  /**
   * Inject social bar
   */
  static injectSocialBar() {
    const ad = AD_CONFIG.getAd('socialBar');
    if (!ad || ad.enabled === false) return;

    const script = document.createElement('script');
    script.src = 'https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js';
    script.async = true;
    document.body.appendChild(script);
    console.log(`[AdInjector] Injected social bar`);
  }

  /**
   * Apply all ad injections
   */
  static injectAllAds() {
    console.log('[AdInjector] Starting runtime ad injection...');
    this.injectHeaderAds();
    this.injectInContentAds();
    this.injectSidebarAd();
    this.injectNativeBanner();
    this.injectSocialBar();
  }
}

// Export for Node.js (build-time)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BuildTimeAdInjector, RuntimeAdInjector };
}

// Export for browser (runtime)
if (typeof window !== 'undefined') {
  window.RuntimeAdInjector = RuntimeAdInjector;
}
