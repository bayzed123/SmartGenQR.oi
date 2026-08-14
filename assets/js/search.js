/**
 * Global site search — tools, key pages, and blog posts in one dropdown.
 *
 * Wires up any element with id="live-search-container" (must contain
 * #search-input, #search-results, and optionally #search-clear). Needs
 * assets/js/search-data.js loaded first for TOOLS_INDEX/PAGES_INDEX/
 * searchTools(); blog posts are fetched lazily from /blog/blog.json (the
 * same file the blog listing page itself renders from) and cached after
 * the first search.
 */
document.addEventListener('DOMContentLoaded', () => {
    initLiveSearch();
});

let _blogIndexPromise = null;
function loadBlogIndex() {
    if (!_blogIndexPromise) {
        // Root-relative so this works the same regardless of how deep the
        // current page is nested.
        _blogIndexPromise = fetch('/blog/blog.json')
            .then((r) => (r.ok ? r.json() : []))
            .then((posts) =>
                Array.isArray(posts)
                    ? posts.map((p) => ({
                          title: p.title || '',
                          description: p.description || '',
                          url: '/blog/' + p.slug + '/',
                          icon: '📝',
                      }))
                    : []
            )
            .catch(() => []);
    }
    return _blogIndexPromise;
}

function initLiveSearch() {
    const searchContainer = document.getElementById('live-search-container');
    if (!searchContainer) return;

    const searchInput = searchContainer.querySelector('#search-input');
    const searchResults = searchContainer.querySelector('#search-results');
    const clearBtn = searchContainer.querySelector('#search-clear');

    if (!searchInput || !searchResults) return;

    // Warm the blog index on first focus so the first real keystroke isn't
    // the one paying for the network round trip.
    searchInput.addEventListener('focus', () => {
        loadBlogIndex();
        if (searchInput.value.trim().length > 0) searchResults.style.display = 'block';
    });

    let debounceTimer = null;
    let searchToken = 0;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (clearBtn) clearBtn.style.display = query.trim().length ? 'flex' : 'none';

        if (query.trim().length === 0) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        clearTimeout(debounceTimer);
        const thisToken = ++searchToken;
        debounceTimer = setTimeout(async () => {
            const results = await runSearch(query);
            // A newer keystroke may have started a fresher search while this
            // one was waiting on the blog fetch -- drop stale results.
            if (thisToken !== searchToken) return;
            displaySearchResults(results, searchResults, query);
        }, 120);
    });

    // Deep-linkable search: /?q=qr+code prefills and runs the search on load.
    // This is what the homepage's WebSite/SearchAction structured data points
    // at, so it has to genuinely work -- declaring a search endpoint that
    // does nothing would just be a false claim in the markup.
    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery && initialQuery.trim()) {
        searchInput.value = initialQuery;
        if (clearBtn) clearBtn.style.display = 'flex';
        loadBlogIndex();
        (async () => {
            const results = await runSearch(initialQuery);
            displaySearchResults(results, searchResults, initialQuery);
            searchResults.style.display = 'block';
        })();
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            clearBtn.style.display = 'none';
            searchInput.focus();
        });
    }

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

async function runSearch(query) {
    const lowerQuery = query.toLowerCase().trim();

    const tools = (typeof searchTools === 'function' ? searchTools(query) : []).slice(0, 6);

    const pages = (typeof PAGES_INDEX !== 'undefined' ? PAGES_INDEX : [])
        .filter((p) => matchesQuery(p, lowerQuery))
        .slice(0, 4);

    const blogIndex = await loadBlogIndex();
    const blog = blogIndex.filter((p) => matchesQuery(p, lowerQuery)).slice(0, 4);

    return { tools, pages, blog };
}

function matchesQuery(entry, lowerQuery) {
    if (entry.title && entry.title.toLowerCase().includes(lowerQuery)) return true;
    if (entry.description && entry.description.toLowerCase().includes(lowerQuery)) return true;
    if (entry.keywords && entry.keywords.some((k) => k.toLowerCase().includes(lowerQuery))) return true;
    return false;
}

/** ./foo/ and foo/ both resolve correctly from any page depth as /foo/; leave absolute URLs alone. */
function normalizeResultUrl(url) {
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return url;
    return '/' + url.replace(/^\.\//, '');
}

function displaySearchResults(grouped, container, query) {
    const groups = [
        { label: 'Tools', items: grouped.tools },
        { label: 'Pages', items: grouped.pages },
        { label: 'Blog', items: grouped.blog },
    ].filter((g) => g.items.length > 0);

    const total = groups.reduce((n, g) => n + g.items.length, 0);

    if (total === 0) {
        container.innerHTML = `
            <div class="search-no-results">
                <p>No results for "${escapeHTML(query)}". Try different keywords.</p>
                <a href="/contact/" class="search-request-link">Request a Tool</a>
            </div>
        `;
        container.style.display = 'block';
        return;
    }

    const groupsHTML = groups
        .map(
            (g) => `
        <div class="search-results-group">
            <div class="search-results-group-label">${g.label}</div>
            ${g.items.map(resultItemHTML).join('')}
        </div>
    `
        )
        .join('');

    container.innerHTML = `
        <div class="search-results-header">
            <span class="search-results-count">${total} result${total !== 1 ? 's' : ''} found</span>
        </div>
        <div class="search-results-list">${groupsHTML}</div>
    `;

    container.style.display = 'block';
}

function resultItemHTML(item) {
    const url = normalizeResultUrl(item.url);
    const subtitle = item.category || item.description || '';
    return `
        <a href="${url}" class="search-result-item">
            <div class="search-result-icon">${item.icon || '🔗'}</div>
            <div class="search-result-content">
                <div class="search-result-title">${escapeHTML(item.title)}</div>
                <div class="search-result-category">${escapeHTML(subtitle)}</div>
            </div>
        </a>
    `;
}

function escapeHTML(str) {
    return String(str == null ? '' : str).replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
}
