#!/usr/bin/env python3
"""
AdSense Placeholder Remover for SmartGen Tools (Improved)
Removes all 'AdSense Banner Space' divs and related lazy-loading logic 
to ensure a clean user experience for AdSense review.
"""

import os
import re
from pathlib import Path

def remove_adsense_placeholders(file_path):
    """Remove AdSense placeholders and logic from a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Remove AdSense Banner Space divs
    content = re.sub(r'<div class="ad-banner-space">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<!-- End Related Tools Section --><div class="ad-banner-space">.*?</div>', '<!-- End Related Tools Section -->', content)
    content = re.sub(r'<div class="ad-banner-space">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="ad-banner-space">', '', content)
    
    # 2. Remove the lazy-loading script for AdSense
    # Pattern to match the specific lazy load block found in the files
    lazy_load_pattern = r'\s*let adsense_loaded = false;.*?window\.addEventListener\(\'(?:scroll|touchstart|mousemove|click)\', function\(\) \{.*?if \(adsense_loaded\) return;.*?adsense_loaded = true;.*?\}\);'
    content = re.sub(lazy_load_pattern, '', content, flags=re.DOTALL)
    
    # Another common pattern seen in the grep output
    script_block_pattern = r'\s*<script>\s*let adsense_loaded = false;.*?adsense_loaded = true;.*?\n\s*\}\);?\s*</script>'
    content = re.sub(script_block_pattern, '', content, flags=re.DOTALL)

    # 3. Remove any remaining adsense_loaded variables and their associated logic
    content = re.sub(r'\s*let adsense_loaded = false;.*?\n\s*\}\);', '', content, flags=re.DOTALL)

    # 4. Remove CSS for ad-banner-space if present in <style>
    content = re.sub(r'\s*\.ad-banner-space\s*\{[^}]*\}', '', content, flags=re.DOTALL)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function to clean all tool pages"""
    print("🚀 Starting Improved AdSense Placeholder Removal...\n")
    
    root_dir = Path('.')
    updated_count = 0
    failed_count = 0
    
    # Get all HTML files
    html_files = list(root_dir.glob('**/index.html'))
    
    for html_file in html_files:
        try:
            if remove_adsense_placeholders(html_file):
                print(f"✅ Cleaned: {html_file}")
                updated_count += 1
        except Exception as e:
            print(f"❌ Error cleaning {html_file}: {str(e)}")
            failed_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ AdSense Placeholder Removal Complete!")
    print(f"📊 Updated: {updated_count} files")
    print(f"❌ Failed: {failed_count} files")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
