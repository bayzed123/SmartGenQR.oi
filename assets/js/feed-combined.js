/**
 * SmartGen Combined Feed System
 * Renders blog posts and docs in a Facebook-style feed with category filtering
 * Supports both blog.json and docs.json for unified content display
 */

document.addEventListener('DOMContentLoaded', async () => {
    const feedContainer = document.getElementById('blog-feed');
    if (!feedContainer) return;

    try {
        // Load both blog and docs data
        const [blogResponse, docsResponse] = await Promise.all([
            fetch('/blog/blog.json'),
            fetch('/docs/docs.json').catch(() => ({ ok: false })) // Docs might not exist yet
        ]);

        let allPosts = [];

        // Load blog posts
        if (blogResponse.ok) {
            const blogPosts = await blogResponse.json();
            allPosts = allPosts.concat(blogPosts.map(post => ({
                ...post,
                type: 'blog',
                url: `/blog/${post.slug}/`
            })));
        }

        // Load docs posts if available
        if (docsResponse.ok) {
            const docsPosts = await docsResponse.json();
            allPosts = allPosts.concat(docsPosts.map(doc => ({
                ...doc,
                type: 'docs',
                url: `/docs/${doc.slug}/`,
                category: doc.category || 'Documentation'
            })));
        }

        if (allPosts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No posts available yet.</p>';
            return;
        }

        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // Extract unique categories
        const categories = [...new Set(allPosts.map(post => post.category || 'General'))];

        // Create category filter UI
        createCategoryFilter(categories, allPosts, feedContainer);

        // Initial render with all posts
        renderFeed(allPosts, feedContainer);

    } catch (error) {
        console.error('Error loading feed:', error);
        feedContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Error loading feed. Please try again later.</p>';
    }
});

function createCategoryFilter(categories, allPosts, feedContainer) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filter-container';
    filterContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 2rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border);
    `;

    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.textContent = '📌 All Posts';
    allBtn.className = 'category-filter-btn active';
    allBtn.style.cssText = `
        padding: 0.6rem 1.2rem;
        border: 2px solid var(--primary);
        background: var(--primary);
        color: white;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    `;
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
            btn.style.borderColor = 'var(--border)';
        });
        allBtn.style.background = 'var(--primary)';
        allBtn.style.color = 'white';
        allBtn.style.borderColor = 'var(--primary)';
        renderFeed(allPosts, feedContainer);
    });
    filterContainer.appendChild(allBtn);

    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = `${getCategoryIcon(category)} ${category}`;
        btn.className = 'category-filter-btn';
        btn.style.cssText = `
            padding: 0.6rem 1.2rem;
            border: 2px solid var(--border);
            background: transparent;
            color: var(--text-secondary);
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        `;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-filter-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'var(--text-secondary)';
                b.style.borderColor = 'var(--border)';
            });
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--primary)';
            
            const filteredPosts = allPosts.filter(post => post.category === category);
            renderFeed(filteredPosts, feedContainer);
        });
        filterContainer.appendChild(btn);
    });

    feedContainer.parentElement.insertBefore(filterContainer, feedContainer);
}

function getCategoryIcon(category) {
    const icons = {
        'Blog': '📝',
        'Documentation': '📚',
        'Tools': '🛠️',
        'Guides': '📖',
        'General': '📌',
        'Tools Blog': '🔧',
        'Tutorials': '🎓',
        'News': '📰',
        'Updates': '✨'
    };
    return icons[category] || '📌';
}

function renderFeed(posts, container) {
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">No posts in this category.</p>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const initials = post.author ? post.author.split(' ').map(n => n[0]).join('') : 'SG';
        const formattedDate = new Date(post.date || new Date()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const typeLabel = post.type === 'docs' ? '📚 Docs' : '📝 Blog';
        const categoryLabel = post.category ? `${getCategoryIcon(post.category)} ${post.category}` : '';

        return `
            <div class="feed-post reveal-up">
                <div class="feed-post-header">
                    <div class="author-avatar">${initials}</div>
                    <div class="post-meta-info">
                        <span class="post-author-name">${post.author || 'SmartGen Team'}</span>
                        <span class="post-date">${formattedDate} • ${typeLabel} • ${categoryLabel}</span>
                    </div>
                </div>
                <div class="feed-post-content">
                    <h2 class="feed-post-title">${post.title}</h2>
                    <p class="feed-post-excerpt">${post.description || ''}</p>
                </div>
                ${post.image ? `
                <a href="${post.url}">
                    <img src="${post.image}" alt="${post.title}" class="feed-post-image" onerror="this.src='/assets/images/blog-default.jpg'">
                </a>
                ` : ''}
                <div class="feed-post-footer">
                    <a href="${post.url}" class="feed-action-btn">
                        <span>${post.type === 'docs' ? '📚' : '📖'}</span> ${post.type === 'docs' ? 'Read Docs' : 'Read More'}
                    </a>
                    <a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" class="feed-action-btn">
                        <span>💻</span> Open Source
                    </a>
                    <a href="#" class="feed-action-btn" onclick="event.preventDefault(); navigator.share({title: '${post.title}', url: '${post.url}'})">
                        <span>📤</span> Share
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Trigger reveal animation if defined in app.js or blog.js
    if (typeof handleScrollReveal === 'function') {
        setTimeout(handleScrollReveal, 100);
    }
}
