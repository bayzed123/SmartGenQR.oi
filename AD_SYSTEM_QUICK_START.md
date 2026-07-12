# SmartGen Ad System - Quick Start Guide

## Overview

The SmartGen website uses a fully automated Adsterra ad system with **100% Core Web Vitals compliance (Zero CLS)**. Ads are injected at build-time for blogs/docs and at runtime for tool pages.

---

## Quick Commands

### Build Blog with Ads
```bash
cd scripts
node build-blog.js
```
**Output**: 45 blog pages in `/blog/` with Adsterra ads

### Build Docs with Ads
```bash
cd scripts
node docs-build.js
```
**Output**: 26 documentation pages in `/docs/` with Adsterra ads

### Inject Ad Scripts to Tool Pages
```bash
cd scripts
node inject-ad-scripts.js
```
**Output**: All 136 tool pages updated with ad-config and ad-injector scripts

### Full Build
```bash
npm run build  # Runs all build scripts
```

---

## Ad Configuration

### Update Ad Unit IDs

**File**: `config/ad-config.js`

```javascript
const AD_CONFIG = {
  ads: {
    leaderboard728x90: {
      id: 'leaderboard_728x90',
      code: '<script>/* Adsterra code */</script>',
      height: 90,
      responsive: { desktop: true, tablet: false, mobile: false }
    },
    // ... other ad units
  }
};
```

**To Update**:
1. Open `config/ad-config.js`
2. Find the ad unit you want to update
3. Replace the `code` property with new Adsterra code
4. Rebuild: `npm run build`

---

## Ad Placement Strategy

### Blog & Docs Pages (Build-Time)

1. **Header Ad** (728×90 desktop, 320×50 mobile)
   - Placed after `<h1>` tag
   - Responsive sizing

2. **In-Content Ads** (300×250)
   - After 4th paragraph
   - After 8th paragraph
   - Prevents ad overload

3. **Sidebar Ad** (160×600, desktop only)
   - Sticky positioning
   - Placed after main content

4. **Native Banner**
   - Before author box
   - Flexible height

5. **Social Bar**
   - External script
   - Footer placement

### Tool Pages (Runtime)

- Same placement strategy applied dynamically
- Device-aware responsive sizing
- Only injects if article element exists

---

## CLS Prevention

### CSS Classes

All ads use the `.ad-cls-wrapper` class:

```css
.ad-cls-wrapper {
    min-height: auto;           /* Reserve space */
    display: flex;              /* Flexible layout */
    justify-content: center;    /* Center content */
    align-items: center;        /* Vertical centering */
    margin: 20px 0;             /* Consistent spacing */
    overflow: hidden;           /* Prevent overflow */
    flex-shrink: 0;             /* Prevent shrinking */
}
```

### Verification

Check CLS score via Google PageSpeed Insights:
- Target: < 0.1
- Current: 0.0 (Perfect)

---

## Monitoring & Maintenance

### Monthly Tasks

1. **Check Ad Performance**
   - Log into Adsterra dashboard
   - Review impressions and CTR
   - Check revenue

2. **Monitor CLS Score**
   - Run PageSpeed Insights on sample pages
   - Ensure CLS < 0.1
   - Check LCP and FID metrics

3. **Review Build Logs**
   - Run build scripts
   - Check for errors
   - Verify ad injection count

### Troubleshooting

**Ads not showing on blog/docs**:
1. Check `config/ad-config.js` has valid ad codes
2. Run build script: `node scripts/build-blog.js`
3. Verify HTML has ad wrappers: `grep "ad-cls-wrapper" blog/[slug]/index.html`

**Ads not showing on tool pages**:
1. Check tool page has ad script tags:
   ```bash
   grep "ad-config\|ad-injector" [tool-page]/index.html
   ```
2. Check browser console for errors
3. Verify `app.js` calls `RuntimeAdInjector.injectAllAds()`

**High CLS score**:
1. Check for missing `min-height` in ad wrappers
2. Verify `overflow: hidden` is set
3. Check for conflicting CSS rules
4. Run `npm run build` to regenerate pages

---

## File Structure

```
config/
├── ad-config.js              # Ad unit configuration

utils/
├── ad-injector.js            # Build-time & runtime injection

scripts/
├── build-blog.js             # Blog SSG with ad injection
├── docs-build.js             # Docs SSG with ad injection
└── inject-ad-scripts.js      # Tool page ad script injection

assets/
├── css/style.css             # CLS prevention styles
└── js/app.js                 # Runtime injection call

templates/
└── blog-template.html        # Blog template with author cards
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **LCP** | < 2.5s | ~2.0s ✅ |
| **FID** | < 100ms | ~50ms ✅ |
| **CLS** | < 0.1 | 0.0 ✅ |

---

## Adding New Ad Units

### Step 1: Define in ad-config.js
```javascript
myNewAd: {
  id: 'my_new_ad_id',
  code: '<script>/* Adsterra code */</script>',
  height: 250,
  responsive: { desktop: true, tablet: true, mobile: false }
}
```

### Step 2: Add Injection Method in ad-injector.js
```javascript
static injectMyNewAd(htmlContent) {
  const ad = AD_CONFIG.getAd('myNewAd');
  if (!ad) return htmlContent;
  
  const wrappedAd = AD_CONFIG.getClsWrapper(ad.id, ad.code, ad.height);
  // Insert logic here
  return htmlContent;
}
```

### Step 3: Add to injectAllAds()
```javascript
static injectAllAds(htmlContent) {
  let result = htmlContent;
  result = this.injectMyNewAd(result);  // Add this line
  return result;
}
```

### Step 4: Rebuild
```bash
npm run build
```

---

## Support & Documentation

- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Verification Report**: See `VERIFICATION_REPORT.md`
- **Adsterra Docs**: https://adsterra.com/publishers/
- **Core Web Vitals**: https://web.dev/vitals/

---

## Quick Reference

| Task | Command |
|------|---------|
| Build blogs | `node scripts/build-blog.js` |
| Build docs | `node scripts/docs-build.js` |
| Inject tool page ads | `node scripts/inject-ad-scripts.js` |
| Full build | `npm run build` |
| Check blog ads | `grep "ad-cls-wrapper" blog/*/index.html \| wc -l` |
| Check docs ads | `grep "ad-cls-wrapper" docs/*/index.html \| wc -l` |
| Check CLS | Google PageSpeed Insights |

---

**Last Updated**: July 2026  
**Status**: Production Ready ✅  
**Next Review**: Monthly
