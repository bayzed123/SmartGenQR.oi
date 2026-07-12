# Adsterra Ad Integration - Complete Implementation Guide

## Overview

This guide explains how to use the fully automated Adsterra ad injection system that handles all ad placements with CLS (Cumulative Layout Shift) optimization.

## System Architecture

### Three-Layer Architecture:

1. **Configuration Layer** (`config/ad-config.js`)
   - Centralized ad unit definitions
   - All Adsterra codes and placement rules
   - CLS wrapper generation

2. **Injection Layer** (`utils/ad-injector.js`)
   - Build-time injection (Node.js)
   - Runtime injection (Browser)
   - Device-responsive logic

3. **Styling Layer** (`assets/css/ads.css`)
   - CLS-optimized CSS
   - Responsive breakpoints
   - Dark mode support

## Quick Start

### 1. Include CSS in Your HTML

Add this to your `<head>` section:

```html
<link rel="stylesheet" href="/assets/css/ads.css">
```

### 2. Build-Time Integration (build-blog.js)

If you're using Node.js to build your blog:

```javascript
const { BuildTimeAdInjector } = require('./utils/ad-injector.js');

// In your HTML generation function:
let htmlContent = generateArticleHTML(article);

// Apply all ad injections
htmlContent = BuildTimeAdInjector.injectAllAds(htmlContent);

// Write to file
fs.writeFileSync(outputPath, htmlContent);
```

### 3. Runtime Integration (app.js)

For client-side ad injection:

```javascript
// Include the config and injector
<script src="/config/ad-config.js"></script>
<script src="/utils/ad-injector.js"></script>

// In your page load handler:
document.addEventListener('DOMContentLoaded', () => {
  RuntimeAdInjector.injectAllAds();
});
```

## Ad Placements

### 1. Header Ads (Responsive)
- **Desktop**: 728x90 Leaderboard (below H1 title)
- **Mobile**: 320x50 Mobile Leaderboard (below H1 title)
- **Tablet**: Hidden

**Auto-injected**: Yes ✅

### 2. In-Content Ads (300x250)
- **Placement**: After 4th and 8th paragraphs
- **Responsive**: Yes (stacks on mobile)
- **Auto-injected**: Yes ✅

### 3. Sidebar Ad (160x600)
- **Placement**: Right side of content
- **Responsive**: Desktop only
- **Sticky**: Yes (follows scroll)
- **Auto-injected**: Yes ✅

### 4. Native Banner
- **Placement**: Bottom of article (before author box)
- **Responsive**: All devices
- **Auto-injected**: Yes ✅

### 5. Social Bar
- **Placement**: Before `</body>` tag
- **Responsive**: All devices
- **Auto-injected**: Yes ✅

## CLS Prevention

All ads are wrapped with CLS-prevention containers:

```html
<div class="ad-cls-wrapper" style="min-height: [HEIGHT]px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
  [AD CODE]
</div>
```

**Key Features**:
- ✅ Reserved space before ad loads
- ✅ Prevents layout shift
- ✅ Maintains 100% Core Web Vitals score
- ✅ Flexbox centering for responsive design

## Configuration

### Modify Ad Units

Edit `config/ad-config.js` to update ad codes:

```javascript
rect300x250: {
  id: 'rect-300x250',
  code: `<script>
  atOptions = {
    'key' : 'YOUR_NEW_KEY',
    // ... other options
  };
</script>
<script src="https://www.highperformanceformat.com/YOUR_NEW_KEY/invoke.js"><\/script>`,
}
```

### Change Ad Positions

For in-content ads, modify the `positions` array:

```javascript
rect300x250: {
  positions: [3, 6, 9], // After 3rd, 6th, and 9th paragraphs
}
```

### Enable/Disable Specific Ads

In your injection code:

```javascript
// Build-time
htmlContent = BuildTimeAdInjector.injectHeaderAds(htmlContent);
htmlContent = BuildTimeAdInjector.injectInContentAds(htmlContent);
// Skip sidebar: // htmlContent = BuildTimeAdInjector.injectSidebarAd(htmlContent);

// Runtime
RuntimeAdInjector.injectHeaderAds();
RuntimeAdInjector.injectInContentAds();
// Skip sidebar: // RuntimeAdInjector.injectSidebarAd();
```

## Responsive Behavior

### Desktop (1024px+)
- ✅ 728x90 Header Ad
- ✅ 300x250 In-Content Ads
- ✅ 160x600 Sidebar Ad (sticky)
- ✅ Native Banner
- ✅ Social Bar

### Tablet (768px - 1023px)
- ✅ 300x250 In-Content Ads (centered)
- ✅ Native Banner
- ✅ Social Bar
- ❌ Header Ads (hidden)
- ❌ Sidebar Ad (hidden)

### Mobile (< 768px)
- ✅ 320x50 Header Ad
- ✅ 300x250 In-Content Ads (full width)
- ✅ Native Banner
- ✅ Social Bar
- ❌ 728x90 Header Ad (hidden)
- ❌ 160x600 Sidebar Ad (hidden)

## Performance Optimization

### 1. Lazy Loading (Optional)

Add lazy loading to reduce initial load:

```javascript
// In app.js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      RuntimeAdInjector.injectInContentAds();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.querySelector('article'));
```

### 2. Async Script Loading

All ad scripts are loaded asynchronously to prevent blocking:

```html
<script async src="..."></script>
```

### 3. CSS Optimization

The `ads.css` file is minified and optimized for production:

```bash
# Build command (if using build tool)
npm run build:css
```

## Troubleshooting

### Ads Not Showing

1. **Check Configuration**: Verify ad keys in `config/ad-config.js`
2. **Check Placement**: Ensure article has enough paragraphs for in-content ads
3. **Check CSS**: Verify `ads.css` is loaded
4. **Check Console**: Look for JavaScript errors

### Layout Shift Issues

1. **Verify CLS Wrapper**: Check that `min-height` is set correctly
2. **Check CSS**: Ensure `display: flex` is applied
3. **Check Overflow**: Verify `overflow: hidden` is present

### Mobile Display Issues

1. **Check Viewport**: Ensure `<meta name="viewport">` is set
2. **Check CSS**: Verify media queries are correct
3. **Check Device**: Test on actual mobile device

## Advanced Usage

### Custom Injection Points

Create custom injection functions:

```javascript
class CustomAdInjector extends BuildTimeAdInjector {
  static injectCustomAd(htmlContent) {
    const customAd = `<div class="custom-ad">...</div>`;
    // Your custom logic
    return htmlContent;
  }
}
```

### A/B Testing

Test different ad placements:

```javascript
const variant = Math.random() > 0.5 ? 'variant-a' : 'variant-b';

if (variant === 'variant-a') {
  RuntimeAdInjector.injectInContentAds(); // After 4th & 8th
} else {
  RuntimeAdInjector.injectInContentAds(); // Custom positions
}
```

### Analytics Integration

Track ad performance:

```javascript
class AdAnalytics {
  static trackAdImpression(adId) {
    gtag('event', 'ad_impression', {
      'ad_id': adId,
      'timestamp': new Date().toISOString()
    });
  }
}
```

## Files Structure

```
project/
├── config/
│   └── ad-config.js              # Ad configuration
├── utils/
│   └── ad-injector.js            # Injection utilities
├── assets/
│   └── css/
│       └── ads.css               # Ad styles
├── scripts/
│   └── build-blog.js             # Build-time injection
├── assets/
│   └── js/
│       └── app.js                # Runtime injection
└── ADSTERRA_INTEGRATION_GUIDE.md  # This file
```

## Best Practices

1. **Always use CLS wrappers** - Prevents layout shift
2. **Test on multiple devices** - Ensure responsive behavior
3. **Monitor Core Web Vitals** - Use Google PageSpeed Insights
4. **Update ad codes regularly** - Keep Adsterra keys current
5. **Use async loading** - Don't block page rendering
6. **Implement error handling** - Gracefully handle ad failures

## Support

For issues or questions:
1. Check this guide first
2. Review `config/ad-config.js` comments
3. Check browser console for errors
4. Test with different ad units

## Version History

- **v1.0** (Current)
  - Initial release
  - Full CLS optimization
  - Responsive design
  - Build-time and runtime injection

---

**Last Updated**: 2026
**Maintained by**: SmartGen Development Team
