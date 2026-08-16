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

// The homepage used to render every post at once: 64 cards and 64 covers
// built into the DOM on first paint, all competing with the hero for the
// mobile main thread. Render one screenful, then append the rest as the
// reader approaches them. Every post keeps its own indexed URL and stays in
// the sitemap, so nothing is hidden from crawlers by doing this.
const FEED_INITIAL = 8;
const FEED_BATCH = 8;

function feedCardHTML(post) {
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
                    <img src="${post.image}" alt="${post.title}" class="feed-post-image" width="1200" height="630" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='/assets/images/blog-default.svg'">
                </a>
                <div class="feed-post-footer">
                    <a href="/blog/${post.slug}/" class="feed-action-btn">
                        <span>📖</span> Read More
                    </a>
                    <a href="#" class="feed-action-btn" onclick="event.preventDefault(); navigator.share({title: '${post.title}', url: '/blog/${post.slug}/'})">
                        <span>📤</span> Share
                    </a>
                </div>
            </div>
        `;
}

function revealNewCards() {
    if (typeof handleScrollReveal === 'function') setTimeout(handleScrollReveal, 100);
}

function renderFeed(posts, container) {
    let shown = 0;

    const appendBatch = (n) => {
        const slice = posts.slice(shown, shown + n);
        if (!slice.length) return false;
        container.insertAdjacentHTML('beforeend', slice.map(feedCardHTML).join(''));
        shown += slice.length;
        revealNewCards();
        return true;
    };

    container.innerHTML = '';
    appendBatch(FEED_INITIAL);

    if (shown >= posts.length) return;

    // A sentinel after the last card pulls in the next batch as it comes into
    // view. Falls back to a button where IntersectionObserver is unavailable,
    // so the remaining posts are always reachable.
    const sentinel = document.createElement('div');
    sentinel.className = 'feed-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    container.after(sentinel);

    if (!('IntersectionObserver' in window)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'feed-load-more';
        btn.textContent = 'Load more posts';
        btn.addEventListener('click', () => {
            appendBatch(FEED_BATCH);
            if (shown >= posts.length) btn.remove();
        });
        sentinel.appendChild(btn);
        return;
    }

    const io = new IntersectionObserver((entries) => {
        if (!entries.some(e => e.isIntersecting)) return;
        appendBatch(FEED_BATCH);
        if (shown >= posts.length) {
            io.disconnect();
            sentinel.remove();
        }
    }, { rootMargin: '600px 0px' });   // start fetching before it is on screen
    io.observe(sentinel);
}