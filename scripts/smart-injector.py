#!/usr/bin/env python3
"""
Smart Content Injector for SmartGen Tools
Automatically finds and injects RELATED tools and RELATED blog posts
into every page (tools and blogs) to ensure perfect internal linking.
"""

import os
import re
import json
from pathlib import Path

# --- DATA LOADING ---

def load_tools():
    # Extracted from search-data.js and site structure
    tools = [
        {"id": "qr-generator", "title": "QR Code Generator", "category": "Developer & Technical", "description": "Create custom QR codes for URLs, WiFi, and more.", "icon": "📱", "tags": ["qr", "wifi", "vcard", "marketing"]},
        {"id": "utm-builder", "title": "UTM Link Builder", "category": "Marketing & Social Media", "description": "Generate tracking links for marketing campaigns.", "icon": "🔗", "tags": ["marketing", "tracking", "seo", "analytics"]},
        {"id": "whatsapp-link", "title": "WhatsApp Link", "category": "Marketing & Social Media", "description": "Create direct chat links for WhatsApp.", "icon": "💬", "tags": ["marketing", "social", "chat"]},
        {"id": "meta-tag-generator", "title": "Meta Tag Generator", "category": "Developer & Technical", "description": "Boost your SEO with perfect meta tags.", "icon": "🏷️", "tags": ["seo", "meta", "technical"]},
        {"id": "robots-txt-generator", "title": "Robots.txt Generator", "category": "Developer & Technical", "description": "Create robots.txt files for search engines.", "icon": "🤖", "tags": ["seo", "technical", "crawler"]},
        {"id": "keyword-density-checker", "title": "Keyword Density Checker", "category": "SEO & Content", "description": "Analyze keyword frequency in your content.", "icon": "📊", "tags": ["seo", "content", "analysis"]},
        {"id": "schema-generator", "title": "Schema Generator", "category": "Developer & Technical", "description": "Generate JSON-LD schema markup for SEO.", "icon": "📜", "tags": ["seo", "technical", "structured data"]},
        {"id": "word-counter", "title": "Word Counter", "category": "SEO & Content", "description": "Count words, characters, and reading time.", "icon": "📝", "tags": ["content", "writing", "analysis"]},
        {"id": "password-generator", "title": "Password Generator", "category": "Daily Utilities & Calculators", "description": "Create secure, random passwords instantly.", "icon": "🔒", "tags": ["security", "privacy", "utility"]},
        {"id": "image-compressor", "title": "Image Compressor", "category": "Daily Utilities & Calculators", "description": "Reduce image size locally without uploading.", "icon": "📉", "tags": ["image", "performance", "technical"]},
        {"id": "age-calculator", "title": "Age Calculator", "category": "Daily Utilities & Calculators", "description": "Calculate exact age and date differences.", "icon": "📅", "tags": ["utility", "calculator", "date"]},
        {"id": "bmi-bmr-calculator", "title": "BMI BMR Calculator", "category": "Daily Utilities & Calculators", "description": "Calculate body mass and metabolic rate.", "icon": "⚖️", "tags": ["health", "calculator", "utility"]},
        {"id": "emi-calculator", "title": "EMI Calculator", "category": "Daily Utilities & Calculators", "description": "Calculate monthly installments and interest.", "icon": "🏦", "tags": ["finance", "calculator", "utility"]},
        {"id": "ip-address-lookup", "title": "IP Address Lookup", "category": "Developer & Technical", "description": "Find your public IP and network information.", "icon": "🌐", "tags": ["technical", "network", "security"]},
        {"id": "json-formatter-validator", "title": "JSON Formatter", "category": "Developer & Technical", "description": "Format and validate JSON data instantly.", "icon": "JSON", "tags": ["technical", "developer", "code"]},
        {"id": "serp-preview-tool", "title": "SERP Preview Tool", "category": "SEO & Content", "description": "Preview your page in Google search results.", "icon": "🔍", "tags": ["seo", "marketing", "content"]},
        {"id": "youtube-thumbnail-downloader", "title": "YouTube Thumbnail", "category": "Marketing & Social Media", "description": "Download high-quality YouTube thumbnails.", "icon": "📹", "tags": ["marketing", "social", "video"]},
    ]
    return tools

def load_blogs():
    # Extracted from blog.json
    blogs = [
        {
            "slug": "the-ultimate-advanced-all-in-one-qr-code-generator-free-secure-and-100percent-client-side",
            "title": "Ultimate QR Code Guide",
            "description": "Master the art of generating secure, advanced QR codes for business and personal use.",
            "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg",
            "tags": ["qr", "wifi", "vcard", "marketing", "security"]
        },
        {
            "slug": "how-to-optimize-your-website-for-google-adsense-approval-in-2026",
            "title": "AdSense Approval Guide",
            "description": "The definitive roadmap to getting your website approved for Google AdSense in 2026.",
            "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg",
            "tags": ["adsense", "marketing", "seo", "approval"]
        },
        {
            "slug": "top-10-essential-free-seo-tools-for-digital-marketers-in-2026",
            "title": "Top 10 SEO Tools",
            "description": "Boost your search rankings with these essential free SEO utilities.",
            "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg",
            "tags": ["seo", "marketing", "tools", "analytics"]
        },
        {
            "slug": "the-ultimate-guide-to-smartgen-tools-40-free-utilities-for-developers-marketers-and-creators",
            "title": "SmartGen Tools Master Guide",
            "description": "A comprehensive A-Z guide for all SmartGen utilities and how to use them.",
            "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg",
            "tags": ["tools", "developer", "marketing", "seo", "utility"]
        }
    ]
    return blogs

TOOLS = load_tools()
BLOGS = load_blogs()

# --- SMART MATCHING LOGIC ---

def get_related_items(current_id, current_tags, item_list, limit=3):
    """Find items that share at least one tag with the current page"""
    related = []
    for item in item_list:
        # Get ID/Slug depending on type
        item_id = item.get('id') or item.get('slug')
        if item_id == current_id:
            continue
        
        # Count matching tags
        matches = len(set(current_tags) & set(item.get('tags', [])))
        if matches > 0:
            related.append((item, matches))
    
    # Sort by number of matches and return top items
    related.sort(key=lambda x: x[1], reverse=True)
    results = [x[0] for x in related[:limit]]
    
    # If not enough related, add random ones to fill
    if len(results) < limit:
        remaining = [i for i in item_list if (i.get('id') or i.get('slug')) != current_id and i not in results]
        import random
        results.extend(random.sample(remaining, min(limit - len(results), len(remaining))))
        
    return results

# --- TEMPLATES ---

RELATED_TOOLS_HTML = '''
<section class="related-tools-smart" style="margin: 3rem 0; padding: 2rem; background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0;">
    <h3 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 1.5rem;">🛠️ Related Professional Tools</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
        {cards}
    </div>
</section>
'''

TOOL_CARD_HTML = '''
        <a href="/{id}/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #edf2f7; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='#2563eb';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#edf2f7';">
            <div style="font-size: 1.8rem;">{icon}</div>
            <div>
                <h4 style="margin: 0; font-size: 1rem; color: #0f172a;">{title}</h4>
                <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: #64748b;">{category}</p>
            </div>
        </a>
'''

RECOMMENDED_BLOGS_HTML = '''
<section class="recommended-blogs-smart" style="margin: 3rem 0; padding: 2rem; background: #0f172a; border-radius: 20px; color: white;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.5rem; margin: 0;">📖 Recommended Reading</h3>
        <a href="/blog/" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem; font-weight: 600;">View All →</a>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        {cards}
    </div>
</section>
'''

BLOG_CARD_HTML = '''
        <a href="/blog/{slug}/" style="text-decoration: none; color: inherit; display: block; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.08)';" onmouseout="this.style.background='rgba(255,255,255,0.05)';">
            <div style="padding: 1rem;">
                <h4 style="margin: 0 0 0.5rem; font-size: 1.1rem; color: #f8fafc;">{title}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: #94a3b8; line-height: 1.4;">{description}</p>
            </div>
        </a>
'''

# --- INJECTION LOGIC ---

def process_file(file_path, is_blog=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Determine current ID and Tags
    current_id = ""
    current_tags = []
    
    if is_blog:
        # Extract slug from path
        current_id = file_path.parent.name
        # Find blog data
        blog_data = next((b for b in BLOGS if b['slug'] == current_id), None)
        if blog_data:
            current_tags = blog_data['tags']
    else:
        # Extract tool ID from path
        current_id = file_path.parent.name
        # Find tool data
        tool_data = next((t for t in TOOLS if t['id'] == current_id), None)
        if tool_data:
            current_tags = tool_data['tags']
    
    # 1. Clean old sections
    content = re.sub(r'<section class="related-tools-smart".*?</section>', '', content, flags=re.DOTALL)
    content = re.sub(r'<section class="recommended-blogs-smart".*?</section>', '', content, flags=re.DOTALL)
    content = re.sub(r'<section class="related-tools-static".*?</section>', '', content, flags=re.DOTALL)
    content = re.sub(r'<section class="recommended-blog-static".*?</section>', '', content, flags=re.DOTALL)
    content = re.sub(r'<section class="ux-guide-section".*?</section>', '', content, flags=re.DOTALL)

    # 2. Generate Smart Content
    related_tools = get_related_items(current_id, current_tags, TOOLS, limit=3)
    recommended_blogs = get_related_items(current_id, current_tags, BLOGS, limit=3)
    
    tool_cards = "".join([TOOL_CARD_HTML.format(**t) for t in related_tools])
    blog_cards = "".join([BLOG_CARD_HTML.format(**b) for b in recommended_blogs])
    
    tools_section = RELATED_TOOLS_HTML.format(cards=tool_cards)
    blogs_section = RECOMMENDED_BLOGS_HTML.format(cards=blog_cards)
    
    # 3. Inject
    injection = f"\n{tools_section}\n{blogs_section}\n"
    
    # Find insertion point
    insertion_point = None
    if is_blog:
        # For blogs, insert before footer
        match = re.search(r'<footer', content)
        if match:
            insertion_point = match.start()
    else:
        # For tools, insert after seo-content or before footer
        match = re.search(r'</article>\s*(?=</section>)', content)
        if match:
            insertion_point = match.end()
        else:
            match = re.search(r'<footer', content)
            if match:
                insertion_point = match.start()

    if insertion_point:
        content = content[:insertion_point] + injection + content[insertion_point:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    print("🚀 Starting Smart Related Content Injection...\n")
    root_dir = Path('.')
    
    # 1. Process Tools
    tool_count = 0
    for index_path in root_dir.glob('**/index.html'):
        if 'assets' in str(index_path) or 'blog' in str(index_path) or 'scripts' in str(index_path):
            continue
        if process_file(index_path, is_blog=False):
            tool_count += 1
            print(f"✅ Tool Updated: {index_path.parent.name}")

    # 2. Process Blogs
    blog_count = 0
    blog_dir = root_dir / 'blog'
    if blog_dir.exists():
        for index_path in blog_dir.glob('**/index.html'):
            if index_path.parent == blog_dir: continue # Skip main blog index
            if process_file(index_path, is_blog=True):
                blog_count += 1
                print(f"✅ Blog Updated: {index_path.parent.name}")

    print(f"\n📊 Summary: {tool_count} Tools and {blog_count} Blogs updated with smart related content.")

if __name__ == '__main__':
    main()
