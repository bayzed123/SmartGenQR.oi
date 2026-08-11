/**
 * Auto-renders real user reviews on the homepage, right after the feed
 * section. Same backend as /review/ and /tools/'s review widgets — reviews
 * submitted on any of the three pages show up on all of them, since they
 * share one KV store. Read-only here (no submit form on the homepage); the
 * "Leave a Review" button sends people to the full /review/ page for that.
 */
(function () {
    const REVIEWS_API = 'https://young-grass-a480.sayadmdbayezidhosan.workers.dev';
    const SHOWN = 6;

    const listEl = document.getElementById('home-reviews-list');
    const numEl = document.getElementById('home-rating-num');
    const starsEl = document.getElementById('home-rating-stars');
    const totalEl = document.getElementById('home-rating-total');
    if (!listEl || !numEl || !starsEl || !totalEl) return;

    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function starSVG(filled) {
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8"><path d="M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7L12 3z" stroke-linejoin="round"/></svg>';
    }

    function starRow(rating) {
        let out = '';
        for (let i = 1; i <= 5; i++) out += starSVG(i <= rating);
        return out;
    }

    const AVATAR_COLORS = ['#2563eb', '#ff8800', '#16a34a', '#a855f7', '#0ea5e9', '#dc2626'];
    function avatarFor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return { color: AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length], initial: (name.trim()[0] || '?').toUpperCase() };
    }

    function renderSummary(reviews) {
        if (!reviews.length) {
            numEl.textContent = '–';
            starsEl.innerHTML = starRow(0);
            totalEl.textContent = 'No reviews yet — be the first!';
            return;
        }
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        numEl.textContent = avg.toFixed(1);
        starsEl.innerHTML = starRow(Math.round(avg));
        totalEl.textContent = 'based on ' + reviews.length + (reviews.length === 1 ? ' review' : ' reviews');
    }

    function renderList(reviews) {
        if (!reviews.length) {
            listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--slate-600); padding: 2rem;">No reviews yet — <a href="https://smartgentools.com/review/">share yours</a> and be the first.</div>';
            return;
        }
        listEl.innerHTML = reviews.slice(0, SHOWN).map((r) => {
            const av = avatarFor(r.name);
            const date = r.date ? new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
            return (
                '<div style="background:#fff; border:1px solid var(--slate-200); border-radius:12px; padding:18px;">' +
                '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">' +
                '<div style="width:36px; height:36px; border-radius:50%; background:' + av.color + '; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0;">' + av.initial + '</div>' +
                '<div style="min-width:0;">' +
                '<div style="font-weight:600; font-size:0.9rem; color:var(--navy);">' + escapeHTML(r.name) + '</div>' +
                '<div style="font-size:0.75rem; color:var(--slate-600);">' + date + '</div>' +
                '</div>' +
                '</div>' +
                '<div style="color:#f59e0b; display:flex; gap:2px; margin-bottom:8px;">' + starRow(r.rating) + '</div>' +
                '<p style="font-size:0.88rem; color:var(--slate-600); line-height:1.55; margin:0;">' + escapeHTML(r.comment) + '</p>' +
                '</div>'
            );
        }).join('');
    }

    fetch(REVIEWS_API + '?action=list')
        .then((r) => r.json())
        .then((data) => {
            const reviews = data.reviews || [];
            renderSummary(reviews);
            renderList(reviews);
        })
        .catch(() => {
            totalEl.textContent = 'Reviews are being set up — check back soon.';
            listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--slate-600); padding: 2rem;">Couldn\'t load reviews right now. <a href="https://smartgentools.com/review/">See them here</a> instead.</div>';
        });
})();
