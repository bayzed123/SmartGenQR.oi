/**
 * SmartGen Blog Frontend
 * Handles dynamic blog rendering, filtering, search, related posts, and scroll animations
 */

document.addEventListener('DOMContentLoaded', async () => {
  const blogGrid = document.getElementById('blog-grid');
  const filterContainer = document.getElementById('blog-filters');
  const relatedPostsGrid = document.getElementById('related-posts-grid');

  // Determine if we're on the archive page or a single post page
  if (blogGrid && filterContainer) {
    await initBlogArchive();
  } else if (relatedPostsGrid) {
    await initRelatedPosts();
  }

  // Present on both the archive page and every single post page.
  initNewsletterForm();

  // Initial trigger for elements already in viewport
  setTimeout(handleScrollReveal, 100);
});

/* ==========================================
   NEWSLETTER SIGNUP -- real lead capture
   ========================================== */

// Configured once in assets/js/app.js; a page-level <meta> can override it.
// Same resolution order as chatbot.js / seo-audit-tool/audit.js so every
// frontend that talks to the Worker agrees on where it lives.
const NEWSLETTER_API_BASE = (function () {
  const meta = document.querySelector('meta[name="smartgen-api"]');
  const configured =
    (meta && meta.getAttribute('content')) ||
    window.SMARTGEN_API_BASE ||
    'https://smartgen-platforms.sayadmdbayezidhosan.workers.dev';
  return configured.replace(/\/+$/, '');
})();

/**
 * Wires up every "Join the SmartGen Community" form on the page (there's
 * one on the archive page and one on each post) to actually submit to the
 * Worker's /api/lead endpoint as a leadType: 'newsletter_subscribe' lead,
 * instead of the no-op action="#" it shipped with.
 */
function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-section form');
  forms.forEach((form) => {
    form.addEventListener('submit', handleNewsletterSubmit);
  });
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const section = form.closest('.newsletter-section');
  const feedback = section ? section.querySelector('.newsletter-feedback') : null;
  const emailInput = form.querySelector('input[type="email"]');
  const honeypot = form.querySelector('.newsletter-hp');
  const button = form.querySelector('button[type="submit"]');
  const email = (emailInput ? emailInput.value : '').trim();

  const setFeedback = (message, kind) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    if (kind) feedback.classList.add(kind);
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    setFeedback('Please enter a valid email address.', 'is-error');
    if (emailInput) emailInput.focus();
    return;
  }

  const originalButtonText = button ? button.textContent : '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Subscribing…';
  }
  if (emailInput) emailInput.disabled = true;
  setFeedback('', null);

  fetch(NEWSLETTER_API_BASE + '/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead: {
        leadType: 'newsletter_subscribe',
        email: email,
        company_website: honeypot ? honeypot.value : '',
        source: 'blog_newsletter',
        websiteUrl: window.location.href,
      },
    }),
  })
    .then((res) =>
      res
        .json()
        .catch(() => ({ ok: false, error: 'The server returned an unreadable response.' }))
    )
    .then((data) => {
      if (data && data.ok) {
        setFeedback('✅ You\'re subscribed! Check your inbox for a confirmation.', 'is-success');
        form.reset();
      } else {
        setFeedback((data && data.error) || 'Something went wrong. Please try again.', 'is-error');
      }
    })
    .catch(() => {
      setFeedback('Network error — please check your connection and try again.', 'is-error');
    })
    .finally(() => {
      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
      if (emailInput) emailInput.disabled = false;
    });
}

/* ==========================================
   SCROLL REVEAL ANIMATION LOGIC
   ========================================== */
function handleScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const windowHeight = window.innerHeight;
  const elementVisible = 100; // Trigger point (100px from bottom)

  reveals.forEach((reveal) => {
    const elementTop = reveal.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add('active');
    }
  });
}

// Listen to scroll events
window.addEventListener('scroll', handleScrollReveal);

/**
 * Fetch blog data from blog.json
 */
async function fetchBlogData() {
  try {
    const response = await fetch('/blog/blog.json');
    if (!response.ok) throw new Error('Failed to load blog data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return [];
  }
}

/**
 * Initialize the blog archive page
 */
async function initBlogArchive() {
  const blogGrid = document.getElementById('blog-grid');
  const filterContainer = document.getElementById('blog-filters');
  const blogSearchInput = document.getElementById('blog-search-input');
  const posts = await fetchBlogData();

  if (posts.length === 0) {
    blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem;">No blog posts found yet. Check back soon!</p>';
    return;
  }

  // Fixed Premium Categories + Dynamic Tags
  const allTags = new Set(['All', 'Tools Blog', 'Open Source Guidelines', 'Daily Tech Blog']);
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => allTags.add(tag));
    }
  });

  // Render filter buttons
  renderFilters(Array.from(allTags));

  // Render all posts initially
  renderPosts(posts);

  // Filter event listeners
  filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-tag')) {
      const selectedTag = e.target.getAttribute('data-tag');

      // Update active state
      document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Filter and render
      const filteredPosts = selectedTag === 'All'
        ? posts
        : posts.filter(post => post.tags && post.tags.includes(selectedTag));

      renderPosts(filteredPosts);
    }
  });

  // Search functionality
  if (blogSearchInput) {
    blogSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      renderPosts(filteredPosts);
    });
  }
}

/**
 * Render filter buttons
 */
function renderFilters(tags) {
  const filterContainer = document.getElementById('blog-filters');
  filterContainer.innerHTML = tags.map(tag => `
    <button class="filter-tag ${tag === 'All' ? 'active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');
}

/**
 * Render blog posts to the grid
 */
function renderPosts(posts) {
  const blogGrid = document.getElementById('blog-grid');

  if (posts.length === 0) {
    blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem;">No posts match your search. Try a different query!</p>';
    return;
  }

  blogGrid.innerHTML = posts.map((post, index) => {
    // Staggered animation delay for cards (0ms, 100ms, 200ms)
    const delayClass = index % 3 === 0 ? '' : (index % 3 === 1 ? 'delay-100' : 'delay-200');

    return `
    <a href="/blog/${post.slug}/" class="blog-card reveal-up ${delayClass}">
      <img src="${post.image}" alt="${post.title}" class="blog-card-image" onerror="this.src='/assets/images/blog-default.jpg'">
      <div class="blog-card-content">
        <span class="blog-card-tag">${post.tags && post.tags.length > 0 ? post.tags[0] : 'General'}</span>
        <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(post.description)}</p>
        
        <!-- Premium Animated Read Article Button -->
        <div class="premium-read-btn">
          Read Article 
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

      </div>
      <div class="blog-card-footer">
        <span>${escapeHtml(post.author)}</span>
        <span>${formatDate(post.date)}</span>
      </div>
    </a>
  `}).join('');

  // Trigger reveal animation for newly added posts
  setTimeout(handleScrollReveal, 50);
}

/**
 * Initialize related posts on single post page. Ranks by number of shared
 * tags (not just "any tag matches") and shows up to 10 as an auto-scrolling
 * carousel -- static markup on the page still only has a plain
 * #related-posts-grid.blog-grid div; this restructures it into the
 * carousel at runtime so the 48 already-built post pages never needed to
 * be touched individually.
 */
async function initRelatedPosts() {
  const relatedPostsSection = document.querySelector('.blog-related-posts');
  if (!relatedPostsSection) return;

  const posts = await fetchBlogData();
  const currentSlug = relatedPostsSection.getAttribute('data-post-slug');
  const currentTags = relatedPostsSection.getAttribute('data-post-tags').split(',').filter(t => t);

  // Rank by number of shared tags, not just "at least one matches", so the
  // closest posts surface first when there are many candidates.
  const relatedPosts = posts
    .filter((p) => p.slug !== currentSlug && Array.isArray(p.tags) && p.tags.length > 0)
    .map((p) => ({ post: p, score: p.tags.filter((t) => currentTags.includes(t)).length }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r) => r.post);

  const relatedPostsGrid = document.getElementById('related-posts-grid');
  if (!relatedPostsGrid) return;

  if (relatedPosts.length === 0) {
    relatedPostsSection.style.display = 'none';
  } else {
    const cardsHTML = relatedPosts
      .map(
        (post) => `
    <a href="/blog/${post.slug}/" class="blog-card">
      <img src="${post.image}" alt="${escapeHtml(post.title)}" class="blog-card-image" loading="lazy" onerror="this.src='/assets/images/blog-default.jpg'">
      <div class="blog-card-content">
        <h3 class="blog-card-title" style="font-size: 1.1rem;">${escapeHtml(post.title)}</h3>
        <div style="margin-top: 1rem;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--blog-primary);">Read Post →</span>
        </div>
      </div>
    </a>`
      )
      .join('');

    // Fewer than 4 cards can't loop seamlessly (the "second half" of the
    // 50%-translate animation would repeat near-immediately) -- show those
    // as a static row instead of animating.
    const canScroll = relatedPosts.length >= 4;
    relatedPostsGrid.className = 'related-posts-carousel';
    relatedPostsGrid.innerHTML = `<div class="related-posts-track${canScroll ? '' : ' no-scroll'}">${cardsHTML}${
      canScroll ? cardsHTML : ''
    }</div>`;
  }

  // Trigger reveal for related posts, then a related-tools mini grid below.
  setTimeout(handleScrollReveal, 50);
  initRelatedTools(relatedPostsSection, currentTags);
}

/**
 * Small grid of SmartGen tools relevant to this post's tags/title, inserted
 * right after the related-posts section. Needs TOOLS_INDEX from
 * search-data.js (loaded alongside blog.js on post pages); degrades to a
 * no-op if that script isn't present for some reason.
 */
function initRelatedTools(relatedPostsSection, currentTags) {
  if (typeof TOOLS_INDEX === 'undefined' || !Array.isArray(TOOLS_INDEX)) return;
  if (document.querySelector('.related-tools-mini')) return; // don't double-insert

  const titleEl = document.querySelector('.blog-post-title, h1');
  const titleWords = (titleEl ? titleEl.textContent : '').toLowerCase();
  const tagWords = currentTags.join(' ').toLowerCase();
  const haystack = `${titleWords} ${tagWords}`;

  const scored = TOOLS_INDEX.map((tool) => {
    let score = 0;
    (tool.keywords || []).forEach((k) => {
      if (haystack.includes(k.toLowerCase())) score += 2;
    });
    if (tool.title && haystack.includes(tool.title.toLowerCase())) score += 3;
    return { tool, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => r.tool);

  if (scored.length === 0) return;

  const gridHTML = scored
    .map((tool) => {
      const url = /^https?:\/\//i.test(tool.url) ? tool.url : '/' + tool.url.replace(/^\.\//, '');
      return `
    <a href="${url}">
      <span class="related-tools-mini-icon">${tool.icon || '🔗'}</span>
      <div>
        <h4>${escapeHtml(tool.title)}</h4>
        <p>${escapeHtml(tool.category || '')}</p>
      </div>
    </a>`;
    })
    .join('');

  relatedPostsSection.insertAdjacentHTML(
    'afterend',
    `<section class="related-tools-mini reveal-up">
      <h3 class="related-tools-mini-title">🛠️ Tools That Pair With This Post</h3>
      <div class="related-tools-mini-grid">${gridHTML}</div>
    </section>`
  );

  setTimeout(handleScrollReveal, 50);
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Utility: Format date
 */
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}
