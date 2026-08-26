document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('docs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('docs-theme', nextTheme);
        });
    }

    const mobileButton = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeSidebar = () => {
        if (!sidebar || !overlay) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    const toggleSidebar = () => {
        if (!sidebar || !overlay) return;
        const opening = !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', opening);
        overlay.classList.toggle('active', opening);
        document.body.style.overflow = opening ? 'hidden' : '';
    };

    if (mobileButton && sidebar && overlay) {
        mobileButton.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);
        document.querySelectorAll('[data-doc-nav-link]').forEach(link => link.addEventListener('click', closeSidebar));
    }

    const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '/') || '/';
    document.querySelectorAll('[data-doc-nav-link]').forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, '/') || '/';
        if (linkPath === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
});
