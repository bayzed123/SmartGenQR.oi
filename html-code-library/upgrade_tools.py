import os
import re
from bs4 import BeautifulSoup

def upgrade_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix common syntax errors (like duplicate function definitions or missing closing tags)
    # The user mentioned syntax errors, often seen in the sample files (e.g., duplicate setMode)
    
    # Remove duplicate setMode functions if they exist
    set_mode_pattern = re.compile(r'function setMode\(mode\) \{.*?\}', re.DOTALL)
    matches = set_mode_pattern.findall(content)
    if len(matches) > 1:
        content = content.replace(matches[1], "")

    soup = BeautifulSoup(content, 'html.parser')
    
    # 2. Add Meta Tags if missing
    head = soup.find('head')
    if head:
        title = soup.title.string if soup.title else "SmartGen Tool"
        tool_name = title.split(' - ')[0]
        
        # Add description
        if not soup.find('meta', attrs={'name': 'description'}):
            desc = soup.new_tag('meta', attrs={'name': 'description', 'content': f"Free {tool_name} - Visually generate, preview, and copy production-ready HTML/CSS code instantly with SmartGen."})
            head.append(desc)
        
        # Add Open Graph
        if not soup.find('meta', attrs={'property': 'og:title'}):
            og_title = soup.new_tag('meta', attrs={'property': 'og:title', 'content': f"{tool_name} | SmartGen"})
            head.append(og_title)
            
        # Add animations.css link
        depth = file_path.replace('/home/ubuntu/SmartGenQR.oi/html-code-library/', '').count('/')
        prefix = '../' * depth
        if not soup.find('link', attrs={'href': f"{prefix}animations.css"}):
            anim_link = soup.new_tag('link', attrs={'rel': 'stylesheet', 'href': f"{prefix}animations.css"})
            head.append(anim_link)
            
        # Add icons.js and preview-panel.js
        if not soup.find('script', attrs={'src': f"{prefix}icons.js"}):
            icons_script = soup.new_tag('script', attrs={'src': f"{prefix}icons.js", 'defer': ''})
            head.append(icons_script)
        if not soup.find('script', attrs={'src': f"{prefix}preview-panel.js"}):
            preview_script = soup.new_tag('script', attrs={'src': f"{prefix}preview-panel.js", 'defer': ''})
            head.append(preview_script)

    # 3. Add reveal-on-scroll classes to panels
    for panel in soup.find_all(class_='panel'):
        if 'reveal-on-scroll' not in panel.get('class', []):
            panel['class'] = panel.get('class', []) + ['reveal-on-scroll']

    # 4. Inject Scroll Reveal Script before </body>
    if not soup.find('script', string=re.compile('IntersectionObserver')):
        reveal_script = soup.new_tag('script')
        reveal_script.string = """
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
        soup.body.append(reveal_script)

    # Save the upgraded file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

def main():
    base_dir = '/home/ubuntu/SmartGenQR.oi/html-code-library'
    for root, dirs, files in os.walk(base_dir):
        if 'index.html' in files and root != base_dir:
            file_path = os.path.join(root, 'index.html')
            print(f"Upgrading: {file_path}")
            try:
                upgrade_file(file_path)
            except Exception as e:
                print(f"Error upgrading {file_path}: {e}")

if __name__ == "__main__":
    main()
