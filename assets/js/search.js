// Live Search Implementation
document.addEventListener('DOMContentLoaded', () => {
    initLiveSearch();
});

function initLiveSearch() {
    const searchContainer = document.getElementById('live-search-container');
    if (!searchContainer) return;

    const searchInput = searchContainer.querySelector('#search-input');
    const searchResults = searchContainer.querySelector('#search-results');
    const clearBtn = searchContainer.querySelector('#search-clear');

    if (!searchInput || !searchResults) return;

    // Handle input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        if (query.trim().length === 0) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'flex';
        const results = searchTools(query);
        displaySearchResults(results, searchResults);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        clearBtn.style.display = 'none';
        searchInput.focus();
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Show results on focus if there's text
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            searchResults.style.display = 'block';
        }
    });
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-no-results">
                <p>No tools found. Try different keywords.</p>
                <a href="./contact/" class="search-request-link">Request a Tool</a>
            </div>
        `;
        container.style.display = 'block';
        return;
    }

    const resultsHTML = results.map(tool => {
        let toolUrl = tool.url;
        // Fix relative links if in /tools/ directory
        if (window.location.pathname.includes('/tools/') && !toolUrl.startsWith('http') && !toolUrl.startsWith('../')) {
            toolUrl = '../' + toolUrl.replace(/^\.\//, '');
        }
        return `
        <a href="${toolUrl}" class="search-result-item">
            <div class="search-result-icon">${tool.icon}</div>
            <div class="search-result-content">
                <div class="search-result-title">${tool.title}</div>
                <div class="search-result-category">${tool.category}</div>
            </div>
        </a>
        `;
    }).join('');

    container.innerHTML = `
        <div class="search-results-header">
            <span class="search-results-count">${results.length} tool${results.length !== 1 ? 's' : ''} found</span>
        </div>
        <div class="search-results-list">
            ${resultsHTML}
        </div>
    `;
    
    container.style.display = 'block';
}
