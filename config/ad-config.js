/**
 * Adsterra Ad Configuration
 * Centralized registry for all ad units with CLS prevention wrappers
 * All ads use strict min-height + flex layout to prevent Cumulative Layout Shift
 */

const AD_CONFIG = {
  // Ad units registry with actual Adsterra codes
  ads: {
    leaderboard728x90: {
      id: 'leaderboard_728x90',
      code: `<script>
  atOptions = {
    'key' : 'f9d4f2f3a29a9dcfb43dddf1fd33eb88',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/f9d4f2f3a29a9dcfb43dddf1fd33eb88/invoke.js"></script>`,
      height: 90,
      responsive: { desktop: true, tablet: false, mobile: false }
    },

    mobile320x50: {
      id: 'mobile_320x50',
      code: `<script>
  atOptions = {
    'key' : '6af746fdd2244652b728e73b1a70db61',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/6af746fdd2244652b728e73b1a70db61/invoke.js"></script>`,
      height: 50,
      responsive: { desktop: false, tablet: false, mobile: true }
    },

    rect300x250: {
      id: 'rect_300x250',
      code: `<script>
  atOptions = {
    'key' : 'f7aab91a9a0a262448277c24ba0763d1',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/f7aab91a9a0a262448277c24ba0763d1/invoke.js"></script>`,
      height: 250,
      responsive: { desktop: true, tablet: true, mobile: true },
      positions: [4, 8] // After 4th and 8th paragraphs
    },

    skyscraper160x600: {
      id: 'skyscraper_160x600',
      code: `<script>
  atOptions = {
    'key' : '96e8bb0db46b2c8ef669fa310ed45f8b',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/96e8bb0db46b2c8ef669fa310ed45f8b/invoke.js"></script>`,
      height: 600,
      responsive: { desktop: true, tablet: false, mobile: false }
    },

    banner468x60: {
      id: 'banner_468x60',
      code: `<script>
  atOptions = {
    'key' : '0b5fea20f0ed426f24c4fc004a095026',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/0b5fea20f0ed426f24c4fc004a095026/invoke.js"></script>`,
      height: 60,
      responsive: { desktop: true, tablet: true, mobile: false }
    },

    nativeBanner: {
      id: 'native_banner',
      code: `<script async="async" data-cfasync="false" src="https://pl30322059.effectivecpmnetwork.com/333d7660ba0ab1f7a20095918a984f02/invoke.js"></script>
<div id="container-333d7660ba0ab1f7a20095918a984f02"></div>`,
      height: 'auto',
      responsive: { desktop: true, tablet: true, mobile: true }
    },

    socialBar: {
      id: 'social_bar',
      code: `<script src="https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js"></script>`,
      height: 'auto',
      responsive: { desktop: true, tablet: true, mobile: true }
    }
  },

  /**
   * Get ad by ID
   */
  getAd: function(adId) {
    return this.ads[adId] || null;
  },

  /**
   * Get CLS-safe wrapper for ad
   * Ensures min-height is set before ad loads to prevent layout shift
   */
  getClsWrapper: function(adId, adCode, height) {
    const heightValue = height === 'auto' ? 'auto' : `${height}px`;
    const minHeight = height === 'auto' ? 'auto' : `${height}px`;
    
    return `<div class="ad-cls-wrapper" id="ad-wrapper-${adId}" style="min-height: ${minHeight}; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden; flex-shrink: 0;">
  ${adCode}
</div>`;
  },

  /**
   * Get ads by placement type
   */
  getAdsByPlacement: function(placement) {
    const placements = {
      header: ['leaderboard728x90', 'mobile320x50'],
      inContent: ['rect300x250', 'banner468x60'],
      sidebar: ['skyscraper160x600'],
      native: ['nativeBanner'],
      social: ['socialBar']
    };
    return placements[placement] || [];
  },

  /**
   * Check if ad should be shown on current device
   */
  shouldShowAd: function(adId, deviceType = 'desktop') {
    const ad = this.getAd(adId);
    if (!ad || !ad.responsive) return true;
    return ad.responsive[deviceType] !== false;
  }
};

// Export for Node.js (build-time)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AD_CONFIG;
}

// Export for browser (runtime)
if (typeof window !== 'undefined') {
  window.AD_CONFIG = AD_CONFIG;
}
