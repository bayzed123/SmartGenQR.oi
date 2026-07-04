/**
 * SmartGen Homepage Feed
 * Renders blog posts in a Facebook-style feed
 */

document.addEventListener('DOMContentLoaded', async () => {
    const feedContainer = document.getElementById('blog-feed');
    if (!feedContainer) return;

    try {
        const response = await fetch('/blog/blog.json');
        if (!response.ok) throw new Error('Failed to load blog data');
        const posts = await response.json();
        
        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No posts available yet.</p>';
            return;
        }

        renderFeed(posts, feedContainer);
    } catch (error) {
        console.error('Error loading feed:', error);
        feedContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Error loading feed. Please try again later.</p>';
    }
});

function renderFeed(posts, container) {
    container.innerHTML = posts.map(post => {
        const initials = post.author ? post.author.split(' ').map(n => n[0]).join('') : 'SG';
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        return `
            <div class="feed-post reveal-up">
                <div class="feed-post-header">
                    <div class="author-avatar">${initials}</div>
                    <div class="post-meta-info">
                        <span class="post-author-name">${post.author || 'SmartGen Team'}</span>
                        <span class="post-date">${formattedDate} • 🌍 Public</span>
                    </div>
                </div>
                <div class="feed-post-content">
                    <h2 class="feed-post-title">${post.title}</h2>
                    <p class="feed-post-excerpt">${post.description}</p>
                </div>
                <a href="/blog/${post.slug}/">
                    <img src="${post.image}" alt="${post.title}" class="feed-post-image" onerror="this.src='/assets/images/blog-default.jpg'">
                </a>
                <div class="feed-post-footer">
                    <a href="/blog/${post.slug}/" class="feed-action-btn">
                        <span>📖</span> Read More
                    </a>
                    <a href="https://github.com/bayzed123/SmartGenQR.oi" target="_blank" class="feed-action-btn">
                        <span>💻</span> Open Source
                    </a>
                    <a href="#" class="feed-action-btn" onclick="event.preventDefault(); navigator.share({title: '${post.title}', url: '/blog/${post.slug}/'})">
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
