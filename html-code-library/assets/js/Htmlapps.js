/*!
 * SmartGen HTML Code Library — shared utilities (SGT namespace)
 * One file, loaded on every page. Individual tool pages add a small
 * inline <script> at the bottom that calls into SGT.* helpers below.
 */
const SGT = (() => {
  "use strict";

  const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5L8 14.5L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const COPY_SVG = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="7" width="10" height="10" rx="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M13 7V4.6A1.6 1.6 0 0 0 11.4 3H4.6A1.6 1.6 0 0 0 3 4.6v6.8A1.6 1.6 0 0 0 4.6 13H7" stroke="currentColor" stroke-width="1.6"/></svg>';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* Small, dependency-free HTML/CSS token highlighter for the code panel.
     Not a full parser — good enough to make snippets scannable. */
  function highlight(code) {
    let s = escapeHtml(code);
    s = s.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="tok-string">$1</span>');
    s = s.replace(/(&lt;!--[\s\S]*?--&gt;|\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');
    s = s.replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)/g, '<span class="tok-tag">$1</span>');
    s = s.replace(/(&gt;)/g, '<span class="tok-tag">$1</span>');
    s = s.replace(/(\s|^)([a-zA-Z-]+)(=)(?=<span class="tok-string">|&quot;|&#39;)/gm, '$1<span class="tok-attr">$2</span>$3');
    return s;
  }

  function setCode(el, code) {
    if (!el) return;
    el.dataset.raw = code;
    el.innerHTML = highlight(code);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function initCopyButtons(root = document) {
    root.querySelectorAll("[data-copy-target]").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      const original = btn.innerHTML;
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.getAttribute("data-copy-target"));
        if (!target) return;
        const text = target.dataset.raw !== undefined ? target.dataset.raw
          : target.value !== undefined ? target.value
          : target.textContent;
        copyText(text).then(() => {
          btn.classList.add("is-copied");
          btn.innerHTML = CHECK_SVG + " Copied!";
          window.clearTimeout(btn._copyTimer);
          btn._copyTimer = window.setTimeout(() => {
            btn.classList.remove("is-copied");
            btn.innerHTML = original;
          }, 1700);
        });
      });
    });
  }

  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("is-open"))
    );
  }

  /* Wires a set of input selectors to a single update function, called
     immediately and on every input/change. Returns the matched elements. */
  function bindTool(selectors, updateFn) {
    const els = selectors.map((sel) => document.querySelector(sel)).filter(Boolean);
    els.forEach((el) => {
      el.addEventListener("input", updateFn);
      el.addEventListener("change", updateFn);
    });
    updateFn();
    return els;
  }

  function initIndexFilter() {
    const input = document.querySelector("[data-tool-search]");
    const chips = document.querySelectorAll("[data-cat-chip]");
    const blocks = document.querySelectorAll("[data-category-block]");
    if (!input && !chips.length) return;

    function applyFilter() {
      const q = (input && input.value ? input.value : "").trim().toLowerCase();
      const activeChip = document.querySelector("[data-cat-chip].active");
      const activeCat = activeChip ? activeChip.getAttribute("data-cat-chip") : "all";

      blocks.forEach((block) => {
        const blockCat = block.getAttribute("data-category-block");
        let visibleInBlock = 0;
        block.querySelectorAll(".tool-tile").forEach((tile) => {
          const text = tile.textContent.toLowerCase();
          const matchesQuery = !q || text.includes(q);
          const matchesCat = activeCat === "all" || activeCat === blockCat;
          const show = matchesQuery && matchesCat;
          tile.style.display = show ? "" : "none";
          if (show) visibleInBlock++;
        });
        block.style.display = visibleInBlock === 0 ? "none" : "";
      });
    }

    if (input) input.addEventListener("input", applyFilter);
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        applyFilter();
      });
    });
    applyFilter();
  }

  function initTableFilter() {
    document.querySelectorAll("[data-table-search]").forEach((input) => {
      const wrapSel = input.getAttribute("data-table-search");
      const wrap = document.querySelector(wrapSel);
      if (!wrap) return;
      const rows = wrap.querySelectorAll("tbody tr");
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        rows.forEach((row) => {
          row.style.display = !q || row.textContent.toLowerCase().includes(q) ? "" : "none";
        });
      });
    });
  }

  /* Small hero "typing" teaser used on index.html only. */
  function initHeroTyper() {
    const el = document.querySelector("[data-hero-typer]");
    if (!el) return;
    let samples;
    try {
      samples = JSON.parse(el.getAttribute("data-hero-typer"));
    } catch (e) {
      return;
    }
    if (!Array.isArray(samples) || !samples.length) return;
    let s = 0, i = 0, deleting = false;
    function tick() {
      const full = samples[s];
      el.textContent = deleting ? full.slice(0, i--) : full.slice(0, i++);
      let delay = deleting ? 26 : 46;
      if (!deleting && i > full.length) { delay = 1400; deleting = true; }
      else if (deleting && i < 0) { deleting = false; i = 0; s = (s + 1) % samples.length; delay = 260; }
      window.setTimeout(tick, delay);
    }
    tick();
  }

  function initRevealOnScroll() {
    const items = document.querySelectorAll(".tool-tile, .related-card, .tool-card");
    if (!("IntersectionObserver" in window) || !items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fade-slide-in .5s ease both";
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => io.observe(item));
  }

  return {
    escapeHtml, highlight, setCode, copyText,
    initCopyButtons, initMobileNav, bindTool,
    initIndexFilter, initTableFilter, initHeroTyper, initRevealOnScroll,
    icons: { check: CHECK_SVG, copy: COPY_SVG },
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  SGT.initCopyButtons();
  SGT.initMobileNav();
  SGT.initIndexFilter();
  SGT.initTableFilter();
  SGT.initHeroTyper();
  SGT.initRevealOnScroll();
});
