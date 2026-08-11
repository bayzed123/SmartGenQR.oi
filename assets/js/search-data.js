// Comprehensive search index for all SmartGen tools
const TOOLS_INDEX = [
    {
        id: 'qr-generator',
        title: 'QR Code Generator',
        category: 'Developer & Technical',
        keywords: ['qr', 'code', 'barcode', 'generator', 'scanner', 'wifi'],
        description: 'Create custom QR codes for URLs, WiFi, and more.',
        url: './qr-generator/',
        icon: '📱'
    },
    {
        id: 'utm-builder',
        title: 'UTM Link Builder',
        category: 'Marketing & Social Media',
        keywords: ['utm', 'tracking', 'link', 'campaign', 'marketing', 'analytics'],
        description: 'Generate tracking links for your marketing campaigns.',
        url: './utm-builder/',
        icon: '🔗'
    },
    {
        id: 'whatsapp-link',
        title: 'WhatsApp Link',
        category: 'Marketing & Social Media',
        keywords: ['whatsapp', 'link', 'chat', 'message', 'direct'],
        description: 'Create direct chat links for WhatsApp.',
        url: './whatsapp-link/',
        icon: '💬'
    },
    {
        id: 'mailto-generator',
        title: 'Mailto Generator',
        category: 'Marketing & Social Media',
        keywords: ['mailto', 'email', 'link', 'generator'],
        description: 'Generate professional email links with ease.',
        url: './mailto-generator/',
        icon: '📧'
    },
    {
        id: 'meta-tag-generator',
        title: 'Meta Tag Generator',
        category: 'Developer & Technical',
        keywords: ['meta', 'tag', 'seo', 'html', 'generator'],
        description: 'Boost your SEO with perfect meta tags.',
        url: './meta-tag-generator/',
        icon: '🏷️'
    },
    {
        id: 'robots-txt-generator',
        title: 'Robots.txt Generator',
        category: 'Developer & Technical',
        keywords: ['robots', 'txt', 'seo', 'crawler', 'generator'],
        description: 'Create robots.txt files for search engines.',
        url: './robots-txt-generator/',
        icon: '🤖'
    },
    {
        id: 'keyword-density-checker',
        title: 'Keyword Density Checker',
        category: 'SEO & Content',
        keywords: ['keyword', 'density', 'checker', 'seo', 'analysis'],
        description: 'Analyze keyword frequency in your content.',
        url: './keyword-density-checker/',
        icon: '📊'
    },
    {
        id: 'schema-generator',
        title: 'Schema Generator',
        category: 'Developer & Technical',
        keywords: ['schema', 'json-ld', 'structured', 'data', 'seo'],
        description: 'Generate JSON-LD schema markup for SEO.',
        url: './schema-generator/',
        icon: '📜'
    },
    {
        id: 'word-counter',
        title: 'Word Counter',
        category: 'SEO & Content',
        keywords: ['word', 'counter', 'character', 'count', 'text'],
        description: 'Count words, characters, and reading time.',
        url: './word-counter/',
        icon: '📝'
    },
    {
        id: 'text-case-converter',
        title: 'Text Case Converter',
        category: 'SEO & Content',
        keywords: ['text', 'case', 'converter', 'uppercase', 'lowercase'],
        description: 'Convert text to UPPER, lower, or Title Case.',
        url: './text-case-converter/',
        icon: '🔠'
    },
    {
        id: 'hashtag-generator',
        title: 'Hashtag Generator',
        category: 'Marketing & Social Media',
        keywords: ['hashtag', 'social', 'media', 'trending', 'generator'],
        description: 'Generate trending social media hashtags.',
        url: './hashtag-generator/',
        icon: '#️⃣'
    },
    {
        id: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        category: 'SEO & Content',
        keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'generator'],
        description: 'Generate placeholder text for designs.',
        url: './lorem-ipsum-generator/',
        icon: '🖋️'
    },
    {
        id: 'password-generator',
        title: 'Password Generator',
        category: 'Daily Utilities & Calculators',
        keywords: ['password', 'generator', 'secure', 'random', 'generator'],
        description: 'Create secure, random passwords instantly.',
        url: './password-generator/',
        icon: '🔒'
    },
    {
        id: 'age-calculator',
        title: 'Age Calculator',
        category: 'Daily Utilities & Calculators',
        keywords: ['age', 'calculator', 'date', 'birth', 'difference'],
        description: 'Calculate exact age and date differences.',
        url: './age-calculator/',
        icon: '📅'
    },
    {
        id: 'image-to-base64',
        title: 'Image to Base64',
        category: 'Developer & Technical',
        keywords: ['image', 'base64', 'converter', 'encode', 'decode'],
        description: 'Convert images to Base64 strings.',
        url: './image-to-base64/',
        icon: '🖼️'
    },
    {
        id: 'picture-url-generator',
        title: 'Picture URL Generator',
        category: 'Developer & Technical',
        keywords: ['picture', 'url', 'generator', 'image', 'link'],
        description: 'Upload images and get direct live links instantly.',
        url: './picture-url-generator/',
        icon: '📸'
    },
    {
        id: 'cpm-roi-calculator',
        title: 'CPM ROI Calculator',
        category: 'Daily Utilities & Calculators',
        keywords: ['cpm', 'roi', 'calculator', 'cost', 'investment'],
        description: 'Calculate Cost Per Mille and Return on Investment.',
        url: './cpm-roi-calculator/',
        icon: '💰'
    },
    {
        id: 'color-palette-extractor',
        title: 'Color Palette Extractor',
        category: 'Daily Utilities & Calculators',
        keywords: ['color', 'palette', 'extractor', 'hex', 'rgb'],
        description: 'Extract dominant colors from images as HEX and RGB.',
        url: './color-palette-extractor/',
        icon: '🎨'
    },
    {
        id: 'blog-title-generator',
        title: 'Blog Title Generator',
        category: 'Marketing & Social Media',
        keywords: ['blog', 'title', 'generator', 'headline', 'seo'],
        description: 'Generate SEO-friendly blog titles and headlines.',
        url: './blog-title-generator/',
        icon: '✍️'
    },
    {
        id: 'emi-calculator',
        title: 'EMI Calculator',
        category: 'Daily Utilities & Calculators',
        keywords: ['emi', 'loan', 'calculator', 'installment', 'interest'],
        description: 'Calculate monthly installments and total interest.',
        url: './emi-calculator/',
        icon: '🏦'
    },
    {
        id: 'seo-audit-tool',
        title: 'SEO Audit Tool',
        category: 'SEO & Content',
        keywords: ['seo', 'audit', 'checker', 'analyzer', 'website', 'health', 'score', 'eeat', 'e-e-a-t', 'technical seo', 'site audit'],
        description: 'Score any website out of 100 across 27 free SEO and E-E-A-T checks.',
        url: './seo-audit-tool/',
        icon: '📊'
    },
    {
        id: 'serp-preview-tool',
        title: 'SERP Preview Tool',
        category: 'SEO & Content',
        keywords: ['serp', 'preview', 'google', 'search', 'snippet', 'ai title generator', 'meta description generator', 'rank checker', 'keyword ranking'],
        description: 'Preview your Google snippet, get AI-written title and description suggestions, and check your keyword ranking.',
        url: './serp-preview-tool/',
        icon: '🔍'
    },
    {
        id: 'image-compressor',
        title: 'Image Compressor',
        category: 'Daily Utilities & Calculators',
        keywords: ['image', 'compressor', 'reduce', 'size', 'optimize'],
        description: 'Reduce image size locally without uploading.',
        url: './image-compressor/',
        icon: '📉'
    },
    {
        id: 'percentage-calculator',
        title: 'Percentage Calculator',
        category: 'Daily Utilities & Calculators',
        keywords: ['percentage', 'calculator', 'discount', 'math'],
        description: 'Calculate percentages, discounts, and differences.',
        url: './percentage-calculator/',
        icon: '%'
    },
    {
        id: 'pomodoro-timer',
        title: 'Pomodoro Timer',
        category: 'Daily Utilities & Calculators',
        keywords: ['pomodoro', 'timer', 'focus', 'productivity', 'work'],
        description: '25/5 focus timer with start, pause, and reset.',
        url: './pomodoro-timer/',
        icon: '⏱️'
    },
    {
        id: 'secure-notepad',
        title: 'Secure Notepad',
        category: 'Daily Utilities & Calculators',
        keywords: ['notepad', 'notes', 'secure', 'privacy', 'storage'],
        description: 'Auto-save notes to browser storage with privacy.',
        url: './secure-notepad/',
        icon: '📔'
    },
    {
        id: 'fancy-font-generator',
        title: 'Fancy Font Generator',
        category: 'Daily Utilities & Calculators',
        keywords: ['font', 'fancy', 'unicode', 'text', 'style'],
        description: 'Convert text to cool Unicode styles and fonts.',
        url: './fancy-font-generator/',
        icon: '✨'
    },
    {
        id: 'unit-converter',
        title: 'Unit Converter',
        category: 'Daily Utilities & Calculators',
        keywords: ['unit', 'converter', 'length', 'weight', 'temperature'],
        description: 'Convert length, weight, and temperature instantly.',
        url: './unit-converter/',
        icon: '📏'
    },
    {
        id: 'youtube-thumbnail-downloader',
        title: 'YouTube Thumbnail Downloader',
        category: 'Marketing & Social Media',
        keywords: ['youtube', 'thumbnail', 'downloader', 'video', 'image'],
        description: 'Download HD thumbnails from any YouTube video.',
        url: './youtube-thumbnail-downloader/',
        icon: '🎬'
    },
    {
        id: 'bmi-bmr-calculator',
        title: 'BMI BMR Calculator',
        category: 'Daily Utilities & Calculators',
        keywords: ['bmi', 'bmr', 'calculator', 'health', 'fitness'],
        description: 'Calculate Body Mass Index and metabolic rate.',
        url: './bmi-bmr-calculator/',
        icon: '⚖️'
    },
    {
        id: 'url-encoder-decoder',
        title: 'URL Encoder-Decoder',
        category: 'Developer & Technical',
        keywords: ['url', 'encoder', 'decoder', 'encode', 'decode'],
        description: 'Encode and decode URLs securely and instantly.',
        url: './url-encoder-decoder/',
        icon: '🔐'
    },
    {
        id: 'css-gradient-generator',
        title: 'CSS Gradient Generator',
        category: 'Developer & Technical',
        keywords: ['css', 'gradient', 'generator', 'color', 'design'],
        description: 'Create beautiful CSS gradients with color pickers.',
        url: './css-gradient-generator/',
        icon: '🎨'
    },
    {
        id: 'random-choice-picker',
        title: 'Random Choice Picker',
        category: 'Developer & Technical',
        keywords: ['random', 'choice', 'picker', 'decision', 'generator'],
        description: 'Make random decisions from a list of choices.',
        url: './random-choice-picker/',
        icon: '🎲'
    },
    {
        id: 'facebook-id-finder',
        title: 'Facebook ID Finder',
        category: 'Marketing & Social Media',
        keywords: ['facebook', 'id', 'finder', 'profile', 'numeric'],
        description: 'Extract numeric Facebook IDs from profile links.',
        url: './facebook-id-finder/',
        icon: '👤'
    },
    {
        id: 'privacy-policy-generator',
        title: 'Privacy Policy Generator',
        category: 'Marketing & Social Media',
        keywords: ['privacy', 'policy', 'generator', 'legal', 'compliance'],
        description: 'Generate professional privacy policies for your site.',
        url: './privacy-policy-generator/',
        icon: '📜'
    },
    {
        id: 'terms-conditions-generator',
        title: 'Terms & Conditions Generator',
        category: 'Marketing & Social Media',
        keywords: ['terms', 'conditions', 'tos', 'legal', 'agreement'],
        description: 'Create custom terms of service agreements instantly.',
        url: './terms-conditions-generator/',
        icon: '⚖️'
    },
    {
        id: 'disclaimer-generator',
        title: 'Disclaimer Generator',
        category: 'Marketing & Social Media',
        keywords: ['disclaimer', 'generator', 'legal', 'protection'],
        description: 'Generate legal disclaimers to protect your business.',
        url: './disclaimer-generator/',
        icon: '⚠️'
    },
    {
        id: 'uuid-generator',
        title: 'UUID / GUID Generator',
        category: 'Developer & Technical',
        keywords: ['uuid', 'guid', 'generator', 'random', 'id'],
        description: 'Generate random version 4 UUIDs instantly.',
        url: './uuid-generator/',
        icon: '🆔'
    },
    {
        id: 'json-formatter-validator',
        title: 'JSON Formatter & Validator',
        category: 'Developer & Technical',
        keywords: ['json', 'formatter', 'validator', 'beautify', 'fix'],
        description: 'Format, beautify, and validate JSON code.',
        url: './json-formatter-validator/',
        icon: 'JSON'
    },
    {
        id: 'text-to-changelog-json-generator',
        title: 'Text to Changelog JSON Generator',
        category: 'Developer & Technical',
        keywords: ['json', 'changelog', 'text to json', 'generator', 'update', 'release notes', 'developer'],
        description: 'Convert text into structured JSON for changelogs.',
        url: './text-to-changelog-json-generator/',
        icon: '📝'
    },
    {
        id: 'base64-to-image',
        title: 'Base64 to Image Decoder',
        category: 'Developer & Technical',
        keywords: ['base64', 'image', 'decoder', 'convert', 'decode'],
        description: 'Decode Base64 strings back into image files.',
        url: './base64-to-image/',
        icon: '🖼️'
    },
    {
        id: 'hash-generator',
        title: 'MD5/SHA Hash Generator',
        category: 'Developer & Technical',
        keywords: ['hash', 'md5', 'sha1', 'sha256', 'generator', 'secure'],
        description: 'Generate MD5, SHA-1, and SHA-256 hashes.',
        url: './hash-generator/',
        icon: '🔒'
    },
    {
        id: 'ip-address-lookup',
        title: 'IP Address Lookup',
        category: 'Developer & Technical',
        keywords: ['ip', 'address', 'lookup', 'my ip', 'network'],
        description: 'Find your public IP and network information.',
        url: './ip-address-lookup/',
        icon: '🌐'
    },
    {
        id: 'sitemap-finder-and-downloader',
        title: 'Sitemap Finder & Custom XML Downloader',
        category: 'Developer & Technical',
        keywords: ['sitemap', 'finder', 'downloader', 'xml', 'seo', 'extract', 'urls'],
        description: 'Extract URLs, modify lastmod dates, and download custom XML sitemaps.',
        url: './sitemap-finder-and-downloader/',
        icon: '🗺️'
    },
	    {
	        id: 'html-code-preview',
	        title: 'Live HTML Previewer',
	        category: 'Developer & Technical',
	        keywords: ['html', 'css', 'js', 'preview', 'editor', 'live', 'code'],
	        description: 'Write HTML/CSS/JS and see live results instantly.',
	        url: './html-code-preview/',
	        icon: '💻'
	    },
	    {
	        id: 'voice-remover',
	        title: 'AI Vocal Remover',
	        category: 'Daily Utilities & Calculators',
	        keywords: ['vocal', 'remover', 'voice', 'music', 'splitter', 'stems', 'ai', 'karaoke'],
	        description: 'Separate vocals and music with 100% free AI.',
	        url: './voice-remover/',
        icon: '🎤'
    },
    {
        id: 'blog',
        title: 'SmartGen Blog',
        category: 'Resources',
        keywords: ['blog', 'news', 'article', 'tutorial', 'insights', 'smartgen blog'],
        description: 'Explore the SmartGen blog for the latest tutorials and insights.',
        url: './blog/',
        icon: '📝'
    },// MARQUEE CODES

{
    id: 'bouncing-image',
    title: 'Bouncing Image',
    category: 'HTML Code Library',
    keywords: ['bouncing image', 'animated image', 'moving image html', 'html code library'],
    description: 'Create bouncing image animations using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/bouncing-image.html',
    icon: '🖼️'
},
{
    id: 'bouncing-text',
    title: 'Bouncing Text',
    category: 'HTML Code Library',
    keywords: ['bouncing text', 'animated text', 'moving text html', 'html code library'],
    description: 'Create bouncing text effects with HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/bouncing-text.html',
    icon: '🔤'
},
{
    id: 'css-marquee',
    title: 'CSS Marquee',
    category: 'HTML Code Library',
    keywords: ['css marquee', 'scrolling text css', 'css animation', 'html code library'],
    description: 'Modern CSS marquee effects without deprecated tags.',
    url: 'https://smartgentools.com/html-code-library/css-marquee.html',
    icon: '↔️'
},
{
    id: 'html-marquee',
    title: 'HTML Marquee',
    category: 'HTML Code Library',
    keywords: ['html marquee', 'marquee tag', 'scrolling text html', 'html code library'],
    description: 'Classic HTML marquee examples and alternatives.',
    url: 'https://smartgentools.com/html-code-library/html-marquee.html',
    icon: '📜'
},
{
    id: 'scrolling-image',
    title: 'Scrolling Image',
    category: 'HTML Code Library',
    keywords: ['scrolling image', 'moving image', 'image animation', 'html code library'],
    description: 'Create scrolling image effects using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/scrolling-image.html',
    icon: '🖼️'
},
{
    id: 'scrolling-text',
    title: 'Scrolling Text',
    category: 'HTML Code Library',
    keywords: ['scrolling text', 'moving text', 'marquee text', 'html code library'],
    description: 'Build scrolling text effects for websites.',
    url: 'https://smartgentools.com/html-code-library/scrolling-text.html',
    icon: '📝'
},
{
    id: 'slide-in-image',
    title: 'Slide In Image',
    category: 'HTML Code Library',
    keywords: ['slide in image', 'image animation', 'css slide effect', 'html code library'],
    description: 'Create slide-in image animations with HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/slide-in-image.html',
    icon: '➡️'
},
{
    id: 'slide-in-text',
    title: 'Slide In Text',
    category: 'HTML Code Library',
    keywords: ['slide in text', 'text animation', 'css slide text', 'html code library'],
    description: 'Create animated slide-in text effects.',
    url: 'https://smartgentools.com/html-code-library/slide-in-text.html',
    icon: '➡️'
},

// SCROLLBOX CODES

{
    id: 'html-scrollbox',
    title: 'HTML Scrollbox',
    category: 'HTML Code Library',
    keywords: ['html scrollbox', 'scrollable box', 'overflow scroll', 'html code library'],
    description: 'Create scrollable content areas using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/html-scrollbox.html',
    icon: '📦'
},
{
    id: 'scrollbox-border',
    title: 'Scrollbox Border',
    category: 'HTML Code Library',
    keywords: ['scrollbox border', 'scroll box border', 'css border scrollbox', 'html code library'],
    description: 'Customize borders for HTML scrollboxes.',
    url: 'https://smartgentools.com/html-code-library/scrollbox-border.html',
    icon: '🧱'
},
{
    id: 'scrollbox-color',
    title: 'Scrollbox Color',
    category: 'HTML Code Library',
    keywords: ['scrollbox color', 'scroll box color', 'css scrollbox styling', 'html code library'],
    description: 'Customize scrollbox colors and appearance.',
    url: 'https://smartgentools.com/html-code-library/scrollbox-color.html',
    icon: '🎨'
},// TEMPLATES

{
    id: 'css-templates',
    title: 'CSS Templates',
    category: 'HTML Code Library',
    keywords: ['css templates', 'website css templates', 'css layouts', 'html code library'],
    description: 'Ready-to-use CSS templates for websites and web projects.',
    url: 'https://smartgentools.com/html-code-library/css-templates.html',
    icon: '🎨'
},
{
    id: 'html5-frames',
    title: 'HTML5 Frames',
    category: 'HTML Code Library',
    keywords: ['html5 frames', 'html frame layouts', 'html5 layout templates', 'html code library'],
    description: 'HTML5 frame and layout examples for modern websites.',
    url: 'https://smartgentools.com/html-code-library/html5-frames.html',
    icon: '🖼️'
},
{
    id: 'layout-templates',
    title: 'Layout Templates',
    category: 'HTML Code Library',
    keywords: ['layout templates', 'website layouts', 'html page layouts', 'html code library'],
    description: 'Prebuilt HTML layout templates for websites.',
    url: 'https://smartgentools.com/html-code-library/layout-templates.html',
    icon: '📐'
},
{
    id: 'website-templates',
    title: 'Website Templates',
    category: 'HTML Code Library',
    keywords: ['website templates', 'html website templates', 'web design templates', 'html code library'],
    description: 'Website template examples for fast web development.',
    url: 'https://smartgentools.com/html-code-library/website-templates.html',
    icon: '🌐'
},

// TEXT CODES

{
    id: 'font-code',
    title: 'Font Code',
    category: 'HTML Code Library',
    keywords: ['font code', 'html font code', 'css fonts', 'html code library'],
    description: 'HTML font styling and typography code examples.',
    url: 'https://smartgentools.com/html-code-library/font-code.html',
    icon: '🔤'
},
{
    id: 'html-bold',
    title: 'HTML Bold',
    category: 'HTML Code Library',
    keywords: ['html bold', 'bold text html', 'b tag', 'html code library'],
    description: 'Make text bold using HTML tags and CSS.',
    url: 'https://smartgentools.com/html-code-library/html-bold.html',
    icon: '🅱️'
},
{
    id: 'html-underline-code',
    title: 'HTML Underline Code',
    category: 'HTML Code Library',
    keywords: ['html underline code', 'underline text html', 'text decoration', 'html code library'],
    description: 'Underline text using HTML and CSS techniques.',
    url: 'https://smartgentools.com/html-code-library/html-underline-code.html',
    icon: '📏'
},
{
    id: 'table-background-color',
    title: 'Table Background Color',
    category: 'HTML Code Library',
    keywords: ['table background color', 'html table color', 'table styling', 'html code library'],
    description: 'Customize table background colors with HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/table-background-color.html',
    icon: '🎨'
},
{
    id: 'table-border',
    title: 'Table Border',
    category: 'HTML Code Library',
    keywords: ['table border', 'html table border', 'css table border', 'html code library'],
    description: 'Create and customize table borders in HTML.',
    url: 'https://smartgentools.com/html-code-library/table-border.html',
    icon: '📊'
},
{
    id: 'table-color',
    title: 'Table Color',
    category: 'HTML Code Library',
    keywords: ['table color', 'html table colors', 'table styling css', 'html code library'],
    description: 'Apply colors to HTML tables for better presentation.',
    url: 'https://smartgentools.com/html-code-library/table-color.html',
    icon: '🟦'
},
{
    id: 'table-text',
    title: 'Table Text',
    category: 'HTML Code Library',
    keywords: ['table text', 'html table text', 'table formatting', 'html code library'],
    description: 'Format and style text within HTML tables.',
    url: 'https://smartgentools.com/html-code-library/table-text.html',
    icon: '📝'
},
{
    id: 'text-code',
    title: 'Text Code',
    category: 'HTML Code Library',
    keywords: ['text code', 'html text code', 'text formatting html', 'html code library'],
    description: 'General HTML text formatting and styling examples.',
    url: 'https://smartgentools.com/html-code-library/text-code.html',
    icon: '📄'
},
{
    id: 'text-color',
    title: 'Text Color',
    category: 'HTML Code Library',
    keywords: ['text color', 'html text color', 'css font color', 'html code library'],
    description: 'Change text colors using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/text-color.html',
    icon: '🎨'
},

// TEXTBOX CODES

{
    id: 'html-textbox',
    title: 'HTML Textbox',
    category: 'HTML Code Library',
    keywords: ['html textbox', 'input textbox', 'html form field', 'html code library'],
    description: 'Create HTML textboxes and input fields.',
    url: 'https://smartgentools.com/html-code-library/html-textbox.html',
    icon: '⌨️'
},
{
    id: 'textbox-border',
    title: 'Textbox Border',
    category: 'HTML Code Library',
    keywords: ['textbox border', 'input border css', 'textbox styling', 'html code library'],
    description: 'Customize textbox borders with CSS.',
    url: 'https://smartgentools.com/html-code-library/textbox-border.html',
    icon: '🧱'
},
{
    id: 'textbox-color',
    title: 'Textbox Color',
    category: 'HTML Code Library',
    keywords: ['textbox color', 'input color css', 'textbox styling', 'html code library'],
    description: 'Style textbox colors using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/textbox-color.html',
    icon: '🎨'
},// IMAGE CODES

{
    id: 'background-image-code',
    title: 'Background Image Code',
    category: 'HTML Code Library',
    keywords: ['background image code', 'html background image', 'css background image', 'html code library'],
    description: 'HTML and CSS background image code examples and customization options.',
    url: 'https://smartgentools.com/html-code-library/background-image-code.html',
    icon: '🖼️'
},
{
    id: 'html-favicon-code',
    title: 'HTML Favicon Code',
    category: 'HTML Code Library',
    keywords: ['html favicon code', 'favicon html', 'website icon code', 'html code library'],
    description: 'Add and customize favicons using HTML favicon code.',
    url: 'https://smartgentools.com/html-code-library/html-favicon-code.html',
    icon: '⭐'
},
{
    id: 'html-image-borders',
    title: 'HTML Image Borders',
    category: 'HTML Code Library',
    keywords: ['html image borders', 'image border css', 'image styling', 'html code library'],
    description: 'Create and customize image borders using HTML and CSS.',
    url: 'https://smartgentools.com/html-code-library/html-image-borders.html',
    icon: '🖼️'
},
{
    id: 'repeat-image',
    title: 'Repeat Image',
    category: 'HTML Code Library',
    keywords: ['repeat image', 'background repeat image', 'css image repeat', 'html code library'],
    description: 'Repeat images horizontally, vertically, or in both directions.',
    url: 'https://smartgentools.com/html-code-library/repeat-image.html',
    icon: '🔁'
},

// LINK CODES

{
    id: 'css-hover',
    title: 'CSS Hover',
    category: 'HTML Code Library',
    keywords: ['css hover', 'hover effect', 'hover styles', 'html code library'],
    description: 'Create interactive hover effects using CSS.',
    url: 'https://smartgentools.com/html-code-library/css-hover.html',
    icon: '🖱️'
},
{
    id: 'email-link',
    title: 'Email Link',
    category: 'HTML Code Library',
    keywords: ['email link', 'mailto link', 'html email link', 'html code library'],
    description: 'Create clickable email links using mailto HTML code.',
    url: 'https://smartgentools.com/html-code-library/email-link.html',
    icon: '📧'
},
{
    id: 'html-image-link',
    title: 'HTML Image Link',
    category: 'HTML Code Library',
    keywords: ['html image link', 'linked image', 'image hyperlink', 'html code library'],
    description: 'Turn images into clickable hyperlinks with HTML.',
    url: 'https://smartgentools.com/html-code-library/html-image-link.html',
    icon: '🖼️'
},
{
    id: 'open-in-new-window',
    title: 'Open In New Window',
    category: 'HTML Code Library',
    keywords: ['open in new window', 'target blank', 'html links', 'html code library'],
    description: 'Open hyperlinks in a new browser tab or window.',
    url: 'https://smartgentools.com/html-code-library/open-in-new-window.html',
    icon: '🪟'
},
{
    id: 'remove-underline',
    title: 'Remove Underline',
    category: 'HTML Code Library',
    keywords: ['remove underline', 'css text decoration', 'link styling', 'html code library'],
    description: 'Remove link underlines using CSS and HTML.',
    url: 'https://smartgentools.com/html-code-library/remove-underline.html',
    icon: '🚫'
},{
    id: 'html-bold-editor',
    title: 'HTML Bold Editor',
    category: 'HTML Code Library',
    keywords: ['html bold editor', 'bold text editor', 'html formatting tool', 'html code library'],
    description: 'Create and edit bold HTML text with a visual editor.',
    url: 'https://smartgentools.com/html-code-library/html-bold-editor.html',
    icon: '🅱️'
},
{
    id: 'html-editor',
    title: 'HTML Editor',
    category: 'HTML Code Library',
    keywords: ['html editor', 'online html editor', 'html coding tool', 'html code library'],
    description: 'Online HTML editor for creating and testing HTML code.',
    url: 'https://smartgentools.com/html-code-library/html-editor.html',
    icon: '💻'
},
{
    id: 'html-link-editor',
    title: 'HTML Link Editor',
    category: 'HTML Code Library',
    keywords: ['html link editor', 'anchor tag editor', 'html hyperlink tool', 'html code library'],
    description: 'Create and edit HTML hyperlinks with ease.',
    url: 'https://smartgentools.com/html-code-library/html-link-editor.html',
    icon: '🔗'
},
{
    id: 'html-text-editor',
    title: 'HTML Text Editor',
    category: 'HTML Code Library',
    keywords: ['html text editor', 'text formatting editor', 'html content editor', 'html code library'],
    description: 'Edit and format text content using HTML.',
    url: 'https://smartgentools.com/html-code-library/html-text-editor.html',
    icon: '📝'
},
{
    id: 'image-code-editor',
    title: 'Image Code Editor',
    category: 'HTML Code Library',
    keywords: ['image code editor', 'html image editor', 'image html tool', 'html code library'],
    description: 'Generate and edit HTML image code quickly.',
    url: 'https://smartgentools.com/html-code-library/image-code-editor.html',
    icon: '🖼️'
},
{
    id: 'text-color-editor',
    title: 'Text Color Editor',
    category: 'HTML Code Library',
    keywords: ['text color editor', 'html text color', 'css text color tool', 'html code library'],
    description: 'Customize text colors and generate HTML color code.',
    url: 'https://smartgentools.com/html-code-library/text-color-editor.html',
    icon: '🎨'
},

// GENERATORS

{
    id: 'gradient-generator',
    title: 'Gradient Generator',
    category: 'HTML Code Library',
    keywords: ['gradient generator', 'css gradient generator', 'background gradient', 'html code library'],
    description: 'Generate CSS and HTML gradient backgrounds instantly.',
    url: 'https://smartgentools.com/html-code-library/gradient-generator.html',
    icon: '🌈'
},
{
    id: 'html-bold-generator',
    title: 'HTML Bold Generator',
    category: 'HTML Code Library',
    keywords: ['html bold generator', 'bold text generator', 'html formatting', 'html code library'],
    description: 'Generate bold text HTML code automatically.',
    url: 'https://smartgentools.com/html-code-library/html-bold-generator.html',
    icon: '🅱️'
},
{
    id: 'html-italic-generator',
    title: 'HTML Italic Generator',
    category: 'HTML Code Library',
    keywords: ['html italic generator', 'italic text generator', 'html formatting', 'html code library'],
    description: 'Generate italic HTML text code instantly.',
    url: 'https://smartgentools.com/html-code-library/html-italic-generator.html',
    icon: '✒️'
},
{
    id: 'html-link-generator',
    title: 'HTML Link Generator',
    category: 'HTML Code Library',
    keywords: ['html link generator', 'anchor tag generator', 'html hyperlink', 'html code library'],
    description: 'Create HTML hyperlinks automatically.',
    url: 'https://smartgentools.com/html-code-library/html-link-generator.html',
    icon: '🔗'
},
{
    id: 'html-table-generator',
    title: 'HTML Table Generator',
    category: 'HTML Code Library',
    keywords: ['html table generator', 'table creator', 'html table code', 'html code library'],
    description: 'Generate responsive HTML tables quickly.',
    url: 'https://smartgentools.com/html-code-library/html-table-generator.html',
    icon: '📊'
},
{
    id: 'image-code-generator',
    title: 'Image Code Generator',
    category: 'HTML Code Library',
    keywords: ['image code generator', 'html image code', 'image html generator', 'html code library'],
    description: 'Generate HTML image embed code automatically.',
    url: 'https://smartgentools.com/html-code-library/image-code-generator.html',
    icon: '🖼️'
},
{
    id: 'text-color-generator',
    title: 'Text Color Generator',
    category: 'HTML Code Library',
    keywords: ['text color generator', 'html color generator', 'css text color', 'html code library'],
    description: 'Generate HTML text color code instantly.',
    url: 'https://smartgentools.com/html-code-library/text-color-generator.html',
    icon: '🎨'
},
{
    id: 'text-generator',
    title: 'Text Generator',
    category: 'HTML Code Library',
    keywords: ['text generator', 'html text generator', 'formatted text generator', 'html code library'],
    description: 'Generate formatted HTML text content.',
    url: 'https://smartgentools.com/html-code-library/text-generator.html',
    icon: '📝'
},{
    id: 'html-heart-code',
    title: 'HTML Heart Code',
    category: 'HTML Code Library',
    keywords: ['html heart code', 'heart symbol html', 'heart character code', 'html code library'],
    description: 'HTML heart symbol codes, entities, and examples.',
    url: 'https://smartgentools.com/html-code-library/html-heart-code.html',
    icon: '❤️'
},
{
    id: 'html-space-code',
    title: 'HTML Space Code',
    category: 'HTML Code Library',
    keywords: ['html space code', 'non breaking space', 'nbsp html', 'html code library'],
    description: 'HTML space character codes and spacing examples.',
    url: 'https://smartgentools.com/html-code-library/html-space-code.html',
    icon: '␣'
},
{
    id: 'html-special-characters',
    title: 'HTML Special Characters',
    category: 'HTML Code Library',
    keywords: ['html special characters', 'special symbols html', 'html entities', 'html code library'],
    description: 'Collection of HTML special characters and entity codes.',
    url: 'https://smartgentools.com/html-code-library/html-special-characters.html',
    icon: '🔣'
},
{
    id: 'html-star-code',
    title: 'HTML Star Code',
    category: 'HTML Code Library',
    keywords: ['html star code', 'star symbol html', 'star character code', 'html code library'],
    description: 'HTML star symbol codes and usage examples.',
    url: 'https://smartgentools.com/html-code-library/html-star-code.html',
    icon: '⭐'
},
{
    id: 'html-symbols',
    title: 'HTML Symbols',
    category: 'HTML Code Library',
    keywords: ['html symbols', 'symbol codes html', 'html entities', 'html code library'],
    description: 'Browse popular HTML symbols and character entities.',
    url: 'https://smartgentools.com/html-code-library/html-symbols.html',
    icon: '♾️'
},
{
    id: 'html-tab-code',
    title: 'HTML Tab Code',
    category: 'HTML Code Library',
    keywords: ['html tab code', 'tab character html', 'html spacing', 'html code library'],
    description: 'Methods for creating tab spacing in HTML.',
    url: 'https://smartgentools.com/html-code-library/html-tab-code.html',
    icon: '↹'
},
{
    id: 'html-trademark-code',
    title: 'HTML Trademark Code',
    category: 'HTML Code Library',
    keywords: ['html trademark code', 'tm symbol html', 'trademark character code', 'html code library'],
    description: 'Trademark symbol HTML codes and examples.',
    url: 'https://smartgentools.com/html-code-library/html-trademark-code.html',
    icon: '™️'
},
{
    id: 'iso-8859-1-characters',
    title: 'ISO 8859-1 Characters',
    category: 'HTML Code Library',
    keywords: ['iso 8859 1 characters', 'latin1 characters', 'html character codes', 'html code library'],
    description: 'Reference for ISO 8859-1 HTML character entities.',
    url: 'https://smartgentools.com/html-code-library/iso-8859-1-characters.html',
    icon: '📖'
},
{
    id: 'iso-language-codes',
    title: 'ISO Language Codes',
    category: 'HTML Code Library',
    keywords: ['iso language codes', 'language codes', 'html language codes', 'html code library'],
    description: 'ISO language code reference for HTML and web development.',
    url: 'https://smartgentools.com/html-code-library/iso-language-codes.html',
    icon: '🌐'
},
{
    id: 'color-code-chart',
    title: 'Color Code Chart',
    category: 'HTML Code Library',
    keywords: ['color code chart', 'html color chart', 'css color chart', 'html code library'],
    description: 'Comprehensive HTML color code chart and reference.',
    url: 'https://smartgentools.com/html-code-library/color-code-chart.html',
    icon: '🎨'
},
{
    id: 'color-schemes',
    title: 'Color Schemes',
    category: 'HTML Code Library',
    keywords: ['color schemes', 'css color schemes', 'website colors', 'html code library'],
    description: 'Popular color schemes for websites and UI design.',
    url: 'https://smartgentools.com/html-code-library/color-schemes.html',
    icon: '🌈'
},
{
    id: 'html-black-code',
    title: 'HTML Black Code',
    category: 'HTML Code Library',
    keywords: ['html black code', 'black color code', 'hex black color', 'html code library'],
    description: 'HTML black color code references and examples.',
    url: 'https://smartgentools.com/html-code-library/html-black-code.html',
    icon: '⚫'
},
{
    id: 'html-blue-code',
    title: 'HTML Blue Code',
    category: 'HTML Code Library',
    keywords: ['html blue code', 'blue color code', 'css blue color', 'html code library'],
    description: 'HTML blue color code reference and usage examples.',
    url: 'https://smartgentools.com/html-code-library/html-blue-code.html',
    icon: '🔵'
},
{
    id: 'html-color-picker',
    title: 'HTML Color Picker',
    category: 'HTML Code Library',
    keywords: ['html color picker', 'css color picker', 'pick colors online', 'html code library'],
    description: 'Interactive HTML color picker and color selection tool.',
    url: 'https://smartgentools.com/html-code-library/html-color-picker.html',
    icon: '🖌️'
},
{
    id: 'html-green-code',
    title: 'HTML Green Code',
    category: 'HTML Code Library',
    keywords: ['html green code', 'green color code', 'css green color', 'html code library'],
    description: 'HTML green color codes and examples.',
    url: 'https://smartgentools.com/html-code-library/html-green-code.html',
    icon: '🟢'
},
{
    id: 'html-red-code',
    title: 'HTML Red Code',
    category: 'HTML Code Library',
    keywords: ['html red code', 'red color code', 'css red color', 'html code library'],
    description: 'HTML red color code references and examples.',
    url: 'https://smartgentools.com/html-code-library/html-red-code.html',
    icon: '🔴'
},
{
    id: 'html-white-code',
    title: 'HTML White Code',
    category: 'HTML Code Library',
    keywords: ['html white code', 'white color code', 'css white color', 'html code library'],
    description: 'HTML white color codes and implementation examples.',
    url: 'https://smartgentools.com/html-code-library/html-white-code.html',
    icon: '⚪'
},{
    id: 'html-code-library-index',
    title: 'HTML Code Library',
    category: 'HTML Code Library',
    keywords: ['html code library','html','css','html codes'],
    description: 'HTML Code Library resources.',
    url: 'https://smartgentools.com/html-code-library/',
    icon: '📚'
},
{
    id: 'background-color',
    title: 'Background Color',
    category: 'HTML Code Library',
    keywords: ['background color'],
    description: 'Background Color code.',
    url: 'https://smartgentools.com/html-code-library/background-color.html',
    icon: '🎨'
},
{
    id: 'background-image',
    title: 'Background Image',
    category: 'HTML Code Library',
    keywords: ['background image'],
    description: 'Background Image code.',
    url: 'https://smartgentools.com/html-code-library/background-image.html',
    icon: '🖼️'
},
{
    id: 'background-position',
    title: 'Background Position',
    category: 'HTML Code Library',
    keywords: ['background position'],
    description: 'Background Position code.',
    url: 'https://smartgentools.com/html-code-library/background-position.html',
    icon: '📍'
},
{
    id: 'background-repeat',
    title: 'Background Repeat',
    category: 'HTML Code Library',
    keywords: ['background repeat'],
    description: 'Background Repeat code.',
    url: 'https://smartgentools.com/html-code-library/background-repeat.html',
    icon: '🔁'
},
{
    id: 'fixed-background',
    title: 'Fixed Background',
    category: 'HTML Code Library',
    keywords: ['fixed background'],
    description: 'Fixed Background code.',
    url: 'https://smartgentools.com/html-code-library/fixed-background.html',
    icon: '🖥️'
},
{
    id: 'greek-characters',
    title: 'Greek Characters',
    category: 'HTML Code Library',
    keywords: ['greek characters'],
    description: 'Greek Characters code.',
    url: 'https://smartgentools.com/html-code-library/greek-characters.html',
    icon: '🔤'
},
{
    id: 'html-ampersand-code',
    title: 'HTML Ampersand Code',
    category: 'HTML Code Library',
    keywords: ['html ampersand code','ampersand'],
    description: 'HTML Ampersand Code.',
    url: 'https://smartgentools.com/html-code-library/html-ampersand-code.html',
    icon: '&'
},
{
    id: 'html-copyright-code',
    title: 'HTML Copyright Code',
    category: 'HTML Code Library',
    keywords: ['html copyright code','copyright'],
    description: 'HTML Copyright Code.',
    url: 'https://smartgentools.com/html-code-library/html-copyright-code.html',
    icon: '©️'
},
{
    id: 'html-em-dash-code',
    title: 'HTML Em Dash Code',
    category: 'HTML Code Library',
    keywords: ['html em dash code','em dash'],
    description: 'HTML Em Dash Code.',
    url: 'https://smartgentools.com/html-code-library/html-em-dash-code.html',
    icon: '➖'
},
{
    id: 'html-en-dash-code',
    title: 'HTML En Dash Code',
    category: 'HTML Code Library',
    keywords: ['html en dash code','en dash'],
    description: 'HTML En Dash Code.',
    url: 'https://smartgentools.com/html-code-library/html-en-dash-code.html',
    icon: '➖'
},
{
    id: 'html-euro-code',
    title: 'HTML Euro Code',
    category: 'HTML Code Library',
    keywords: ['html euro code','euro symbol'],
    description: 'HTML Euro Code.',
    url: 'https://smartgentools.com/html-code-library/html-euro-code.html',
    icon: '€'
},
{
    id: 'html-heart-code',
    title: 'HTML Heart Code',
    category: 'HTML Code Library',
    keywords: ['html heart code','heart symbol'],
    description: 'HTML Heart Code.',
    url: 'https://smartgentools.com/html-code-library/html-heart-code.html',
    icon: '❤️'
},
{
    id: 'html-space-code',
    title: 'HTML Space Code',
    category: 'HTML Code Library',
    keywords: ['html space code'],
    description: 'HTML Space Code.',
    url: 'https://smartgentools.com/html-code-library/html-space-code.html',
    icon: '⬜'
},
{
    id: 'html-special-characters',
    title: 'HTML Special Characters',
    category: 'HTML Code Library',
    keywords: ['html special characters'],
    description: 'HTML Special Characters.',
    url: 'https://smartgentools.com/html-code-library/html-special-characters.html',
    icon: '🔣'
},
{
    id: 'html-star-code',
    title: 'HTML Star Code',
    category: 'HTML Code Library',
    keywords: ['html star code','star symbol'],
    description: 'HTML Star Code.',
    url: 'https://smartgentools.com/html-code-library/html-star-code.html',
    icon: '⭐'
},
{
    id: 'html-symbols',
    title: 'HTML Symbols',
    category: 'HTML Code Library',
    keywords: ['html symbols'],
    description: 'HTML Symbols.',
    url: 'https://smartgentools.com/html-code-library/html-symbols.html',
    icon: '🔣'
},
{
    id: 'html-tab-code',
    title: 'HTML Tab Code',
    category: 'HTML Code Library',
    keywords: ['html tab code'],
    description: 'HTML Tab Code.',
    url: 'https://smartgentools.com/html-code-library/html-tab-code.html',
    icon: '↹'
},
{
    id: 'html-trademark-code',
    title: 'HTML Trademark Code',
    category: 'HTML Code Library',
    keywords: ['html trademark code','trademark'],
    description: 'HTML Trademark Code.',
    url: 'https://smartgentools.com/html-code-library/html-trademark-code.html',
    icon: '™️'
},
{
    id: 'iso-8859-1-characters',
    title: 'ISO 8859-1 Characters',
    category: 'HTML Code Library',
    keywords: ['iso 8859-1 characters'],
    description: 'ISO 8859-1 Characters.',
    url: 'https://smartgentools.com/html-code-library/iso-8859-1-characters.html',
    icon: '📖'
},
{
    id: 'iso-language-codes',
    title: 'ISO Language Codes',
    category: 'HTML Code Library',
    keywords: ['iso language codes'],
    description: 'ISO Language Codes.',
    url: 'https://smartgentools.com/html-code-library/iso-language-codes.html',
    icon: '🌐'
},{
    id: 'marquee-generator',
    title: 'Marquee Generator',
    category: 'Developer & Technical',
    keywords: ['marquee', 'scrolling text', 'scrolling image', 'html marquee', 'generator', 'animation'],
    description: 'Build classic scrolling marquee text and images with modern CSS animation fallback.',
    url: './marquee-generator/',
    icon: '🔄'
},{
    id: 'pinterest-link-downloader',
    title: 'Pinterest Downloader',
    category: 'Marketing & Social Media',
    keywords: ['pinterest', 'downloader', 'video', 'image', 'gif', 'pin', 'save'],
    description: 'Save Pinterest photos, videos, and GIFs in original quality, no watermark, no login.',
    url: './Pinterest-link-downloader/',
    icon: '📌'
}
	];

// Site sections that aren't individual tools -- used by assets/js/search.js so
// global search can surface "All Tools", "Docs", etc. alongside tool matches,
// not just the 137 entries above.
const PAGES_INDEX = [
    { id: 'tools-hub', title: 'All Tools', keywords: ['tools', 'all tools', 'browse', 'directory'], description: 'Browse and search every SmartGen tool by category.', url: './tools/', icon: '🛠️' },
    { id: 'html-code-library-hub', title: 'HTML Code Library', keywords: ['html', 'css', 'code library', 'snippets', 'generators'], description: '80+ free HTML/CSS generators, editors, and copy-paste reference pages.', url: './html-code-library/', icon: '📚' },
    { id: 'docs-hub', title: 'Developer Docs', keywords: ['docs', 'documentation', 'developer', 'api'], description: 'Guides and reference docs for building with SmartGen.', url: './docs/', icon: '📑' },
    { id: 'blog-hub', title: 'Blog', keywords: ['blog', 'articles', 'guides', 'education'], description: 'In-depth SEO and marketing guides from the SmartGen team.', url: './blog/', icon: '📝' },
    { id: 'paid-tools-hub', title: 'Paid Tools', keywords: ['paid', 'premium', 'automation', 'lead collector', 'chatbot'], description: 'SmartGen\'s premium automation and marketing products.', url: './paid-tools/', icon: '💎' },
    { id: 'seo-audit-tool-page', title: 'SEO Audit Tool', keywords: ['seo audit', 'website audit', 'core web vitals'], description: 'A full 72-point SEO audit of any website, free.', url: './seo-audit-tool/', icon: '📊' },
    { id: 'legal-info-hub', title: 'Legal Info / Trust Centre', keywords: ['legal', 'trust', 'privacy', 'terms', 'reviews'], description: 'Privacy policy, terms, and everything about how SmartGen operates.', url: './smartgen-legal-info/', icon: '⚖️' },
    { id: 'about-page', title: 'About Us', keywords: ['about', 'company', 'founder', 'mission'], description: 'Who builds SmartGen and why.', url: './about/', icon: '📄' },
    { id: 'contact-page', title: 'Contact Us', keywords: ['contact', 'support', 'email', 'help'], description: 'Get in touch with the SmartGen team.', url: './contact/', icon: '📩' },
    { id: 'review-page', title: 'Leave a Review', keywords: ['review', 'rating', 'feedback', 'testimonial'], description: 'Share your experience using SmartGen.', url: './review/', icon: '⭐' },
];

// Search function
function searchTools(query) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    
    return TOOLS_INDEX.filter(tool => {
        // Search in title
        if (tool.title.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (tool.description.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in keywords
        if (tool.keywords.some(keyword => keyword.includes(lowerQuery))) return true;
        
        // Search in category
        if (tool.category.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    }).sort((a, b) => {
        // Prioritize title matches
        const aTitle = a.title.toLowerCase().includes(lowerQuery);
        const bTitle = b.title.toLowerCase().includes(lowerQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
    });
}
