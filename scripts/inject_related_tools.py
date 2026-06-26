import os
import re
from pathlib import Path

def inject_related_tools(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove old injections if they exist
    content = re.sub(r'<!-- Related Tools Section -->.*?<!-- End Related Tools Section -->', '', content, flags=re.DOTALL)
    content = re.sub(r'<div id="dynamic-related-tools"></div>', '', content)
    
    # 2. Add related-tools.js script if not present
    if 'related-tools.js' not in content:
        script_tag = '    <script src="../assets/js/related-tools.js" defer></script>'
        if 'search.js' in content:
            content = content.replace('search.js" defer></script>', 'search.js" defer></script>\n' + script_tag)
        elif 'app.js' in content:
            content = content.replace('app.js" defer></script>', 'app.js" defer></script>\n' + script_tag)

    # 3. Find the exact insertion point
    insertion_point = None
    if '<div class="tool-container">' in content:
        match = re.search(r'</div>\s*(?=<article|<section class="seo-content")', content)
        if match:
            insertion_point = match.end()

    if not insertion_point:
        match = re.search(r'</section>\s*(?=<article)', content)
        if match:
            insertion_point = match.end()

    if insertion_point:
        new_div = '\n        <!-- Related Tools Section -->\n        <div id="dynamic-related-tools" class="container"></div>\n        <!-- End Related Tools Section -->'
        content = content[:insertion_point] + new_div + content[insertion_point:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    root_dir = Path('.')
    count = 0
    for html_file in root_dir.glob('**/index.html'):
        if html_file.parent == root_dir:
            continue
        if inject_related_tools(html_file):
            count += 1
    print(f"🚀 Total pages updated: {count}")

if __name__ == "__main__":
    main()
