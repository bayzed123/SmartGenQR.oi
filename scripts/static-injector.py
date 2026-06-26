#!/usr/bin/env python3
"""
Static Content Injector for SmartGen Tools
Hard-codes Related Tools, Recommended Blog Posts, and User Experience Guides
directly into HTML files for better SEO and AdSense approval.
"""

import os
import re
import json
from pathlib import Path

# --- CONFIGURATION & DATA ---

# Load tools from search-data.js (manual extraction for reliability)
TOOLS = [
    {"id": "qr-generator", "title": "QR Code Generator", "category": "Developer & Technical", "description": "Create custom QR codes for URLs, WiFi, and more.", "icon": "📱"},
    {"id": "utm-builder", "title": "UTM Link Builder", "category": "Marketing & Social Media", "description": "Generate tracking links for your marketing campaigns.", "icon": "🔗"},
    {"id": "whatsapp-link", "title": "WhatsApp Link", "category": "Marketing & Social Media", "description": "Create direct chat links for WhatsApp.", "icon": "💬"},
    {"id": "meta-tag-generator", "title": "Meta Tag Generator", "category": "Developer & Technical", "description": "Boost your SEO with perfect meta tags.", "icon": "🏷️"},
    {"id": "robots-txt-generator", "title": "Robots.txt Generator", "category": "Developer & Technical", "description": "Create robots.txt files for search engines.", "icon": "🤖"},
    {"id": "keyword-density-checker", "title": "Keyword Density Checker", "category": "SEO & Content", "description": "Analyze keyword frequency in your content.", "icon": "📊"},
    {"id": "schema-generator", "title": "Schema Generator", "category": "Developer & Technical", "description": "Generate JSON-LD schema markup for SEO.", "icon": "📜"},
    {"id": "word-counter", "title": "Word Counter", "category": "SEO & Content", "description": "Count words, characters, and reading time.", "icon": "📝"},
    {"id": "password-generator", "title": "Password Generator", "category": "Daily Utilities & Calculators", "description": "Create secure, random passwords instantly.", "icon": "🔒"},
    {"id": "image-compressor", "title": "Image Compressor", "category": "Daily Utilities & Calculators", "description": "Reduce image size locally without uploading.", "icon": "📉"},
]

# Load blog posts from blog.json
BLOG_POSTS = [
    {
        "slug": "the-ultimate-advanced-all-in-one-qr-code-generator-free-secure-and-100percent-client-side",
        "title": "Ultimate QR Code Guide",
        "description": "Learn how to use QR codes for business and personal use.",
        "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg"
    },
    {
        "slug": "how-to-optimize-your-website-for-google-adsense-approval-in-2026",
        "title": "AdSense Approval Guide",
        "description": "Master the art of getting approved by AdSense.",
        "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg"
    },
    {
        "slug": "top-10-essential-free-seo-tools-for-digital-marketers-in-2026",
        "title": "Top 10 SEO Tools",
        "description": "Essential free tools for every digital marketer.",
        "image": "https://i.ibb.co/HTZdyPzF/IMG-4320.jpg"
    }
]

# --- TEMPLATES ---

UX_GUIDE_TEMPLATE = '''
<section class="ux-guide-section" style="margin: 3rem 0; padding: 2.5rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
    <div class="ux-header" style="text-align: center; margin-bottom: 2.5rem;">
        <h2 style="font-size: 2rem; color: #1e293b; margin-bottom: 1rem;">🚀 User Experience & Resource Guide</h2>
        <p style="color: #64748b; font-size: 1.1rem; max-width: 700px; margin: 0 auto;">Master our tools with these expert resources and best practice guides designed for your success.</p>
    </div>
    
    <div class="ux-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div class="ux-card" style="padding: 2rem; background: white; border-radius: 15px; border: 1px solid #f1f5f9; transition: transform 0.3s ease;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">📚</div>
            <h3 style="margin-bottom: 1rem; color: #0f172a;">Knowledge Base</h3>
            <p style="color: #475569; margin-bottom: 1.5rem; font-size: 0.95rem;">Access our comprehensive documentation and step-by-step tutorials to get the most out of SmartGen.</p>
            <a href="/about/" style="display: inline-block; padding: 0.8rem 1.5rem; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Explore Docs</a>
        </div>
        
        <div class="ux-card" style="padding: 2rem; background: white; border-radius: 15px; border: 1px solid #f1f5f9; transition: transform 0.3s ease;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🛡️</div>
            <h3 style="margin-bottom: 1rem; color: #0f172a;">Privacy & Trust</h3>
            <p style="color: #475569; margin-bottom: 1.5rem; font-size: 0.95rem;">Learn how we protect your data with 100% client-side processing and our commitment to transparency.</p>
            <a href="/privacy/" style="display: inline-block; padding: 0.8rem 1.5rem; background: #0f172a; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Privacy Center</a>
        </div>
        
        <div class="ux-card" style="padding: 2rem; background: white; border-radius: 15px; border: 1px solid #f1f5f9; transition: transform 0.3s ease;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">💡</div>
            <h3 style="margin-bottom: 1rem; color: #0f172a;">Expert Support</h3>
            <p style="color: #475569; margin-bottom: 1.5rem; font-size: 0.95rem;">Need help or have a suggestion? Our technical team is ready to assist you with any tool-related queries.</p>
            <a href="/contact/" style="display: inline-block; padding: 0.8rem 1.5rem; border: 2px solid #2563eb; color: #2563eb; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Get Support</a>
        </div>
    </div>
</section>
'''

RELATED_TOOLS_TEMPLATE = '''
<section class="related-tools-static" style="margin: 4rem 0;">
    <h2 style="font-size: 1.8rem; color: #1e293b; margin-bottom: 2rem; text-align: center;">🛠️ Related Professional Tools</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
        {tool_cards}
    </div>
</section>
'''

TOOL_CARD_TEMPLATE = '''
        <a href="/{id}/" style="text-decoration: none; color: inherit; display: block; background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='#2563eb';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#e2e8f0';">
            <div style="font-size: 2rem; margin-bottom: 1rem;">{icon}</div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #0f172a;">{title}</h3>
            <p style="font-size: 0.85rem; color: #64748b; margin: 0;">{description}</p>
        </a>
'''

RECOMMENDED_BLOG_TEMPLATE = '''
<section class="recommended-blog-static" style="margin: 4rem 0; padding: 3rem; background: #0f172a; border-radius: 24px; color: white;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;">
        <h2 style="font-size: 2rem; margin: 0;">📖 Recommended Reading</h2>
        <a href="/blog/" style="color: #3b82f6; text-decoration: none; font-weight: 600;">View All Posts →</a>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
        {blog_cards}
    </div>
</section>
'''

BLOG_CARD_TEMPLATE = '''
        <a href="/blog/{slug}/" style="text-decoration: none; color: inherit; display: block; background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.08)';" onmouseout="this.style.background='rgba(255,255,255,0.05)';">
            <img src="{image}" alt="{title}" style="width: 100%; height: 180px; object-fit: cover;">
            <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.2rem; margin-bottom: 0.8rem; color: #f8fafc;">{title}</h3>
                <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin: 0;">{description}</p>
            </div>
        </a>
'''

# --- LOGIC ---

def get_related_tools(current_tool_id, category=None):
    """Get 4 related tools, prioritizing same category"""
    related = [t for t in TOOLS if t['id'] != current_tool_id]
    
    # Simple shuffle-like selection for now
    import random
    selected = random.sample(related, min(4, len(related)))
    
    cards_html = ""
    for tool in selected:
        cards_html += TOOL_CARD_TEMPLATE.format(**tool)
    
    return RELATED_TOOLS_TEMPLATE.format(tool_cards=cards_html)

def get_recommended_blogs():
    """Get static blog cards"""
    cards_html = ""
    for post in BLOG_POSTS:
        cards_html += BLOG_CARD_TEMPLATE.format(**post)
    
    return RECOMMENDED_BLOG_TEMPLATE.format(blog_cards=cards_html)

def inject_static_content(file_path, tool_id):
    """Inject all static content into a tool page"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove old dynamic placeholders and scripts
    content = re.sub(r'<!-- Related Tools Section -->.*?<!-- End Related Tools Section -->', '', content, flags=re.DOTALL)
    content = re.sub(r'<div id="dynamic-related-tools"[^>]*></div>', '', content)
    content = re.sub(r'<script src="\.\./assets/js/related-tools\.js" defer></script>', '', content)
    
    # 2. Check if already injected
    if 'class="ux-guide-section"' in content:
        print(f"⏭️  Already injected: {tool_id}")
        return False
    
    # 3. Prepare injection block
    related_tools_html = get_related_tools(tool_id)
    recommended_blog_html = get_recommended_blogs()
    ux_guide_html = UX_GUIDE_TEMPLATE
    
    full_injection = f"\n{ux_guide_html}\n{related_tools_html}\n{recommended_blog_html}\n"
    
    # 4. Find insertion point (after tool-container, before seo-content)
    insertion_point = None
    
    # Try to find end of tool-container
    if '</div>' in content and '<article class="seo-content' in content:
        # Find the div before seo-content
        match = re.search(r'</div>\s*(?=<article class="seo-content|<section class="seo-content)', content)
        if match:
            insertion_point = match.end()
    
    if not insertion_point:
        # Fallback to before </main>
        match = re.search(r'</main>', content)
        if match:
            insertion_point = match.start()
            
    if insertion_point:
        content = content[:insertion_point] + full_injection + content[insertion_point:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Main execution"""
    print("🚀 Starting Hard-Coded Static Content Injection...\n")
    
    root_dir = Path('.')
    updated_count = 0
    
    # Get all tool directories
    tool_dirs = [d for d in root_dir.iterdir() if d.is_dir() and (d / 'index.html').exists()]
    exclude_dirs = {'assets', 'scripts', 'html-code-library', 'blog', 'updates', 'docs', 'trust-center'}
    tool_dirs = [d for d in tool_dirs if d.name not in exclude_dirs]
    
    for tool_dir in sorted(tool_dirs):
        tool_id = tool_dir.name
        index_path = tool_dir / 'index.html'
        
        try:
            if inject_static_content(index_path, tool_id):
                print(f"✅ Hard-coded: {tool_id}")
                updated_count += 1
        except Exception as e:
            print(f"❌ Error updating {tool_id}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"✅ Static Injection Complete!")
    print(f"📊 Updated: {updated_count} tools")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
