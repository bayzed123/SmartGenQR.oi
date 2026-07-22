# Reference Implementation: Integrating Component Kit into HTML Marquee Page

This guide shows how to import and use the new shared component kit in an existing tool page.

## 1. Add CSS and JS to `<head>`

```html
<!-- Add animations.css -->
<link rel="stylesheet" href="../../animations.css">

<!-- Add component scripts -->
<script src="../../icons.js" defer></script>
<script src="../../preview-panel.js" defer></script>
```

## 2. Update HTML Structure

### Preview Panel Container
Replace the existing preview div with a container for the new component:
```html
<div id="preview-container" class="panel-entrance"></div>
```

### Settings Panel
Add the `panel-entrance` class to your settings container:
```html
<div class="settings-panel panel-entrance">
    <!-- Existing controls -->
</div>
```

## 3. Initialize in JavaScript

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Preview Component
    const preview = new SmartGenPreview('preview-container', {
        debounceTime: 150
    });

    // 2. Function to update preview
    function updateToolPreview() {
        const marqueeText = document.getElementById('marquee-text').value;
        const direction = document.getElementById('direction').value;
        
        const generatedHTML = `<marquee direction="${direction}">${marqueeText}</marquee>`;
        const generatedCSS = `marquee { font-size: 20px; color: #333; }`;

        // Use the shared component to update
        preview.update(generatedHTML, generatedCSS);
    }

    // 3. Add success animation to Copy button
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', () => {
        // Your copy logic here...
        
        // Trigger animation
        copyBtn.classList.add('copy-success');
        setTimeout(() => copyBtn.classList.remove('copy-success'), 500);
    });

    // 4. Initial update
    updateToolPreview();
});
```
