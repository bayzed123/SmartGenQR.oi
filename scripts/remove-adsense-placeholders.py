#!/usr/bin/env python3
"""
Master AdSense Placeholder Remover
Optimized for SmartGen Tools: Removes visual placeholders and CSS only.
Strictly preserves all Lazy Loading JavaScript logic.
"""

import re
from pathlib import Path

def remove_adsense_placeholders(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Remove visual AdSense containers
    content = re.sub(r'<div class="ad-banner-space">.*?</div>', '', content, flags=re.DOTALL)
    
    # 2. Remove associated CSS styles
    content = re.sub(r'\.ad-banner-space\s*\{[^}]*\}', '', content, flags=re.DOTALL)

    # 3. Normalize excessive blank lines to keep source clean
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Only write to disk if changes were actually made (I/O optimization)
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    print("🚀 Running Master AdSense Cleanup...")
    
    root_dir = Path('.')
    updated_count = 0
    
    # Efficiently gather all target HTML files
    html_files = list(root_dir.glob('**/index.html'))
    
    for html_file in html_files:
        try:
            if remove_adsense_placeholders(html_file):
                print(f"✅ Cleaned: {html_file}")
                updated_count += 1
        except Exception as e:
            print(f"❌ Error processing {html_file}: {str(e)}")
    
    print(f"\n✅ Total files optimized: {updated_count}")

if __name__ == '__main__':
    main()