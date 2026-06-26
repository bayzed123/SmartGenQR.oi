#!/usr/bin/env python3
"""
High-Value Content Injector for SmartGen Tools
Automatically adds comprehensive, SEO-friendly content sections to all tool pages
to improve AdSense approval chances and provide better user value.
"""

import os
import re
from pathlib import Path

# High-value content template with customizable sections
HIGH_VALUE_CONTENT_TEMPLATE = '''
<section class="seo-content" style="margin: 3rem 0; padding: 2rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #2563eb;">
    <div class="content-wrapper">
        <article class="tool-guide">
            <h2>Complete Guide to {tool_name}</h2>
            <p>This comprehensive guide explains how to use {tool_name_lower} effectively, its key features, and best practices for optimal results.</p>
            
            <section class="guide-section">
                <h3>What is {tool_name} and Why You Need It?</h3>
                <p>{tool_description}</p>
                <p>Key benefits include: instant processing, no account creation required, 100% free to use, and complete privacy protection. This makes it the ideal solution for professionals who value both efficiency and security.</p>
            </section>

            <section class="guide-section">
                <h3>How to Use {tool_name} - Step-by-Step Guide</h3>
                <ol style="line-height: 1.8;">
                    <li><strong>Access the Tool:</strong> Simply navigate to this page and you'll find the interactive tool interface ready to use.</li>
                    <li><strong>Input Your Data:</strong> Enter the required information in the input fields. The tool accepts various formats and automatically validates your input.</li>
                    <li><strong>Customize Settings:</strong> Adjust any available options or parameters to match your specific needs.</li>
                    <li><strong>Generate Output:</strong> Click the generate or process button to instantly create your result.</li>
                    <li><strong>Copy or Download:</strong> Use the copy-to-clipboard feature for quick sharing, or download the result as a file.</li>
                </ol>
            </section>

            <section class="guide-section">
                <h3>Key Features & Capabilities</h3>
                <ul style="line-height: 1.8;">
                    <li><strong>Real-Time Processing:</strong> See results instantly as you type or adjust settings</li>
                    <li><strong>Client-Side Privacy:</strong> All processing happens in your browser - no data is sent to servers</li>
                    <li><strong>Multiple Format Support:</strong> Works with various input formats and export options</li>
                    <li><strong>No Registration Required:</strong> Start using immediately without creating an account</li>
                    <li><strong>Mobile Responsive:</strong> Use the tool on any device - desktop, tablet, or smartphone</li>
                    <li><strong>Completely Free:</strong> No hidden fees, paywalls, or premium upgrades</li>
                </ul>
            </section>

            <section class="guide-section">
                <h3>Real-World Use Cases & Examples</h3>
                <p>This tool is valuable in numerous scenarios:</p>
                <ul style="line-height: 1.8;">
                    <li><strong>For Developers:</strong> Streamline code generation, validation, and format conversion tasks</li>
                    <li><strong>For Digital Marketers:</strong> Create tracking links, optimize content, and analyze performance metrics</li>
                    <li><strong>For Content Creators:</strong> Generate SEO-friendly content, analyze readability, and optimize for search engines</li>
                    <li><strong>For Business Owners:</strong> Manage customer communications, track campaigns, and improve online presence</li>
                    <li><strong>For Students & Professionals:</strong> Complete assignments, analyze data, and solve technical problems efficiently</li>
                </ul>
            </section>

            <section class="guide-section">
                <h3>Best Practices for Optimal Results</h3>
                <ol style="line-height: 1.8;">
                    <li><strong>Validate Your Input:</strong> Ensure your data is in the correct format before processing</li>
                    <li><strong>Use Accurate Information:</strong> The quality of output depends on the quality of input data</li>
                    <li><strong>Review Output:</strong> Always review the generated result before using it in production</li>
                    <li><strong>Test with Examples:</strong> Start with sample data to understand how the tool works</li>
                    <li><strong>Keep Backups:</strong> Save important results locally before closing the browser</li>
                    <li><strong>Stay Updated:</strong> Check back regularly for new features and improvements</li>
                </ol>
            </section>

            <section class="guide-section">
                <h3>Technical Details & How It Works</h3>
                <p>This tool uses modern web technologies to provide fast, reliable processing. All computation happens in your browser using JavaScript, which means:</p>
                <ul style="line-height: 1.8;">
                    <li>No data is transmitted to external servers</li>
                    <li>Processing speed is limited only by your device's capabilities</li>
                    <li>Works offline after the initial page load</li>
                    <li>Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)</li>
                    <li>Automatically handles edge cases and invalid input gracefully</li>
                </ul>
            </section>

            <section class="guide-section">
                <h3>Why Choose SmartGen Tools?</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
                    <thead>
                        <tr style="background: #e0e7ff; border-bottom: 2px solid #2563eb;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #cbd5e1;">Feature</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #cbd5e1;">SmartGen</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #cbd5e1;">Typical Competitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>Cost</strong></td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">100% Free</td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Freemium or Paid</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>Registration</strong></td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Not Required</td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Often Required</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>Privacy</strong></td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">100% Client-Side</td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Server Processing</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>Speed</strong></td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Instant</td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Variable</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>Ads</strong></td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Minimal & Non-Intrusive</td>
                            <td style="padding: 12px; border: 1px solid #cbd5e1;">Heavy & Intrusive</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="guide-section">
                <h3>Troubleshooting Common Issues</h3>
                <dl style="line-height: 1.8;">
                    <dt><strong>Q: The tool isn't working. What should I do?</strong></dt>
                    <dd>A: Try refreshing the page, clearing your browser cache, or using a different browser. Ensure JavaScript is enabled in your browser settings.</dd>
                    
                    <dt><strong>Q: Is my data secure?</strong></dt>
                    <dd>A: Yes! All processing happens in your browser. No data is sent to our servers or any third-party service.</dd>
                    
                    <dt><strong>Q: Can I use this tool offline?</strong></dt>
                    <dd>A: After the initial page load, yes. The tool will work without an internet connection.</dd>
                    
                    <dt><strong>Q: What file formats are supported?</strong></dt>
                    <dd>A: The tool supports multiple formats. Check the input field placeholders or help text for specific format requirements.</dd>
                    
                    <dt><strong>Q: How do I export my results?</strong></dt>
                    <dd>A: Use the "Copy" button to copy to clipboard or the "Download" button to save as a file.</dd>
                </dl>
            </section>

            <section class="guide-section">
                <h3>Frequently Asked Questions (FAQ)</h3>
                <div class="faq-accordion">
                    <div class="faq-item">
                        <h4 class="faq-question">Is this tool really free to use?</h4>
                        <p class="faq-answer">Yes, absolutely! SmartGen is committed to providing high-quality tools without any cost. There are no hidden fees, paywalls, or premium versions.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="faq-question">Do I need to create an account?</h4>
                        <p class="faq-answer">No account creation is necessary. You can start using the tool immediately without any registration or login.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="faq-question">Is my data stored anywhere?</h4>
                        <p class="faq-answer">No. All processing happens in your browser. Your data is never stored on our servers or sent to any external service.</p>
                    </div>
                    <div class="faq-item">
                        <h4 class="faq-question">Can I use this tool on mobile devices?</h4>
                        <p class="faq-answer">Yes! The tool is fully responsive and works on smartphones, tablets, and desktop computers.</p>
                    </div>
                </div>
            </section>

            <section class="guide-section">
                <h3>Conclusion</h3>
                <p>This tool represents our commitment to providing professionals and everyday users with reliable, fast, and secure utilities. Whether you're optimizing your workflow, solving technical problems, or exploring new possibilities, SmartGen is here to help.</p>
                <p>We continuously improve and expand our tool suite based on user feedback. If you have suggestions or encounter any issues, please don't hesitate to contact us through our support channels.</p>
            </section>
        </article>
    </div>
</section>

<style>
    .seo-content {{
        font-size: 1rem;
        line-height: 1.6;
        color: #333;
    }}
    
    .guide-section {{
        margin-bottom: 2rem;
    }}
    
    .guide-section h3 {{
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: #1e293b;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0.5rem;
    }}
    
    .guide-section p {{
        margin-bottom: 1rem;
        text-align: justify;
    }}
    
    .guide-section ul, .guide-section ol {{
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }}
    
    .guide-section li {{
        margin-bottom: 0.5rem;
    }}
    
    .faq-accordion {{
        margin-top: 1rem;
    }}
    
    .faq-item {{
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #2563eb;
    }}
    
    .faq-question {{
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }}
    
    .faq-answer {{
        color: #475569;
        margin: 0;
    }}
    
    @media (max-width: 768px) {{
        .seo-content {{
            padding: 1rem !important;
        }}
        
        .guide-section h3 {{
            font-size: 1.1rem;
        }}
    }}
</style>
'''

def get_tool_description(tool_name):
    """Generate a description based on tool name"""
    descriptions = {
        'qr-generator': 'QR codes are essential for modern business and marketing. They bridge the gap between physical and digital content, allowing instant access to URLs, WiFi networks, contact information, and more.',
        'utm-builder': 'UTM parameters are crucial for digital marketing analytics. They help you track campaign performance, understand user behavior, and optimize your marketing spend with precision.',
        'meta-tag-generator': 'Meta tags are the foundation of SEO. They tell search engines what your page is about and influence how your content appears in search results and social media.',
        'keyword-density-checker': 'Keyword density analysis is vital for SEO optimization. It helps ensure your content is properly optimized for search engines without keyword stuffing.',
        'serp-preview-tool': 'SERP previews show exactly how your page will appear in Google search results. This helps optimize your title and description for better click-through rates.',
        'json-formatter-validator': 'JSON is the standard format for data exchange in modern web applications. Proper formatting and validation ensures your APIs and integrations work correctly.',
        'url-encoder-decoder': 'URL encoding is essential for web development and data transmission. It ensures special characters are properly handled in URLs and data strings.',
        'password-generator': 'Strong passwords are your first line of defense against cyber threats. A good password generator creates secure, random passwords that are difficult to crack.',
        'word-counter': 'Word count analysis is important for content creation, SEO optimization, and meeting specific content requirements for various platforms.',
        'image-compressor': 'Image optimization is critical for web performance. Smaller images load faster, improve user experience, and reduce bandwidth costs.',
    }
    
    # Return description or a generic one
    tool_key = tool_name.lower().replace(' ', '-')
    return descriptions.get(tool_key, f'{tool_name} is a powerful utility tool designed to simplify complex tasks and improve your workflow efficiency.')

def inject_high_value_content(file_path, tool_name):
    """Inject high-value content into a tool page"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if content already exists
    if 'class="seo-content"' in content:
        print(f"⏭️  Already has content: {tool_name}")
        return False
    
    # Prepare variables
    tool_name_lower = tool_name.lower()
    tool_description = get_tool_description(tool_name)
    
    # Format the template
    formatted_content = HIGH_VALUE_CONTENT_TEMPLATE.format(
        tool_name=tool_name,
        tool_name_lower=tool_name_lower,
        tool_description=tool_description
    )
    
    # Find insertion point (before closing main or before footer)
    insertion_point = None
    
    # Try to find before </main>
    if '</main>' in content:
        match = re.search(r'</main>', content)
        if match:
            insertion_point = match.start()
    
    # Try to find before <footer>
    if not insertion_point and '<footer' in content:
        match = re.search(r'<footer', content)
        if match:
            insertion_point = match.start()
    
    # Try to find before </div> (last closing div in tool-container)
    if not insertion_point:
        matches = list(re.finditer(r'</div>\s*(?=<div id="dynamic-related-tools"|<footer|</main>)', content))
        if matches:
            insertion_point = matches[-1].end()
    
    if insertion_point:
        content = content[:insertion_point] + '\n' + formatted_content + '\n' + content[insertion_point:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Main function to inject content into all tool pages"""
    print("🚀 Starting High-Value Content Injection for SmartGen Tools...\n")
    
    root_dir = Path('.')
    updated_count = 0
    skipped_count = 0
    failed_count = 0
    
    # Get all tool directories
    tool_dirs = [d for d in root_dir.iterdir() if d.is_dir() and (d / 'index.html').exists()]
    
    # Exclude specific directories
    exclude_dirs = {'assets', 'scripts', 'html-code-library', 'blog', 'updates'}
    tool_dirs = [d for d in tool_dirs if d.name not in exclude_dirs]
    
    for tool_dir in sorted(tool_dirs):
        tool_name = tool_dir.name.replace('-', ' ').title()
        index_path = tool_dir / 'index.html'
        
        try:
            if inject_high_value_content(index_path, tool_name):
                print(f"✅ Updated: {tool_name}")
                updated_count += 1
            else:
                print(f"⏭️  Skipped: {tool_name}")
                skipped_count += 1
        except Exception as e:
            print(f"❌ Error updating {tool_name}: {str(e)}")
            failed_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ High-Value Content Injection Complete!")
    print(f"📊 Updated: {updated_count} tools")
    print(f"⏭️  Skipped: {skipped_count} tools (already have content)")
    print(f"❌ Failed: {failed_count} tools")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
