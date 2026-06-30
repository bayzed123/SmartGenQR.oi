#!/usr/bin/env python3
import os
import re
from pathlib import Path

def remove_boilerplate(file_path):
    """
    Removes the hardcoded 'Ultimate Professional Guide' section from index.html files.
    This section is typically inside a <section class="seo-content-container"> block.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match the specific SEO content container
    # It starts with the section tag and ends with the corresponding closing tag
    pattern = r'<section class="seo-content-container".*?</section>\s*</section>'
    
    # Let's try a more robust pattern if the above doesn't catch everything
    # We look for the header "The Ultimate Professional Guide to"
    if "The Ultimate Professional Guide to" in content:
        # This regex looks for the container starting with seo-content-container 
        # and ending before the closing </main> or next major block
        new_content = re.sub(
            r'<section class="seo-content-container".*?The Ultimate Professional Guide to.*?</section>\s*</section>',
            '',
            content,
            flags=re.DOTALL
        )
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
            
    return False

def main():
    root_dir = Path('/home/ubuntu/SmartGenQR.oi')
    count = 0
    
    # Walk through all directories and find index.html files
    for html_file in root_dir.glob('**/index.html'):
        # Skip files in node_modules, .git, or the blog directory
        if any(part in html_file.parts for part in ['node_modules', '.git', 'blog', 'blog-posts']):
            continue
            
        if remove_boilerplate(html_file):
            print(f"✅ Cleaned boilerplate from: {html_file.relative_to(root_dir)}")
            count += 1
            
    print(f"\n🚀 Total pages cleaned: {count}")

if __name__ == "__main__":
    main()
