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
    initReviews();
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
const BLOG_API_BASE = (function () {
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
  // Optional -- the Worker substitutes "Newsletter Subscriber" when it is
  // blank, so leaving it empty must never block a subscription.
  const nameInput = form.querySelector('input[name="name"]');
  const honeypot = form.querySelector('.newsletter-hp');
  const button = form.querySelector('button[type="submit"]');
  const email = (emailInput ? emailInput.value : '').trim();
  const fullName = (nameInput ? nameInput.value : '').trim();

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
  if (nameInput) nameInput.disabled = true;
  setFeedback('', null);

  fetch(BLOG_API_BASE + '/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lead: {
        leadType: 'newsletter_subscribe',
        fullName: fullName,
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
      if (nameInput) nameInput.disabled = false;
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

  // Tags, ranked by how many posts actually use them. The old version put
  // every tag on the site into this bar as its own pill -- 160+ of them,
  // most used by exactly one post -- which is what produced the wall of
  // chips several screens tall. Only the most-used tags earn a spot in the
  // default row now; the long tail is still fully searchable via the
  // search box above, so nothing is lost, just decluttered.
  const TOP_TAG_COUNT = 10;
  const tagCounts = new Map();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
    }
  });
  const sortedTags = Array.from(tagCounts.keys()).sort(
    (a, b) => tagCounts.get(b) - tagCounts.get(a) || a.localeCompare(b)
  );
  const topTags = sortedTags.slice(0, TOP_TAG_COUNT);
  const restTags = sortedTags.slice(TOP_TAG_COUNT);

  // Render filter buttons
  renderFilters(topTags, restTags);

  // Render all posts initially
  renderPosts(posts);

  // Filter event listeners. Delegated from the shared parent, not
  // filterContainer itself -- the "more topics" panel renders as a sibling
  // right after #blog-filters (so it can collapse independently of the
  // horizontal-scroll strip), which would put it outside filterContainer's
  // own subtree.
  filterContainer.parentElement.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;

    if (btn.classList.contains('filter-tag-more')) {
      const moreRow = document.getElementById('blog-filters-more');
      if (moreRow) moreRow.classList.toggle('is-open');
      btn.classList.toggle('active');
      btn.textContent = moreRow && moreRow.classList.contains('is-open') ? 'Fewer Topics ▴' : 'More Topics ▾';
      return;
    }

    const selectedTag = btn.getAttribute('data-tag');

    // Update active state
    document.querySelectorAll('.filter-tag:not(.filter-tag-more)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter and render
    const filteredPosts = selectedTag === 'All'
      ? posts
      : posts.filter(post => post.tags && post.tags.includes(selectedTag));

    renderPosts(filteredPosts);
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
 * Render filter buttons: "All" + the top-used tags as a single scrollable
 * row, plus an optional "More Topics" toggle that reveals the long tail
 * (still click-to-filter, just tucked away instead of always visible).
 */
function renderFilters(topTags, restTags) {
  const filterContainer = document.getElementById('blog-filters');
  const topRow = ['All', ...topTags]
    .map(tag => `<button class="filter-tag ${tag === 'All' ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
    .join('');

  const moreToggle = restTags.length
    ? `<button type="button" class="filter-tag filter-tag-more">More Topics ▾</button>`
    : '';

  filterContainer.innerHTML = topRow + moreToggle;

  // The long tail renders as a separate, collapsed-by-default wrapped panel
  // right below the scroll strip, not merged into it -- so it never pushes
  // that strip back into a wall.
  const existingMoreRow = document.getElementById('blog-filters-more');
  if (existingMoreRow) existingMoreRow.remove();

  if (restTags.length) {
    const moreRow = document.createElement('div');
    moreRow.id = 'blog-filters-more';
    moreRow.className = 'blog-filters-more';
    moreRow.innerHTML = restTags
      .map(tag => `<button class="filter-tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
      .join('');
    filterContainer.insertAdjacentElement('afterend', moreRow);
  }
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
      <img src="${post.image}" alt="${post.title}" class="blog-card-image" width="1200" height="630" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='/assets/images/blog-default.svg'">
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
      <img src="${post.image}" alt="${escapeHtml(post.title)}" class="blog-card-image" width="1200" height="630" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='/assets/images/blog-default.svg'">
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

/* ==========================================
   PER-POST RATINGS & REVIEWS
   ========================================== */

const REVIEW_AVATAR_COLORS = ['#2563eb', '#ff3b5c', '#f59e0b', '#7c3aed', '#16a34a', '#fb923c', '#0ea5e9', '#ec4899'];

function reviewStarSVGs(filled, total) {
  total = total || 5;
  let out = '';
  for (let i = 1; i <= total; i++) {
    out +=
      '<svg viewBox="0 0 24 24" fill="' +
      (i <= filled ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  return out;
}

function reviewAvatarFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = REVIEW_AVATAR_COLORS[Math.abs(hash) % REVIEW_AVATAR_COLORS.length];
  const initial = (name.trim()[0] || '?').toUpperCase();
  return { color, initial };
}

/**
 * Adds a "Rate & Review This Post" section near the bottom of a blog post:
 * average rating + count, a star-picker submission form, and the review
 * list, all backed by the Worker's per-post /api/reviews endpoint (a
 * separate store from the sitewide testimonial widget on /review/ and
 * /tools/, which has no concept of "which page" a review belongs to).
 */
function initReviews() {
  const slugMatch = window.location.pathname.match(/\/blog\/([^/]+)\/?$/);
  const slug = slugMatch ? slugMatch[1] : null;
  if (!slug) return;

  const anchor =
    document.querySelector('.related-tools-mini') || document.querySelector('.blog-related-posts');
  if (!anchor) return;

  anchor.insertAdjacentHTML(
    'afterend',
    `<section class="blog-reviews reveal-up" data-post-slug="${slug}">
      <h2 class="blog-reviews-title">⭐ Rate &amp; Review This Post</h2>
      <div class="blog-reviews-summary">
        <div>
          <div class="blog-reviews-avg" id="reviewsAvg">–</div>
        </div>
        <div>
          <div class="blog-reviews-stars" id="reviewsStarsBig">${reviewStarSVGs(0)}</div>
          <div class="blog-reviews-count" id="reviewsCount">No reviews yet</div>
        </div>
      </div>
      <form class="blog-review-form" id="reviewForm" novalidate>
        <h4>Share your thoughts</h4>
        <div class="blog-review-star-input" id="reviewStarInput">
          ${[1, 2, 3, 4, 5]
            .map((v) => `<button type="button" data-v="${v}" aria-label="${v} star${v > 1 ? 's' : ''}">${reviewStarSVGs(1, 1)}</button>`)
            .join('')}
        </div>
        <div class="blog-review-form-row">
          <input type="text" id="reviewName" placeholder="Your name (optional)" maxlength="60">
        </div>
        <div class="blog-review-form-row">
          <textarea id="reviewComment" placeholder="What did you think of this post?" maxlength="800" required></textarea>
        </div>
        <input type="text" id="reviewHoneypot" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" class="newsletter-hp">
        <button type="submit" id="reviewSubmitBtn">Submit Review</button>
        <p class="blog-review-feedback" id="reviewFeedback" role="status" aria-live="polite"></p>
      </form>
      <div class="blog-review-list" id="reviewList">
        <p class="blog-review-empty">Loading reviews…</p>
      </div>
    </section>`
  );

  setTimeout(handleScrollReveal, 50);
  wireReviewForm(slug);
  loadReviews(slug);
}

function wireReviewForm(slug) {
  const form = document.getElementById('reviewForm');
  const starInput = document.getElementById('reviewStarInput');
  const feedback = document.getElementById('reviewFeedback');
  let selectedStars = 0;

  starInput.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedStars = Number(btn.dataset.v);
      starInput.querySelectorAll('button').forEach((b) => {
        const active = Number(b.dataset.v) <= selectedStars;
        b.classList.toggle('active', active);
        b.innerHTML = reviewStarSVGs(active ? 1 : 0, 1);
      });
    });
  });

  const setFeedback = (message, kind) => {
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    if (kind) feedback.classList.add(kind);
  };

  // The form is `novalidate` on purpose. The textarea is still marked
  // `required` for assistive tech, but native validation would abort the
  // submit before this handler runs -- so a reader who forgot the star rating
  // got a browser tooltip pointing at the comment box instead of the message
  // explaining what is actually missing. Validation lives here, in one place.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();
    const honeypot = document.getElementById('reviewHoneypot').value;
    const button = document.getElementById('reviewSubmitBtn');

    if (selectedStars === 0) {
      setFeedback('Please choose a star rating.', 'is-error');
      return;
    }
    if (comment.length < 3) {
      setFeedback('Please write a short review before submitting.', 'is-error');
      return;
    }

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Submitting…';
    setFeedback('', null);

    fetch(BLOG_API_BASE + '/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: slug,
        name: name,
        rating: selectedStars,
        comment: comment,
        company_website: honeypot,
      }),
    })
      .then((res) => res.json().catch(() => ({ ok: false, error: 'The server returned an unreadable response.' })))
      .then((data) => {
        if (data && data.ok) {
          setFeedback('✅ Thanks for the review!', 'is-success');
          form.reset();
          selectedStars = 0;
          starInput.querySelectorAll('button').forEach((b) => {
            b.classList.remove('active');
            b.innerHTML = reviewStarSVGs(0, 1);
          });
          loadReviews(slug);
        } else {
          setFeedback((data && data.error) || 'Something went wrong. Please try again.', 'is-error');
        }
      })
      .catch(() => setFeedback('Network error — please check your connection and try again.', 'is-error'))
      .finally(() => {
        button.disabled = false;
        button.textContent = originalText;
      });
  });
}

function loadReviews(slug) {
  const listEl = document.getElementById('reviewList');
  fetch(BLOG_API_BASE + '/api/reviews?slug=' + encodeURIComponent(slug))
    .then((res) => res.json())
    .then((data) => renderReviews(data.reviews || [], data.average || 0))
    .catch(() => {
      if (listEl) listEl.innerHTML = '<p class="blog-review-empty">Reviews are being set up — check back soon.</p>';
    });
}

function renderReviews(reviews, average) {
  const avgEl = document.getElementById('reviewsAvg');
  const starsEl = document.getElementById('reviewsStarsBig');
  const countEl = document.getElementById('reviewsCount');
  const listEl = document.getElementById('reviewList');
  if (!avgEl || !starsEl || !countEl || !listEl) return;

  if (reviews.length === 0) {
    avgEl.textContent = '–';
    starsEl.innerHTML = reviewStarSVGs(0);
    countEl.textContent = 'No reviews yet';
    listEl.innerHTML = '<p class="blog-review-empty">No reviews yet — be the first to share yours!</p>';
    return;
  }

  avgEl.textContent = average.toFixed(1);
  starsEl.innerHTML = reviewStarSVGs(Math.round(average));
  countEl.textContent = 'based on ' + reviews.length + (reviews.length === 1 ? ' review' : ' reviews');

  listEl.innerHTML = reviews
    .map((r) => {
      const avatar = reviewAvatarFor(r.name);
      return `
    <div class="blog-review-card">
      <div class="blog-review-avatar" style="background:${avatar.color}">${avatar.initial}</div>
      <div class="blog-review-body">
        <div class="blog-review-top">
          <span class="blog-review-name">${escapeHtml(r.name)}</span>
          <span class="blog-reviews-stars">${reviewStarSVGs(r.rating)}</span>
        </div>
        <div class="blog-review-date">${r.date ? formatDate(r.date) : ''}</div>
        <p class="blog-review-comment">${escapeHtml(r.comment)}</p>
      </div>
    </div>`;
    })
    .join('');
}
