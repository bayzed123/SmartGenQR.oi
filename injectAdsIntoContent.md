```markdown
# Automated Ad Integration & CLS Prevention Guidelines

This document outlines the standard operating procedures for injecting Adsterra ad units dynamically into the `smartgentools.com` content ecosystem. The primary objective is to maximize monetization without compromising the 100% Core Web Vitals score (Zero Cumulative Layout Shift).

---

## 1. Core Principles

*   **Zero CLS (Cumulative Layout Shift):** Every iframe or ad script must be enclosed within a parent `<div>` that has a predefined `min-height` matching the ad unit. 
*   **Fully Automated:** Ads must be injected dynamically via `build-blog.js` during the build process or client-side DOM traversal. No manual ad placement inside markdown files.
*   **Device-Specific Rendering:** Desktop ads (e.g., 160x600, 728x90) must be hidden on mobile devices, and mobile ads (e.g., 320x50) must be hidden on desktops using CSS media queries.

---

## 2. Standard Ad Wrapper Structure

To prevent layout shifts before the ad network responds, use the following flexbox wrapper for all banner ad units:

```html
<div class="ad-container ad-[unit-size]" style="min-height: [AD_HEIGHT]px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
    <!-- Adsterra Script Goes Here -->
</div>

```
## 3. Ad Units & Injection Logic
### A. In-Content Banners (300x250 Medium Rectangle)
 * **Target:** Mobile & Desktop.
 * **Injection Rule:** Parse the main article body. Count the <p> tags. Inject the first 300x250 unit immediately after the **4th paragraph**, and the second unit after the **8th paragraph**.
 * **Wrapper Height:** 250px
 * **Code:**
   ```html
   <div class="ad-container ad-300x250" style="min-height: 250px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
       <script>
         atOptions = { 'key' : 'f7aab91a9a0a262448277c24ba0763d1', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
       </script>
       <script src="[https://www.highperformanceformat.com/f7aab91a9a0a262448277c24ba0763d1/invoke.js](https://www.highperformanceformat.com/f7aab91a9a0a262448277c24ba0763d1/invoke.js)"></script>
   </div>
   
   ```
### B. Sticky Sidebar (160x600 Wide Skyscraper)
 * **Target:** Desktop Only.
 * **Injection Rule:** Inject into the sidebar component template. Apply CSS position: sticky; top: 20px;. Hide on screens < 1024px.
 * **Wrapper Height:** 600px
 * **Code:**
   ```html
   <div class="ad-container ad-160x600 d-none d-lg-flex" style="min-height: 600px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
       <script>
         atOptions = { 'key' : '96e8bb0db46b2c8ef669fa310ed45f8b', 'format' : 'iframe', 'height' : 600, 'width' : 160, 'params' : {} };
       </script>
       <script src="[https://www.highperformanceformat.com/96e8bb0db46b2c8ef669fa310ed45f8b/invoke.js](https://www.highperformanceformat.com/96e8bb0db46b2c8ef669fa310ed45f8b/invoke.js)"></script>
   </div>
   
   ```
### C. Desktop Leaderboard (728x90)
 * **Target:** Desktop Only.
 * **Injection Rule:** Inject directly below the main <h1> title or global header component. Hide on screens < 768px.
 * **Wrapper Height:** 90px
 * **Code:**
   ```html
   <div class="ad-container ad-728x90 d-none d-md-flex" style="min-height: 90px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;">
       <script>
         atOptions = { 'key' : 'f9d4f2f3a29a9dcfb43dddf1fd33eb88', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
       </script>
       <script src="[https://www.highperformanceformat.com/f9d4f2f3a29a9dcfb43dddf1fd33eb88/invoke.js](https://www.highperformanceformat.com/f9d4f2f3a29a9dcfb43dddf1fd33eb88/invoke.js)"></script>
   </div>
   
   ```
### D. Mobile Leaderboard (320x50)
 * **Target:** Mobile Only.
 * **Injection Rule:** Inject at the very top of the content or right below the mobile navigation menu. Hide on screens >= 768px.
 * **Wrapper Height:** 50px
 * **Code:**
   ```html
   <div class="ad-container ad-320x50 d-flex d-md-none" style="min-height: 50px; display: flex; justify-content: center; align-items: center; margin: 10px 0; overflow: hidden;">
       <script>
         atOptions = { 'key' : '6af746fdd2244652b728e73b1a70db61', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };
       </script>
       <script src="[https://www.highperformanceformat.com/6af746fdd2244652b728e73b1a70db61/invoke.js](https://www.highperformanceformat.com/6af746fdd2244652b728e73b1a70db61/invoke.js)"></script>
   </div>
   
   ```
### E. End-of-Content (Native Banner)
 * **Target:** Mobile & Desktop.
 * **Injection Rule:** Inject dynamically at the end of the markdown content body, immediately before the author bio or related posts section.
 * **Code:**
   ```html
   <div class="ad-container ad-native" style="margin: 30px 0; overflow: hidden;">
       <script async="async" data-cfasync="false" src="[https://pl30322059.effectivecpmnetwork.com/333d7660ba0ab1f7a20095918a984f02/invoke.js](https://pl30322059.effectivecpmnetwork.com/333d7660ba0ab1f7a20095918a984f02/invoke.js)"></script>
       <div id="container-333d7660ba0ab1f7a20095918a984f02"></div>
   </div>
   
   ```
### F. Global Footer (Social Bar)
 * **Target:** Mobile & Desktop.
 * **Injection Rule:** Append directly before the closing </body> tag in the global layout template.
 * **Code:**
   ```html
   <!-- Adsterra Social Bar -->
   <script src="[https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js](https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js)"></script>
   
   ```
## 4. build-blog.js Implementation Requirements
When updating the build script to handle these injections, adhere to the following logic flow:
 1. **Parse Markdown to HTML:** Convert the raw .md content into an HTML string.
 2. **Traverse the DOM/String:** Split the parsed HTML by <p> tags.
 3. **Splice Ad Arrays:** Insert the specific HTML wrapper blocks after index 3 (4th paragraph) and index 7 (8th paragraph).
 4. **Reassemble & Render:** Join the array back into a single HTML string and pass it to the layout template for final static generation.
```
# Following promt Use : 
Act as a Senior Full-Stack Developer specializing in Node.js, Static Site Generation (SSG), and DOM manipulation. I want to fully automate the Adsterra ad integration so I never have to manually place ads in my daily content updates.

I am using a custom build process/script (specifically `build-blog.js` and frontend `app.js`). I need you to write the automation logic that dynamically injects the ad units into my content templates either during the build time (via Node.js string/HTML parsing in build-blog.js) or runtime (via client-side DOM traversal in app.js).

Here are the strict automation rules you must implement:

1. Auto In-Content Injection (300x250): Write a function that parses the main article content, counts the paragraph (`<p>`) tags, and automatically injects the wrapped 300x250 ad HTML string immediately after the 4th and 8th paragraphs.
2. Layout Injection (Headers & Sidebar): Automate the injection of the 728x90 ad into the desktop header area, the 320x50 ad into the mobile header, and the 160x600 ad into the sidebar component.
3. Bottom Content Injection (Native Banner): Automatically append the Native Banner HTML string at the very end of the article content, right before the author box or related posts block.
4. Global Footer (Social Bar): Inject the Social Bar script just before the `</body>` tag in the global layout template.

Mandatory CLS Rule: The automated injection strings MUST include the CLS-prevention wrapper `<div>` with the correct `min-height`, `display: flex`, and `overflow: hidden` properties as discussed earlier.

Please tell me if you are ready. I will then paste the current code of my `build-blog.js` and `app.js` files, and you will rewrite them to include this fully automated, CLS-optimized ad injection system.
Act as a Senior Frontend Developer and Technical SEO Expert. I need you to integrate the following Adsterra ad units into my website's architecture dynamically.

**Primary Goal:** Maintain a 100% Core Web Vitals score (Zero Cumulative Layout Shift - CLS is mandatory) and ensure a non-intrusive, premium User Experience (UX).

**Strict Architectural Rules for CLS Prevention:**
Every iframe banner ad script MUST be wrapped in a container `<div>` using this exact inline CSS logic to reserve space before the ad loads:
`style="min-height: [AD_HEIGHT]px; display: flex; justify-content: center; align-items: center; margin: 20px 0; overflow: hidden;"`

Here are the Ad Units, their exact codes, and their strict placement rules:

### 1. Social Bar
- **Placement:** Inject this script right before the closing `</body>` tag. Ensure its z-index doesn't block critical mobile navigation.
- **Code:**
<script src="https://pl30322061.effectivecpmnetwork.com/f1/52/ca/f152ca4aaee504006bf6b462c2535ea8.js"></script>

### 2. Native Banner
- **Placement:** Bottom of the main article content, just before the author box, related posts, or footer.
- **Code:**
<script async="async" data-cfasync="false" src="https://pl30322059.effectivecpmnetwork.com/333d7660ba0ab1f7a20095918a984f02/invoke.js"></script>
<div id="container-333d7660ba0ab1f7a20095918a984f02"></div>

### 3. 300x250 (Medium Rectangle)
- **Placement:** In-content. Inject dynamically after the 4th and 8th paragraphs. Must look natural on both mobile and desktop.
- **Wrapper Height:** `min-height: 250px;`
- **Code:**
<script>
  atOptions = {
    'key' : 'f7aab91a9a0a262448277c24ba0763d1',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/f7aab91a9a0a262448277c24ba0763d1/invoke.js"></script>

### 4. 160x600 (Wide Skyscraper)
- **Placement:** Desktop sidebar only. Must be sticky on scroll. STRICTLY hidden (`display: none`) on mobile and tablet devices via CSS media queries.
- **Wrapper Height:** `min-height: 600px;`
- **Code:**
<script>
  atOptions = {
    'key' : '96e8bb0db46b2c8ef669fa310ed45f8b',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/96e8bb0db46b2c8ef669fa310ed45f8b/invoke.js"></script>

### 5. 728x90 (Desktop Leaderboard)
- **Placement:** Desktop only. Place directly below the main H1 title or main header area. Hide on mobile devices.
- **Wrapper Height:** `min-height: 90px;`
- **Code:**
<script>
  atOptions = {
    'key' : 'f9d4f2f3a29a9dcfb43dddf1fd33eb88',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/f9d4f2f3a29a9dcfb43dddf1fd33eb88/invoke.js"></script>

### 6. 320x50 (Mobile Leaderboard)
- **Placement:** Mobile devices only. Place right below the mobile header or at the very top of the content. Hide on desktop.
- **Wrapper Height:** `min-height: 50px;`
- **Code:**
<script>
  atOptions = {
    'key' : '6af746fdd2244652b728e73b1a70db61',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/6af746fdd2244652b728e73b1a70db61/invoke.js"></script>

### 7. 468x60 (General Banner)
- **Placement:** Flexible fallback. Use this in the middle of long content blocks where the 300x250 isn't used, or for tablet-specific layouts.
- **Wrapper Height:** `min-height: 60px;`
- **Code:**
<script>
  atOptions = {
    'key' : '0b5fea20f0ed426f24c4fc004a095026',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/0b5fea20f0ed426f24c4fc004a095026/invoke.js"></script>

Please provide the optimized integration code (HTML/JS/CSS logic or CMS-specific implementation approach) reflecting these constraints.
```
