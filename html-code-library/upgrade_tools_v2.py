import os
import re

def upgrade_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix common syntax errors
    # Remove duplicate setMode functions
    content = re.sub(r'function setMode\(mode\) \{.*?\}', '', content, flags=re.DOTALL)
    # Add a single clean setMode function at the end of the script block
    set_mode_js = """
    function setMode(mode) {
        const $ = id => document.getElementById(id);
        if (mode === 'view') {
            $('view-code-btn').classList.add('active');
            $('edit-code-btn').classList.remove('active');
            $('view-container').classList.remove('hidden');
            $('edit-container').classList.add('hidden');
            if (typeof update === 'function') update();
        } else {
            $('view-code-btn').classList.remove('active');
            $('edit-code-btn').classList.add('active');
            $('view-container').classList.add('hidden');
            $('edit-container').classList.remove('hidden');
            $('code-edit').value = $('code-output').textContent;
        }
    }
    """

    # 2. Add Meta Tags and Shared Assets to <head>
    depth = file_path.replace('/home/ubuntu/SmartGenQR.oi/html-code-library/', '').count('/')
    prefix = '../' * depth
    
    title_match = re.search(r'<title>(.*?)</title>', content)
    tool_name = title_match.group(1).split(' - ')[0] if title_match else "SmartGen Tool"
    
    meta_assets = f"""
    <meta name="description" content="Free {tool_name} - Visually generate, preview, and copy production-ready HTML/CSS code instantly with SmartGen.">
    <meta property="og:title" content="{tool_name} | SmartGen">
    <link rel="stylesheet" href="{prefix}animations.css">
    <script src="{prefix}icons.js" defer></script>
    <script src="{prefix}preview-panel.js" defer></script>
    """
    
    if '</head>' in content:
        content = content.replace('</head>', f"{meta_assets}\n</head>")

    # 3. Add reveal-on-scroll classes to panels
    content = content.replace('class="panel"', 'class="panel reveal-on-scroll"')

    # 4. Inject Scroll Reveal Script
    scroll_reveal_js = """
    document.addEventListener('DOMContentLoaded', () => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);
        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    });
    """
    
    if '</script>' in content:
        # Find the last script tag and append our JS
        last_script_pos = content.rfind('</script>')
        content = content[:last_script_pos] + set_mode_js + scroll_reveal_js + content[last_script_pos:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    base_dir = '/home/ubuntu/SmartGenQR.oi/html-code-library'
    for root, dirs, files in os.walk(base_dir):
        if 'index.html' in files and root != base_dir:
            file_path = os.path.join(root, 'index.html')
            print(f"Upgrading: {file_path}")
            upgrade_file(file_path)

if __name__ == "__main__":
    main()
