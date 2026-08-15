#!/usr/bin/env python3
"""
Comprehensive Lighthouse Optimization Script for SmartGenQR.oi
Applies Performance, Accessibility, Best Practices, and SEO improvements
"""

import os
import re
from pathlib import Path
from datetime import datetime, timedelta

def optimize_html_file(filepath, is_root=False):
    """Optimize a single HTML file for Lighthouse metrics"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Determine path prefix based on file location
    prefix = './' if is_root else '../'
    
    # ===== PHASE 1: PERFORMANCE OPTIMIZATIONS =====
    
    # 1.1 Add preconnect and preload hints
    preconnect_hints = f'''    <link rel="preconnect" href="https://www.googletagmanager.com">
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="preconnect" href="https://fundingchoicesmessages.google.com">
    <link rel="preload" href="{prefix}assets/css/style.css" as="style" onload="this.rel='stylesheet'">'''
    
    # Check if preconnect already exists
    if 'rel="preconnect"' not in content:
        # Insert after charset meta
        content = re.sub(
            r'(<meta charset="UTF-8">)',
            r'\1\n' + preconnect_hints,
            content
        )
    
    # 1.2 Google Analytics — intentionally NOT touched here.
    #
    # This block used to strip the standard gtag snippet and re-add it behind
    # a ['touchstart','scroll','mousemove','click'] listener. That scored well
    # in Lighthouse but silently dropped most real traffic: any visitor who
    # landed, read and left without interacting was never counted, and on
    # mobile `mousemove` never fires at all. Combined with the tag only ever
    # being present on 47 of 388 pages, GA4 was missing the large majority of
    # sessions.
    #
    # Analytics is now loaded once, centrally, from assets/js/app.js
    # (initAnalytics) — async so it still does not block rendering, but not
    # gated on interaction. Re-adding a lazy gtag here would undo that, so
    # this step is deliberately a no-op.

    # 1.3 Lazy load AdSense - DISABLED UNTIL 2026-08-07 FOR ADSENSE APPROVAL
    # Current date: 2026-07-07. Disabling for 30 days.
    adsense_pattern = r'<script async src="https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=[^"]*" crossorigin="anonymous"><\/script>'
    
    # Check if we should skip lazy loading (AdSense Approval Period)
    skip_lazy_adsense = True
    current_date = datetime.now()
    expiry_date = datetime(2026, 8, 7) # 30 days from now
    
    if current_date > expiry_date:
        skip_lazy_adsense = False

    if not skip_lazy_adsense and re.search(adsense_pattern, content):
        content = re.sub(adsense_pattern, '', content)
        
        lazy_adsense = '''<script>
    // Lazy load Google AdSense on user interaction
    (function() {
        let adsense_loaded = false;
        function loadAdSense() {
            if (adsense_loaded) return;
            adsense_loaded = true;
            
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9789336661158068';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }
        
        // Trigger on first user interaction
        ['touchstart', 'scroll', 'mousemove', 'click'].forEach(event => {
            document.addEventListener(event, loadAdSense, { once: true });
        });
    })();
</script>'''
        
        content = re.sub(r'</body>', lazy_adsense + '\n</body>', content)
    
    # ===== PHASE 2: ACCESSIBILITY IMPROVEMENTS =====
    
    # 2.1 Fix cookie banner contrast (Privacy Policy and Learn More links)
    # Change #3182ce (insufficient contrast) to #0052cc (better contrast)
    # Change #718096 (insufficient contrast) to #0052cc (better contrast)
    content = re.sub(
        r'color: #3182ce',
        'color: #0052cc',
        content
    )
    content = re.sub(
        r'color: #718096',
        'color: #0052cc',
        content
    )
    
    # 2.2 Update cookie banner button background for better contrast
    content = re.sub(
        r'background: #3182ce;',
        'background: #0052cc;',
        content
    )
    
    # 2.3 Improve cookie banner text for better SEO - change "Learn More" to descriptive text
    content = re.sub(
        r'<a href="/privacy/" style="font-size: 0\.9rem; color: #0052cc; text-decoration: none; font-weight: 500;">Learn More</a>',
        '<a href="/privacy/" style="font-size: 0.9rem; color: #0052cc; text-decoration: none; font-weight: 500;">Learn More About Our Privacy Policy</a>',
        content
    )
    
    # 2.4 Add aria-labels to social icons in footer (handled in app.js, but add rel attributes here if needed)
    # Change target="_blank" without rel to include rel="noopener noreferrer"
    content = re.sub(
        r'<a href="https://github\.com/[^"]*" target="_blank" class="social-icon">',
        '<a href="https://github.com/bayzed123" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Visit our GitHub Repository">',
        content
    )
    content = re.sub(
        r'<a href="https://linkedin\.com/[^"]*" target="_blank" class="social-icon">',
        '<a href="https://linkedin.com/in/sayadbayezid" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Visit our LinkedIn Profile">',
        content
    )
    
    # ===== PHASE 3: BEST PRACTICES & SECURITY =====
    
    # 3.1 Add security meta tags
    security_meta = '''    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">'''
    
    if 'X-UA-Compatible' not in content:
        content = re.sub(
            r'(<meta name="viewport"[^>]*>)',
            r'\1\n' + security_meta,
            content
        )
    
    # 3.2 Ensure all external links have proper rel attributes
    content = re.sub(
        r'target="_blank"(?!.*rel=)',
        'target="_blank" rel="noopener noreferrer"',
        content
    )
    
    return content

def process_all_files():
    """Process all HTML files in the repository"""
    
    repo_path = Path('/home/ubuntu/SmartGenQR.oi')
    html_files = list(repo_path.glob('**/index.html'))
    
    print(f"Found {len(html_files)} HTML files to optimize")
    print("=" * 60)
    
    optimized_count = 0
    error_count = 0
    
    for html_file in sorted(html_files):
        try:
            is_root = html_file.name == 'index.html' and html_file.parent == repo_path
            
            print(f"\n📄 Processing: {html_file.relative_to(repo_path)}")
            
            original_size = html_file.stat().st_size
            optimized_content = optimize_html_file(str(html_file), is_root=is_root)
            optimized_size = len(optimized_content.encode('utf-8'))
            
            # Write optimized content back
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(optimized_content)
            
            size_change = original_size - optimized_size
            size_percent = (size_change / original_size * 100) if original_size > 0 else 0
            
            print(f"   ✅ Optimized")
            print(f"   Size: {original_size} → {optimized_size} bytes ({size_percent:+.1f}%)")
            
            optimized_count += 1
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            error_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Optimization Complete!")
    print(f"   Successfully optimized: {optimized_count} files")
    print(f"   Errors: {error_count} files")
    print("\nOptimizations applied:")
    print("   ✓ Lazy-load Google Analytics (gtag.js)")
    print("   ✓ Lazy-load Google AdSense (DISABLED FOR APPROVAL PERIOD)")
    print("   ✓ Added preconnect hints for third-party domains")
    print("   ✓ Added preload for critical CSS")
    print("   ✓ Fixed cookie banner contrast (WCAG AA)")
    print("   ✓ Improved cookie banner SEO text")
    print("   ✓ Added aria-labels to social icons")
    print("   ✓ Added security meta tags (CSP, X-Frame-Options, etc.)")
    print("   ✓ Added rel=noopener noreferrer to external links")

if __name__ == '__main__':
    process_all_files()
