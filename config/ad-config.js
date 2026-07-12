/**
 * Adsterra Ad Configuration
 * CLS-Optimized Ad Injection System
 * 
 * This configuration file contains all ad units with their exact codes,
 * placement rules, and CLS-prevention wrappers.
 */

const AD_CONFIG = {
  // Ad Units with their configurations
  ads: {
    socialBar: {
      id: 'social-bar',
      type: 'script',
      placement: 'footer',
      code: '<script src="https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js"><\/script>',
      description: 'Social Bar - Inject before </body> tag'
    },
    
    nativeBanner: {
      id: 'native-banner',
      type: 'native',
      placement: 'content-bottom',
      height: 'auto',
      code: `<script async="async" data-cfasync="false" src="https://pl30322059.effectivecpmnetwork.com/333d7660ba0ab1f7a20095918a984f02/invoke.js"><\/script>
<div id="container-333d7660ba0ab1f7a20095918a984f02"><\/div>`,
      description: 'Native Banner - Bottom of article content'
    },
    
    rect300x250: {
      id: 'rect-300x250',
      type: 'iframe',
      placement: 'in-content',
      width: 300,
      height: 250,
      positions: [4, 8], // After 4th and 8th paragraphs
      code: `<script>
  atOptions = {
    'key' : 'f7aab91a9a0a262448277c24ba0763d1',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
<\/script>
<script src="https://www.highperformanceformat.com/f7aab91a9a0a262448277c24ba0763d1/invoke.js"><\/script>`,
      description: '300x250 Medium Rectangle - In-content'
    },
    
    skyscraper160x600: {
      id: 'skyscraper-160x600',
      type: 'iframe',
      placement: 'sidebar',
      width: 160,
      height: 600,
      responsive: { desktop: true, tablet: false, mobile: false },
      sticky: true,
      code: `<script>
  atOptions = {
    'key' : '96e8bb0db46b2c8ef669fa310ed45f8b',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
<\/script>
<script src="https://www.highperformanceformat.com/96e8bb0db46b2c8ef669fa310ed45f8b/invoke.js"><\/script>`,
      description: '160x600 Wide Skyscraper - Desktop sidebar only'
    },
    
    leaderboard728x90: {
      id: 'leaderboard-728x90',
      type: 'iframe',
      placement: 'header',
      width: 728,
      height: 90,
      responsive: { desktop: true, tablet: false, mobile: false },
      code: `<script>
  atOptions = {
    'key' : 'f9d4f2f3a29a9dcfb43dddf1fd33eb88',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
<\/script>
<script src="https://www.highperformanceformat.com/f9d4f2f3a29a9dcfb43dddf1fd33eb88/invoke.js"><\/script>`,
      description: '728x90 Desktop Leaderboard - Below H1 title'
    },
    
    mobile320x50: {
      id: 'mobile-320x50',
      type: 'iframe',
      placement: 'header',
      width: 320,
      height: 50,
      responsive: { desktop: false, tablet: false, mobile: true },
      code: `<script>
  atOptions = {
    'key' : '6af746fdd2244652b728e73b1a70db61',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
<\/script>
<script src="https://www.highperformanceformat.com/6af746fdd2244652b728e73b1a70db61/invoke.js"><\/script>`,
      description: '320x50 Mobile Leaderboard - Mobile only'
    },
    
    banner468x60: {
      id: 'banner-468x60',
      type: 'iframe',
      placement: 'flexible',
      width: 468,
      height: 60,
      code: `<script>
  atOptions = {
    'key' : '0b5fea20f0ed426f24c4fc004a095026',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
<\/script>
<script src="https://www.highperformanceformat.com/0b5fea20f0ed426f24c4fc004a095026/invoke.js"><\/script>`,
      description: '468x60 General Banner - Flexible placement'
    }
  },

  /**
   * CLS-Prevention Wrapper Template
   * Wraps each ad with proper spacing and height reservation
   */
  getClsWrapper: function(adId, content, height) {
    return `<div id="ad-wrapper-${adId}" class="ad-cls-wrapper" style="min-height: ${height}px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
  ${content}
</div>`;
  },

  /**
   * Get ad by ID
   */
  getAd: function(adId) {
    return this.ads[adId] || null;
  },

  /**
   * Get all ads for a specific placement
   */
  getAdsByPlacement: function(placement) {
    return Object.values(this.ads).filter(ad => ad.placement === placement);
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
