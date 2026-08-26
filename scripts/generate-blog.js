const fs = require('fs');
const path = require('path');
const matter = require('../utils/front-matter.js');
const { marked } = require('marked');

const blogDir = path.join(__dirname, '../blog');
const postsDir = path.join(blogDir, 'posts');
const templatePath = path.join(blogDir, 'post-template.html');
const outputJson = path.join(blogDir, 'blog.json');

// Ensure posts directory exists
if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
}

const template = fs.readFileSync(templatePath, 'utf8');
const posts = [];

// Read all markdown files in blog/posts
const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    const slug = file.replace('.md', '');
    const postUrl = `/blog/posts/${slug}/`;
    const postDir = path.join(blogDir, 'posts', slug);
    
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    const htmlContent = marked(content);
    
    // Replace placeholders in template
    let finalHtml = template
        .replace(/{{title}}/g, data.title || 'Untitled Post')
        .replace(/{{description}}/g, data.description || '')
        .replace(/{{image}}/g, data.image || '/assets/images/blog-default.svg')
        .replace(/{{date}}/g, data.date || new Date().toLocaleDateString())
        .replace(/{{category}}/g, data.category || (data.tags ? data.tags[0] : 'General'))
        .replace(/{{slug}}/g, slug)
        .replace(/{{content}}/g, htmlContent);

    // Write individual post HTML
    fs.writeFileSync(path.join(postDir, 'index.html'), finalHtml);

    // Add to blog.json list
    posts.push({
        title: data.title,
        excerpt: data.description,
        date: data.date,
        tags: data.tags || [],
        image: data.image,
        url: postUrl,
        author: data.author || 'Sayad Md Bayezid Hosan'
    });
});

// Sort posts by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Write blog.json
fs.writeFileSync(outputJson, JSON.stringify(posts, null, 2));

console.log(`Successfully generated ${posts.length} blog posts and blog.json`);
