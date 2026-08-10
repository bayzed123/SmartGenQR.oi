/**
 * The SmartGen SEO Audit check registry — 72 checks across 9 categories.
 *
 * 27 checks are marked `free`; the remaining 45 are `premium`. Every check is
 * a pure function of the audit context built by lib/crawl.js — no check does
 * its own I/O, which keeps a full audit to a single predictable pass.
 *
 * Each `run(ctx)` returns:
 *   { status: 'pass' | 'fail' | 'warn' | 'skip', detail: string, evidence?: any }
 */

import { hasSchemaType, metaContent } from '../lib/parse.js';

export const CATEGORIES = [
  { id: 'authority', name: 'Authority & Technical', icon: '🔒', weight: 1.4 },
  { id: 'schema', name: 'Schema Markup', icon: '🏗️', weight: 1.2 },
  { id: 'eeat-pages', name: 'E-E-A-T Pages', icon: '📄', weight: 1.3 },
  { id: 'footer', name: 'Footer E-E-A-T', icon: '🦶', weight: 1.0 },
  { id: 'social', name: 'Social Presence', icon: '📱', weight: 0.8 },
  { id: 'ux', name: 'UX Elements', icon: '🎨', weight: 1.0 },
  { id: 'about', name: 'About Us Page', icon: '👥', weight: 1.1 },
  { id: 'homepage', name: 'Homepage Checks', icon: '🏠', weight: 1.3 },
  { id: 'onsite', name: 'E-E-A-T On-Site', icon: '✅', weight: 1.2 },
];

/* ----------------------------------------------------------- helpers */

const pass = (detail, evidence) => ({ status: 'pass', detail, evidence });
const fail = (detail, evidence) => ({ status: 'fail', detail, evidence });
const warn = (detail, evidence) => ({ status: 'warn', detail, evidence });
const skip = (detail) => ({ status: 'skip', detail });

const verdict = (ok, good, bad, evidence) => (ok ? pass(good, evidence) : fail(bad, evidence));

/** Does any internal link point at a path matching `re`, or say so in its text? */
function findPage(ctx, re, textRe) {
  const hit = ctx.doc.links.find((l) => {
    if (!l.href) return false;
    let path = '';
    try {
      path = new URL(l.href).pathname.toLowerCase();
    } catch {
      return false;
    }
    if (re.test(path)) return true;
    return Boolean(textRe && textRe.test(l.text.trim()));
  });
  return hit || null;
}

const SOCIAL_NETWORKS = {
  twitter: { label: 'Twitter/X', re: /(^|\.)(twitter\.com|x\.com)$/i },
  facebook: { label: 'Facebook', re: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i },
  linkedin: { label: 'LinkedIn', re: /(^|\.)linkedin\.com$/i },
  youtube: { label: 'YouTube', re: /(^|\.)(youtube\.com|youtu\.be)$/i },
  instagram: { label: 'Instagram', re: /(^|\.)instagram\.com$/i },
  pinterest: { label: 'Pinterest', re: /(^|\.)(pinterest\.[a-z.]+)$/i },
  tiktok: { label: 'TikTok', re: /(^|\.)tiktok\.com$/i },
};

/** Social profile links, ignoring share/intent widgets which prove nothing. */
function socialLinks(ctx, key) {
  const net = SOCIAL_NETWORKS[key];
  return ctx.doc.links.filter((l) => {
    if (!l.href || !net.re.test(l.host)) return false;
    return !/\/(share|sharer|intent|dialog)\b/i.test(l.href);
  });
}

function socialPlatformsPresent(ctx, footerOnly = false) {
  return Object.keys(SOCIAL_NETWORKS).filter((key) => {
    const links = socialLinks(ctx, key);
    return footerOnly ? links.some((l) => l.inFooter) : links.length > 0;
  });
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Deliberately conservative: 7+ digits with separators, so prices and years
// do not get mistaken for a phone number.
const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d{3,4}[\s.-]\d{3,4}(?:[\s.-]\d{2,4})?/;
const ADDRESS_RE =
  /\b(\d{1,6}\s+[A-Za-z0-9.'-]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|suite|ste|floor|court|ct|way|plaza|park)\b|p\.?o\.?\s*box\s*\d+|\b[A-Z]{2}\s+\d{5}(-\d{4})?\b|\b\d{4,6}\s*,?\s*(dhaka|london|new york|singapore|dubai|toronto|sydney)\b)/i;

/** Text that reads like a real street address, near an address-ish label. */
function looksLikeAddress(text) {
  if (!text) return false;
  if (ADDRESS_RE.test(text)) return true;
  return /\b(head\s?office|registered\s+office|our\s+address|mailing\s+address|address)\s*[:\-–]/i.test(
    text
  );
}

function jsonLdString(ctx) {
  return JSON.stringify(ctx.doc.jsonLd || []);
}

const currentYear = () => new Date().getUTCFullYear();

/* ============================================================ CHECKS */

export const CHECKS = [
  /* ---------------------------------------- 1. Authority & Technical (10) */
  {
    id: 'ssl-certificate',
    category: 'authority',
    tier: 'free',
    impact: 'critical',
    label: 'SSL Certificate (HTTPS)',
    description: 'Website uses a secure HTTPS connection',
    fix: 'Install an SSL certificate (free via Cloudflare or Let’s Encrypt) and 301-redirect all HTTP traffic to HTTPS.',
    run: (ctx) =>
      verdict(
        ctx.isHttps,
        `Served over HTTPS (${ctx.finalUrl})`,
        'The site resolves over plain HTTP — browsers will flag it as "Not secure".'
      ),
  },
  {
    id: 'has-favicon',
    category: 'authority',
    tier: 'free',
    impact: 'low',
    label: 'Has Favicon',
    description: 'Website has a favicon defined',
    fix: 'Add <link rel="icon" href="/favicon.ico"> plus a 180×180 apple-touch-icon to your <head>.',
    run: (ctx) => {
      const icons = ctx.doc.linkTags.filter((t) => /\b(icon|shortcut icon|apple-touch-icon)\b/.test(t.rel));
      return verdict(
        icons.length > 0,
        `${icons.length} icon declaration(s) found`,
        'No favicon <link> found in the document head.',
        icons.slice(0, 3).map((i) => i.href)
      );
    },
  },
  {
    id: 'has-logo',
    category: 'authority',
    tier: 'free',
    impact: 'medium',
    label: 'Has Logo Image',
    description: 'Logo detected in the header or navigation',
    fix: 'Place a real <img> logo inside your <header> with descriptive alt text such as "Brand Name logo".',
    run: (ctx) => {
      const region = `${ctx.doc.header}\n${ctx.doc.nav}`;
      const inRegion = /<img\b[^>]*(logo|brand)[^>]*>|<svg\b[^>]*(logo|brand)/i.test(region);
      const anyLogo = ctx.doc.images.some(
        (img) =>
          /logo|brand/i.test(img.className) ||
          /logo|brand/i.test(img.src) ||
          /logo/i.test(img.alt || '')
      );
      return verdict(
        inRegion || anyLogo,
        'Logo image detected in the header/navigation area',
        'No logo image found in the header — brand recognition and E-E-A-T both suffer.'
      );
    },
  },
  {
    id: 'sitemap-link-present',
    category: 'authority',
    tier: 'free',
    impact: 'high',
    label: 'Sitemap Link Present',
    description: 'XML sitemap linked or discoverable',
    fix: 'Publish /sitemap.xml and reference it from robots.txt so crawlers find every URL.',
    run: (ctx) => {
      const reachable = ctx.sitemaps.filter((s) => s.ok);
      return verdict(
        reachable.length > 0,
        `Sitemap reachable at ${reachable[0]?.url}`,
        'No XML sitemap was discoverable at the usual locations or via robots.txt.',
        ctx.sitemaps
      );
    },
  },
  {
    id: 'semantic-html-tags',
    category: 'authority',
    tier: 'premium',
    impact: 'medium',
    label: 'Semantic HTML Tags',
    description: 'Uses semantic elements (header, nav, main, article, section, footer)',
    fix: 'Replace generic <div> wrappers with <header>, <nav>, <main>, <article>, <section> and <footer>.',
    run: (ctx) => {
      const tags = ['header', 'nav', 'main', 'article', 'section', 'footer'];
      const found = tags.filter((t) => new RegExp(`<${t}[\\s>]`, 'i').test(ctx.doc.html));
      return verdict(
        found.length >= 4,
        `${found.length}/6 semantic landmarks present: ${found.join(', ')}`,
        `Only ${found.length}/6 semantic landmarks found (${found.join(', ') || 'none'}).`,
        found
      );
    },
  },
  {
    id: 'robots-has-sitemap',
    category: 'authority',
    tier: 'premium',
    impact: 'high',
    label: 'Robots.txt Has Sitemap',
    description: 'Robots.txt contains a Sitemap directive',
    fix: 'Add a line to robots.txt: Sitemap: https://yourdomain.com/sitemap.xml',
    run: (ctx) => {
      if (!ctx.robots.ok) return fail('robots.txt is missing or returned an error.');
      return verdict(
        ctx.robots.sitemaps.length > 0,
        `robots.txt declares ${ctx.robots.sitemaps.length} sitemap(s)`,
        'robots.txt exists but contains no Sitemap: directive.',
        ctx.robots.sitemaps
      );
    },
  },
  {
    id: 'open-graph-tags',
    category: 'authority',
    tier: 'premium',
    impact: 'medium',
    label: 'Open Graph Tags',
    description: 'OG meta tags for social sharing',
    fix: 'Add og:title, og:description, og:image (1200×630) and og:url to every page template.',
    run: (ctx) => {
      const required = ['og:title', 'og:description', 'og:image'];
      const found = required.filter((k) => metaContent(ctx.doc, k));
      return verdict(
        found.length === required.length,
        'og:title, og:description and og:image are all set',
        `Missing Open Graph tags: ${required.filter((k) => !found.includes(k)).join(', ')}`,
        found
      );
    },
  },
  {
    id: 'preferred-version',
    category: 'authority',
    tier: 'premium',
    impact: 'critical',
    label: 'Preferred Version Check',
    description: 'Only one URL variant returns 200 (www vs non-www, http vs https)',
    fix: 'Pick one canonical host and 301-redirect the other three variants to it.',
    run: (ctx) => {
      if (!ctx.variants) return skip('Requires a premium deep scan.');
      const { distinct200, probes } = ctx.variants;
      return verdict(
        distinct200 <= 1,
        'A single canonical URL variant serves 200 — no duplicate-host risk.',
        `${distinct200} URL variants each return 200 without redirecting. Google will see duplicate homepages.`,
        probes
      );
    },
  },
  {
    id: 'trailing-slash',
    category: 'authority',
    tier: 'premium',
    impact: 'medium',
    label: 'Trailing Slash Check',
    description: 'Pages redirect consistently with/without a trailing slash',
    fix: 'Choose one convention and 301-redirect the other form at the server or CDN level.',
    run: (ctx) => {
      if (!ctx.trailingSlash) return skip('Requires a premium deep scan.');
      if (!ctx.trailingSlash.tested) return warn(ctx.trailingSlash.reason);
      return verdict(
        ctx.trailingSlash.consistent,
        'Trailing-slash handling is consistent.',
        `Both ${ctx.trailingSlash.sample} and its slash variant return 200 — that is duplicate content.`,
        ctx.trailingSlash
      );
    },
  },
  {
    id: 'canonical-tag',
    category: 'authority',
    tier: 'premium',
    impact: 'high',
    label: 'Canonical Tag Set',
    description: 'Canonical URL defined for the page',
    fix: 'Output a self-referencing <link rel="canonical"> with the absolute URL on every page.',
    run: (ctx) => {
      const canonical = ctx.doc.linkTags.find((t) => t.rel.includes('canonical'));
      if (!canonical) return fail('No <link rel="canonical"> found on the homepage.');
      const isAbsolute = /^https?:\/\//i.test(canonical.href);
      return isAbsolute
        ? pass(`Canonical set to ${canonical.href}`, canonical.href)
        : warn(`Canonical is relative ("${canonical.href}") — use an absolute URL.`, canonical.href);
    },
  },

  /* ------------------------------------------------ 2. Schema Markup (4) */
  {
    id: 'schema-organization',
    category: 'schema',
    tier: 'free',
    impact: 'high',
    label: 'Organization Schema',
    description: 'Business/company structured data',
    fix: 'Add Organization JSON-LD with name, url, logo, sameAs and contactPoint to your homepage.',
    run: (ctx) => {
      const ok = ['Organization', 'LocalBusiness', 'Corporation', 'NewsMediaOrganization'].some((t) =>
        hasSchemaType(ctx.doc, t)
      );
      return verdict(
        ok,
        'Organization-level structured data is present.',
        'No Organization schema found — Google has no machine-readable record of who publishes this site.'
      );
    },
  },
  {
    id: 'schema-website',
    category: 'schema',
    tier: 'premium',
    impact: 'medium',
    label: 'WebSite Schema',
    description: 'Site-level schema with potential search action',
    fix: 'Add WebSite JSON-LD including potentialAction → SearchAction to enable the Sitelinks Searchbox.',
    run: (ctx) =>
      verdict(
        hasSchemaType(ctx.doc, 'WebSite'),
        'WebSite schema found.',
        'No WebSite schema — you forfeit the Sitelinks Searchbox rich result.'
      ),
  },
  {
    id: 'schema-faq',
    category: 'schema',
    tier: 'premium',
    impact: 'medium',
    label: 'FAQ Schema',
    description: 'FAQPage markup for rich snippets',
    fix: 'Wrap genuine on-page Q&A blocks in FAQPage JSON-LD (only mark up content the visitor can see).',
    run: (ctx) =>
      verdict(
        hasSchemaType(ctx.doc, 'FAQPage'),
        'FAQPage schema found.',
        'No FAQPage schema detected — a missed shot at extra SERP real estate.'
      ),
  },
  {
    id: 'schema-sitenavigation',
    category: 'schema',
    tier: 'premium',
    impact: 'low',
    label: 'SiteNavigation Schema',
    description: 'Navigation element markup',
    fix: 'Add SiteNavigationElement JSON-LD listing your primary menu items.',
    run: (ctx) =>
      verdict(
        hasSchemaType(ctx.doc, 'SiteNavigationElement'),
        'SiteNavigationElement schema found.',
        'No SiteNavigationElement schema — navigation structure is not machine-readable.'
      ),
  },

  /* ----------------------------------------------- 3. E-E-A-T Pages (7) */
  {
    id: 'page-privacy-policy',
    category: 'eeat-pages',
    tier: 'free',
    impact: 'critical',
    label: 'Privacy Policy Page',
    description: 'Link to a privacy policy found',
    fix: 'Publish a privacy policy and link it from the footer of every page.',
    run: (ctx) => {
      const hit = findPage(ctx, /privacy|gizlilik|datenschutz/i, /^privacy/i);
      return verdict(
        Boolean(hit),
        `Privacy policy linked at ${hit?.href}`,
        'No privacy policy link found. This blocks AdSense approval and damages trust signals.'
      );
    },
  },
  {
    id: 'page-terms',
    category: 'eeat-pages',
    tier: 'free',
    impact: 'high',
    label: 'Terms of Service Page',
    description: 'Link to terms of service found',
    fix: 'Publish Terms & Conditions and link it from the footer.',
    run: (ctx) => {
      const hit = findPage(ctx, /terms|tos|conditions|legal/i, /^terms|conditions/i);
      return verdict(
        Boolean(hit),
        `Terms page linked at ${hit?.href}`,
        'No terms of service / terms & conditions link found.'
      );
    },
  },
  {
    id: 'page-about',
    category: 'eeat-pages',
    tier: 'free',
    impact: 'critical',
    label: 'About Us Page',
    description: 'Link to an about page found',
    fix: 'Create a substantial About page covering who you are, your story and your credentials.',
    run: (ctx) => {
      const hit = findPage(ctx, /about|who-we-are|our-story|company/i, /^about|who we are|our story/i);
      return verdict(
        Boolean(hit),
        `About page linked at ${hit?.href}`,
        'No About page link found — the single strongest E-E-A-T signal is missing.'
      );
    },
  },
  {
    id: 'page-contact',
    category: 'eeat-pages',
    tier: 'free',
    impact: 'critical',
    label: 'Contact Us Page',
    description: 'Link to a contact page found',
    fix: 'Add a Contact page with a real email address, phone number and physical address.',
    run: (ctx) => {
      const hit = findPage(ctx, /contact|support|reach-us|get-in-touch/i, /^contact|get in touch/i);
      return verdict(
        Boolean(hit),
        `Contact page linked at ${hit?.href}`,
        'No Contact page link found.'
      );
    },
  },
  {
    id: 'page-authors',
    category: 'eeat-pages',
    tier: 'premium',
    impact: 'high',
    label: 'Authors/Team Page',
    description: 'Link to an authors or team page found',
    fix: 'Publish author/team bios with photos, credentials and links to their professional profiles.',
    run: (ctx) => {
      const hit = findPage(ctx, /author|team|our-people|staff|contributors/i, /^(our )?team|authors/i);
      return verdict(
        Boolean(hit),
        `Team/authors page linked at ${hit?.href}`,
        'No authors or team page found — Google cannot verify who creates your content.'
      );
    },
  },
  {
    id: 'page-editorial-guidelines',
    category: 'eeat-pages',
    tier: 'premium',
    impact: 'medium',
    label: 'Editorial Guidelines',
    description: 'Link to editorial guidelines found',
    fix: 'Publish an editorial policy describing sourcing, fact-checking and correction procedures.',
    run: (ctx) => {
      const hit = findPage(
        ctx,
        /editorial|review-process|fact-check|content-policy|standards/i,
        /editorial|fact.?check|review process/i
      );
      return verdict(
        Boolean(hit),
        `Editorial guidelines linked at ${hit?.href}`,
        'No editorial guidelines page — a documented standard is a strong trust signal for YMYL topics.'
      );
    },
  },
  {
    id: 'page-html-sitemap',
    category: 'eeat-pages',
    tier: 'premium',
    impact: 'low',
    label: 'HTML Sitemap',
    description: 'Link to an HTML sitemap found',
    fix: 'Publish a human-readable /sitemap/ page listing your main sections and link it in the footer.',
    run: (ctx) => {
      const hit = ctx.doc.links.find((l) => {
        if (!l.href || l.external) return false;
        let path = '';
        try {
          path = new URL(l.href).pathname.toLowerCase();
        } catch {
          return false;
        }
        return /sitemap/.test(path) && !path.endsWith('.xml');
      });
      return verdict(
        Boolean(hit),
        `HTML sitemap linked at ${hit?.href}`,
        'No HTML sitemap page found.'
      );
    },
  },

  /* ---------------------------------------------- 4. Footer E-E-A-T (10) */
  {
    id: 'footer-copyright',
    category: 'footer',
    tier: 'free',
    impact: 'medium',
    label: 'Copyright Notice',
    description: 'Copyright text found in the footer',
    fix: 'Add "© {year} Your Company Name. All rights reserved." to the footer.',
    run: (ctx) =>
      verdict(
        /(©|&copy;|\(c\)|copyright)/i.test(ctx.doc.footer) || /(©|copyright)/i.test(ctx.doc.footerText),
        'Copyright notice present in the footer.',
        'No copyright notice in the footer.'
      ),
  },
  {
    id: 'footer-copyright-year',
    category: 'footer',
    tier: 'free',
    impact: 'low',
    label: 'Copyright Current Year',
    description: 'Copyright shows the current or a recent year',
    fix: 'Render the copyright year dynamically so it never goes stale.',
    run: (ctx) => {
      const years = [...ctx.doc.footerText.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
      if (!years.length) return fail('No year found next to the copyright notice.');
      const newest = Math.max(...years);
      const year = currentYear();
      return verdict(
        newest >= year - 1,
        `Copyright year is ${newest}.`,
        `Copyright shows ${newest} — an outdated year signals an abandoned site.`,
        newest
      );
    },
  },
  {
    id: 'footer-physical-address',
    category: 'footer',
    tier: 'premium',
    impact: 'high',
    label: 'Physical Address',
    description: 'Address information in the footer',
    fix: 'Publish your registered business address in the footer and keep it identical to your Google Business Profile.',
    run: (ctx) =>
      verdict(
        looksLikeAddress(ctx.doc.footerText),
        'A physical address appears in the footer.',
        'No physical address in the footer — a top-3 E-E-A-T gap for commercial sites.'
      ),
  },
  {
    id: 'footer-contact-email',
    category: 'footer',
    tier: 'free',
    impact: 'high',
    label: 'Contact Email',
    description: 'Email address visible',
    fix: 'Show a branded email (you@yourdomain.com) in the footer — free Gmail addresses weaken trust.',
    run: (ctx) => {
      const mailto = ctx.doc.links.find((l) => /^mailto:/i.test(l.raw));
      const inline = ctx.doc.footerText.match(EMAIL_RE);
      const found = mailto || inline;
      return verdict(
        Boolean(found),
        `Contact email found (${mailto ? mailto.raw.replace(/^mailto:/i, '') : inline[0]}).`,
        'No contact email address is visible on the page.'
      );
    },
  },
  {
    id: 'footer-phone',
    category: 'footer',
    tier: 'premium',
    impact: 'medium',
    label: 'Phone Number',
    description: 'Phone number visible',
    fix: 'Add a clickable tel: link in the footer and in your Contact page.',
    run: (ctx) => {
      const telLink = ctx.doc.links.some((l) => /^tel:/i.test(l.raw));
      const inline = PHONE_RE.test(ctx.doc.footerText);
      return verdict(
        telLink || inline,
        'A phone number is visible on the page.',
        'No phone number found — visitors and Google both read this as a lower-trust business.'
      );
    },
  },
  {
    id: 'footer-social-links',
    category: 'footer',
    tier: 'free',
    impact: 'medium',
    label: 'Social Links in Footer',
    description: 'Social media links present (2+ platforms)',
    fix: 'Link at least 2–3 active social profiles from the footer and mirror them in Organization.sameAs.',
    run: (ctx) => {
      const inFooter = socialPlatformsPresent(ctx, true);
      const anywhere = socialPlatformsPresent(ctx, false);
      const list = inFooter.length >= 2 ? inFooter : anywhere;
      return verdict(
        list.length >= 2,
        `${list.length} social platforms linked: ${list.join(', ')}`,
        `Only ${list.length} social platform(s) linked — aim for at least 2.`,
        list
      );
    },
  },
  {
    id: 'footer-dmca-badge',
    category: 'footer',
    tier: 'premium',
    impact: 'low',
    label: 'DMCA Badge',
    description: 'DMCA protection badge/link',
    fix: 'Register a free DMCA badge and place it in the footer as a visible content-protection signal.',
    run: (ctx) =>
      verdict(
        /dmca/i.test(ctx.doc.footer) || ctx.doc.links.some((l) => /dmca\.com/i.test(l.host)),
        'DMCA protection badge/link found.',
        'No DMCA badge in the footer.'
      ),
  },
  {
    id: 'footer-menu-links',
    category: 'footer',
    tier: 'premium',
    impact: 'medium',
    label: 'Footer Menu Links',
    description: 'Footer links to About, Contact, Terms, etc (3+ essential links)',
    fix: 'Build a footer menu containing About, Contact, Privacy, Terms and Sitemap.',
    run: (ctx) => {
      const essentials = [
        { name: 'About', re: /about|who-we-are|company/i },
        { name: 'Contact', re: /contact|support/i },
        { name: 'Privacy', re: /privacy/i },
        { name: 'Terms', re: /terms|conditions/i },
        { name: 'Disclaimer', re: /disclaimer/i },
        { name: 'Sitemap', re: /sitemap/i },
      ];
      const footerHtml = ctx.doc.footer;
      const found = essentials.filter((e) => e.re.test(footerHtml)).map((e) => e.name);
      return verdict(
        found.length >= 3,
        `Footer menu covers ${found.length} essential pages: ${found.join(', ')}`,
        `Footer only links ${found.length} essential page(s) (${found.join(', ') || 'none'}). Aim for 3+.`,
        found
      );
    },
  },
  {
    id: 'footer-site-description',
    category: 'footer',
    tier: 'premium',
    impact: 'low',
    label: 'Short Website Description',
    description: 'Footer contains a brief site description',
    fix: 'Add a 1–2 sentence "what this site is" blurb beside your footer logo.',
    run: (ctx) => {
      const sentences = ctx.doc.footerText
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.split(/\s+/).length >= 8 && !/^(©|copyright)/i.test(s));
      return verdict(
        sentences.length > 0,
        'The footer contains a short descriptive blurb.',
        'No descriptive sentence in the footer — just links and a copyright line.',
        sentences[0]?.slice(0, 160)
      );
    },
  },
  {
    id: 'footer-parent-company',
    category: 'footer',
    tier: 'premium',
    impact: 'medium',
    label: 'Parent Company Listed',
    description: 'Parent company or business entity mentioned',
    fix: 'Name the legal entity that owns the site, e.g. "A product of Example Holdings Ltd.".',
    run: (ctx) => {
      const re =
        /\b(a (product|brand|division|company|service) of|owned (and operated )?by|part of|subsidiary of|parent company|operated by)\b|\b(LLC|Ltd\.?|Limited|Inc\.?|GmbH|Pvt\.?|Pty|S\.?A\.?|B\.?V\.?)\b/i;
      return verdict(
        re.test(ctx.doc.footerText),
        'A legal entity / parent company is named in the footer.',
        'No parent company or registered legal entity is named anywhere in the footer.'
      );
    },
  },

  /* --------------------------------------------- 5. Social Presence (8) */
  ...['twitter', 'facebook', 'linkedin', 'youtube', 'instagram', 'pinterest', 'tiktok'].map(
    (key, i) => ({
      id: `social-${key}`,
      category: 'social',
      tier: i < 2 ? 'free' : 'premium',
      impact: i < 2 ? 'medium' : 'low',
      label: `${SOCIAL_NETWORKS[key].label} Link`,
      description: `${SOCIAL_NETWORKS[key].label} profile linked`,
      fix: `Link your ${SOCIAL_NETWORKS[key].label} profile from the site and list it in Organization.sameAs.`,
      run: (ctx) => {
        const links = socialLinks(ctx, key);
        return verdict(
          links.length > 0,
          `${SOCIAL_NETWORKS[key].label} profile linked.`,
          `No ${SOCIAL_NETWORKS[key].label} profile link found.`,
          links[0]?.href
        );
      },
    })
  ),
  {
    id: 'social-rss',
    category: 'social',
    tier: 'premium',
    impact: 'low',
    label: 'RSS Feed',
    description: 'RSS feed available',
    fix: 'Expose an RSS/Atom feed and declare it with <link rel="alternate" type="application/rss+xml">.',
    run: (ctx) => {
      const declared = ctx.doc.linkTags.some(
        (t) => t.rel.includes('alternate') && /rss|atom/i.test(t.type)
      );
      const linked = ctx.doc.links.some((l) => /\/(feed|rss)\/?$|\.(rss|atom)$/i.test(l.href || ''));
      return verdict(declared || linked, 'RSS/Atom feed detected.', 'No RSS feed found.');
    },
  },

  /* -------------------------------------------------- 6. UX Elements (5) */
  {
    id: 'ux-search',
    category: 'ux',
    tier: 'free',
    impact: 'medium',
    label: 'Search Functionality',
    description: 'Search bar/form present',
    fix: 'Add a site search box — it also unlocks the Sitelinks Searchbox rich result.',
    run: (ctx) => {
      const searchInput = ctx.doc.inputs.some((i) =>
        /type\s*=\s*["']search["']|name\s*=\s*["'](s|q|query|search)["']|(id|class|placeholder)\s*=\s*["'][^"']*search/i.test(
          i
        )
      );
      const searchForm = /role\s*=\s*["']search["']|<form\b[^>]*(id|class|action)\s*=\s*["'][^"']*search/i.test(
        ctx.doc.html
      );
      return verdict(
        searchInput || searchForm,
        'A search input is present on the page.',
        'No site search found.'
      );
    },
  },
  {
    id: 'ux-back-to-top',
    category: 'ux',
    tier: 'premium',
    impact: 'low',
    label: 'Back to Top Button',
    description: 'Scroll to top button',
    fix: 'Add a floating "back to top" control that appears after ~600px of scroll.',
    run: (ctx) => {
      const re =
        /(back[-_\s]?to[-_\s]?top|scroll[-_\s]?(to[-_\s]?)?top|go[-_\s]?to[-_\s]?top|#top["'])/i;
      return verdict(
        re.test(ctx.doc.html),
        'A back-to-top control was detected.',
        'No back-to-top button found — long pages become tiring on mobile.'
      );
    },
  },
  {
    id: 'ux-external-new-tab',
    category: 'ux',
    tier: 'premium',
    impact: 'low',
    label: 'External Links New Tab',
    description: 'External links open in a new tab (>50% threshold)',
    fix: 'Add target="_blank" rel="noopener" to outbound links so visitors keep your tab open.',
    run: (ctx) => {
      const external = ctx.doc.links.filter((l) => l.external && l.href);
      if (external.length < 3) return skip('Too few external links to judge (needs 3+).');
      const newTab = external.filter((l) => l.target === '_blank').length;
      const ratio = newTab / external.length;
      return verdict(
        ratio > 0.5,
        `${newTab}/${external.length} external links open in a new tab.`,
        `Only ${newTab}/${external.length} external links open in a new tab.`,
        Math.round(ratio * 100)
      );
    },
  },
  {
    id: 'ux-image-alt',
    category: 'ux',
    tier: 'free',
    impact: 'high',
    label: 'Images Have Alt Text',
    description: 'All images have alt attributes',
    fix: 'Give every content image descriptive alt text; decorative images get alt="".',
    run: (ctx) => {
      if (!ctx.doc.images.length) return skip('No <img> elements found on the page.');
      const missing = ctx.doc.images.filter((img) => !img.hasAltAttr);
      return verdict(
        missing.length === 0,
        `All ${ctx.doc.images.length} images have an alt attribute.`,
        `${missing.length} of ${ctx.doc.images.length} images are missing an alt attribute.`,
        missing.slice(0, 5).map((i) => i.src)
      );
    },
  },
  {
    id: 'ux-no-missing-images',
    category: 'ux',
    tier: 'free',
    impact: 'medium',
    label: 'No Missing Images',
    description: 'No broken image references detected',
    fix: 'Remove or repair <img> tags with empty, placeholder or malformed src values.',
    run: (ctx) => {
      if (!ctx.doc.images.length) return skip('No <img> elements found on the page.');
      const broken = ctx.doc.images.filter((img) => {
        const src = (img.src || '').trim();
        if (!src) return true;
        if (/^(#|javascript:)/i.test(src)) return true;
        if (/(placeholder|undefined|null|\{\{|%7B%7B)/i.test(src)) return true;
        return img.abs === null;
      });
      return verdict(
        broken.length === 0,
        `All ${ctx.doc.images.length} image references resolve.`,
        `${broken.length} image(s) have an empty, placeholder or unresolvable src.`,
        broken.slice(0, 5).map((i) => i.src)
      );
    },
  },

  /* -------------------------------------------------- 7. About Us Page (9) */
  {
    id: 'about-parent-company',
    category: 'about',
    tier: 'premium',
    impact: 'medium',
    label: 'Parent Company Described',
    description: 'Parent company or business entity is described',
    fix: 'State the legal entity behind the brand, with registration details where possible.',
    run: aboutTextCheck(
      /\b(a (product|brand|division|company|service) of|owned (and operated )?by|part of|subsidiary|parent company|registered (in|as)|our (parent )?company)\b|\b(LLC|Ltd\.?|Limited|Inc\.?|GmbH|Pvt\.?|Pty)\b/i,
      'The About page names the owning business entity.',
      'The About page never names a legal entity or parent company.'
    ),
  },
  {
    id: 'about-our-story',
    category: 'about',
    tier: 'premium',
    impact: 'high',
    label: 'Our Story Section',
    description: 'Contains an "Our Story" or history section',
    fix: 'Add a founding story with dates and milestones — first-hand experience is the "E" in E-E-A-T.',
    run: aboutHeadingCheck(
      /our story|our journey|history|how (it|we) (all )?(started|began)|founded in|since \d{4}|our mission/i,
      'The About page tells the company story.',
      'No "Our Story" / history section on the About page.'
    ),
  },
  {
    id: 'about-who-we-are',
    category: 'about',
    tier: 'premium',
    impact: 'high',
    label: 'Who We Are Section',
    description: 'Contains a "Who We Are" section',
    fix: 'Add a "Who We Are" block introducing the people and expertise behind the site.',
    run: aboutHeadingCheck(
      /who we are|about (us|our team|the team)|meet the team|our team|our people/i,
      'A "Who We Are" section is present.',
      'No "Who We Are" section on the About page.'
    ),
  },
  {
    id: 'about-what-we-do',
    category: 'about',
    tier: 'premium',
    impact: 'high',
    label: 'What We Do Section',
    description: 'Contains a "What We Do" section',
    fix: 'Explain your services/products explicitly in a "What We Do" section.',
    run: aboutHeadingCheck(
      /what we do|our (services|work|products|expertise|offerings)|how we help|we specialis|we specializ/i,
      'A "What We Do" section is present.',
      'No "What We Do" section on the About page.'
    ),
  },
  {
    id: 'about-trusted-source',
    category: 'about',
    tier: 'premium',
    impact: 'medium',
    label: 'Trusted Source Statement',
    description: 'Contains a trust or credibility statement',
    fix: 'Add a credibility statement backed by numbers: years in business, clients served, certifications.',
    run: aboutTextCheck(
      /\b(trusted (by|source)|years of experience|certified|accredited|award[- ]winning|industry[- ]leading|\d[\d,]*\+? (customers|clients|users|businesses|readers)|since \d{4})\b/i,
      'The About page makes a concrete credibility claim.',
      'No trust or credibility statement on the About page.'
    ),
  },
  {
    id: 'about-team-photos',
    category: 'about',
    tier: 'premium',
    impact: 'medium',
    label: 'Team Photos in Workspace',
    description: 'Team or office photos present on the page (3+ images)',
    fix: 'Publish real photos of your team and workspace — stock imagery does not build trust.',
    run: (ctx) => {
      if (!ctx.about) return skip('Requires a premium deep scan.');
      if (!ctx.about.found) return fail('No About page could be fetched.');
      const imgs = ctx.about.doc.images.filter((img) => {
        const hay = `${img.src} ${img.alt || ''} ${img.className}`.toLowerCase();
        return !/(logo|icon|sprite|badge|favicon|placeholder)/.test(hay);
      });
      return verdict(
        imgs.length >= 3,
        `${imgs.length} content images on the About page.`,
        `Only ${imgs.length} content image(s) on the About page — aim for 3+ real team/office photos.`,
        imgs.length
      );
    },
  },
  {
    id: 'about-mailing-address',
    category: 'about',
    tier: 'premium',
    impact: 'high',
    label: 'Mailing Address Listed',
    description: 'Physical mailing address on the About page',
    fix: 'Publish the full postal address on the About page and keep it consistent everywhere else.',
    run: (ctx) => {
      if (!ctx.about) return skip('Requires a premium deep scan.');
      if (!ctx.about.found) return fail('No About page could be fetched.');
      return verdict(
        looksLikeAddress(ctx.about.text),
        'A mailing address appears on the About page.',
        'No physical mailing address on the About page.'
      );
    },
  },
  {
    id: 'about-social-proof',
    category: 'about',
    tier: 'premium',
    impact: 'high',
    label: 'Social Proof Displayed',
    description: 'Testimonials, reviews, or awards displayed',
    fix: 'Add named testimonials with photos, review scores, or award badges to the About page.',
    run: aboutTextCheck(
      /\b(testimonial|what our (clients|customers) say|review[s]?\b|rated \d|\d(\.\d)? out of 5|★|award|featured in|as seen (in|on)|case stud)/i,
      'Social proof (testimonials, reviews or awards) is displayed.',
      'No testimonials, reviews or awards on the About page.'
    ),
  },
  {
    id: 'about-featured-websites',
    category: 'about',
    tier: 'premium',
    impact: 'medium',
    label: 'Featured Websites Linked',
    description: 'Links to featured or partner websites',
    fix: 'Link out to press mentions, partners or publications that have featured you.',
    run: (ctx) => {
      if (!ctx.about) return skip('Requires a premium deep scan.');
      if (!ctx.about.found) return fail('No About page could be fetched.');
      const outbound = ctx.about.doc.links.filter((l) => {
        if (!l.external || !l.host) return false;
        return !Object.values(SOCIAL_NETWORKS).some((n) => n.re.test(l.host));
      });
      return verdict(
        outbound.length >= 1,
        `${outbound.length} outbound link(s) to featured/partner sites.`,
        'No links to featured publications or partner websites.',
        outbound.slice(0, 5).map((l) => l.host)
      );
    },
  },

  /* ---------------------------------------------- 8. Homepage Checks (5) */
  {
    id: 'home-indexphp-redirect',
    category: 'homepage',
    tier: 'free',
    impact: 'medium',
    label: 'index.php Redirects to Home',
    description: 'index.php properly 301 redirects to the homepage',
    fix: 'Redirect /index.php (and /index.html) to / with a 301 so only one homepage URL exists.',
    run: (ctx) => {
      const { status, redirects } = ctx.indexPhp;
      if (status === 404 || status === 410) return pass('No /index.php exists — nothing to duplicate.');
      if (status === 0) return skip('Could not probe /index.php.');
      const redirectsHome = redirects.length > 0 && redirects[0].status === 301;
      if (redirectsHome) return pass('/index.php issues a 301 to the homepage.');
      if (redirects.length > 0)
        return warn(`/index.php redirects with a ${redirects[0].status}, not a 301.`);
      return fail('/index.php returns 200 directly — a duplicate of your homepage.');
    },
  },
  {
    id: 'home-not-noindexed',
    category: 'homepage',
    tier: 'free',
    impact: 'critical',
    label: 'Homepage Not Noindexed',
    description: 'Homepage is indexable by search engines',
    fix: 'Remove noindex from the robots meta tag and the X-Robots-Tag response header.',
    run: (ctx) => {
      const metaRobots = metaContent(ctx.doc, 'robots').toLowerCase();
      const header = (ctx.headers['x-robots-tag'] || '').toLowerCase();
      const blocked = /noindex/.test(metaRobots) || /noindex/.test(header);
      return verdict(
        !blocked,
        'The homepage is indexable.',
        'The homepage carries a noindex directive — it cannot rank at all.',
        { metaRobots, header }
      );
    },
  },
  {
    id: 'home-title-not-generic',
    category: 'homepage',
    tier: 'free',
    impact: 'high',
    label: 'Homepage Title Not "Home"',
    description: 'Title tag is descriptive, not just "Home"',
    fix: 'Write a 50–60 character title: Primary Keyword | Brand Name.',
    run: (ctx) => {
      const title = (ctx.doc.title || '').trim();
      if (!title) return fail('The homepage has no <title> tag at all.');
      if (/^(home|homepage|home page|index|untitled|welcome)$/i.test(title))
        return fail(`Title is just "${title}" — it wastes your strongest ranking signal.`);
      if (title.length < 15)
        return warn(`Title is only ${title.length} characters ("${title}"). Aim for 50–60.`);
      if (title.length > 65)
        return warn(`Title is ${title.length} characters — Google will truncate it.`);
      return pass(`Title is descriptive (${title.length} chars): "${title}"`, title);
    },
  },
  {
    id: 'home-content-visible',
    category: 'homepage',
    tier: 'free',
    impact: 'high',
    label: 'Homepage Content Visible',
    description: 'Homepage has substantial visible content (100+ words)',
    fix: 'Add at least 300 words of genuine, server-rendered copy to the homepage.',
    run: (ctx) => {
      const words = ctx.doc.wordCount;
      if (words >= 300) return pass(`${words} words of visible content.`, words);
      if (words >= 100) return warn(`Only ${words} words of visible content. 300+ ranks better.`, words);
      return fail(
        `Only ${words} words of visible content — likely a JavaScript-rendered page Google may not read.`,
        words
      );
    },
  },
  {
    id: 'home-no-redirect-chains',
    category: 'homepage',
    tier: 'premium',
    impact: 'high',
    label: 'No Homepage Redirect Chains',
    description: 'Homepage loads without multiple redirects',
    fix: 'Collapse redirect chains so http://domain → https://www.domain happens in a single hop.',
    run: (ctx) => {
      const hops = ctx.redirects.length;
      if (hops === 0) return pass('The homepage responds directly with no redirect.');
      if (hops === 1) return pass('A single clean redirect hop.', ctx.redirects);
      return fail(
        `${hops} redirect hops before the homepage loads — each one leaks crawl budget and speed.`,
        ctx.redirects
      );
    },
  },

  /* ------------------------------------------- 9. E-E-A-T On-Site (14) */
  {
    id: 'onsite-default-content',
    category: 'onsite',
    tier: 'free',
    impact: 'high',
    label: 'Remove Default Content',
    description: 'Default /hello-world/ post and /sample-page/ are removed',
    fix: 'Delete the WordPress sample post and sample page, then 410 or redirect their URLs.',
    run: (ctx) => {
      const live = [];
      if (ctx.defaultContent.helloWorld === 200) live.push('/hello-world/');
      if (ctx.defaultContent.samplePage === 200) live.push('/sample-page/');
      return verdict(
        live.length === 0,
        'No default WordPress demo content is live.',
        `Default demo content is still published: ${live.join(', ')}`,
        live
      );
    },
  },
  {
    id: 'onsite-uncategorized',
    category: 'onsite',
    tier: 'free',
    impact: 'medium',
    label: 'Configure Uncategorized Category',
    description: 'Default /uncategorized/ category is removed or renamed',
    fix: 'Rename the default category to a real topic and reassign every post away from "Uncategorized".',
    run: (ctx) =>
      verdict(
        ctx.defaultContent.uncategorized !== 200,
        'No live /category/uncategorized/ archive.',
        'The default "Uncategorized" category archive is live and indexable.'
      ),
  },
  {
    id: 'onsite-no-read-more',
    category: 'onsite',
    tier: 'premium',
    impact: 'medium',
    label: 'No Read More Buttons',
    description: 'Use title links instead of "Read More" buttons',
    fix: 'Link post titles instead of generic "Read More" buttons so anchor text carries keywords.',
    run: (ctx) => {
      const generic = ctx.doc.links.filter((l) =>
        /^(read more|readmore|continue reading|learn more|click here|more|see more)\.{0,3}$/i.test(
          l.text.trim()
        )
      );
      if (generic.length === 0) return pass('No generic "Read More" anchor text found.');
      if (generic.length <= 2)
        return warn(`${generic.length} generic anchor(s) found — minor, but worth replacing.`, generic.length);
      return fail(
        `${generic.length} links use generic anchor text like "Read More" — that anchor equity is wasted.`,
        generic.length
      );
    },
  },
  {
    id: 'onsite-no-heading-before-h1',
    category: 'onsite',
    tier: 'free',
    impact: 'medium',
    label: 'No Headings Before H1',
    description: 'H2–H6 should not appear before the first H1 tag',
    fix: 'Make the first heading in the DOM your single H1, then nest H2s beneath it.',
    run: (ctx) => {
      const headings = ctx.doc.headings;
      if (!headings.length) return fail('The page has no headings at all.');
      const firstH1 = headings.findIndex((h) => h.level === 1);
      if (firstH1 === -1) return fail('The page has no H1 tag.');
      const before = headings.slice(0, firstH1);
      return verdict(
        before.length === 0,
        'The H1 is the first heading on the page.',
        `${before.length} heading(s) (${before.map((h) => `H${h.level}`).join(', ')}) appear before the H1.`,
        before.map((h) => `H${h.level}: ${h.text.slice(0, 50)}`)
      );
    },
  },
  {
    id: 'onsite-no-empty-hash-links',
    category: 'onsite',
    tier: 'free',
    impact: 'medium',
    label: 'No Empty # Links',
    description: 'No placeholder href="#" links on the page',
    fix: 'Replace href="#" placeholders with real URLs, or use <button> for JavaScript actions.',
    run: (ctx) => {
      const empty = ctx.doc.links.filter((l) => l.raw === '#' || l.raw === '' || l.raw === 'javascript:void(0)');
      if (empty.length === 0) return pass('No placeholder "#" links found.');
      if (empty.length <= 3)
        return warn(`${empty.length} placeholder link(s) found — usually dropdown toggles.`, empty.length);
      return fail(`${empty.length} placeholder href="#" links found.`, empty.length);
    },
  },
  {
    id: 'onsite-links-look-like-links',
    category: 'onsite',
    tier: 'premium',
    impact: 'low',
    label: 'Links Look Like Links',
    description: 'Links should have an underline or distinct colour styling',
    fix: 'Give in-content links an underline or a clearly distinct colour so they are recognisable.',
    run: (ctx) => {
      const css = ctx.doc.styleBlocks;
      const removesUnderline = /a[^{}]*\{[^}]*text-decoration\s*:\s*none/i.test(css);
      const restoresStyle =
        /a[^{}]*\{[^}]*(color\s*:|border-bottom\s*:)/i.test(css) ||
        /a[^{}]*:hover[^{}]*\{[^}]*text-decoration\s*:\s*underline/i.test(css);
      const inlineNone = (ctx.doc.html.match(/style\s*=\s*["'][^"']*text-decoration\s*:\s*none/gi) || [])
        .length;

      if (!css && !inlineNone) return skip('No inline CSS available to evaluate (styles are external).');
      if (removesUnderline && !restoresStyle)
        return fail('Links have text-decoration:none with no compensating colour or border style.');
      if (inlineNone > 10)
        return warn(`${inlineNone} elements strip link underlining inline.`, inlineNone);
      return pass('Links keep a visible underline or distinct styling.');
    },
  },
  {
    id: 'onsite-no-background-content-images',
    category: 'onsite',
    tier: 'premium',
    impact: 'medium',
    label: 'No Content as Background Images',
    description: 'Important images should use img tags, not CSS backgrounds',
    fix: 'Move meaningful imagery out of CSS background-image and into <img> with alt text so it can rank.',
    run: (ctx) => {
      const inline = (ctx.doc.body.match(/background-image\s*:\s*url\(/gi) || []).length;
      const imgCount = ctx.doc.images.length;
      if (inline === 0) return pass('No inline CSS background images carrying content.');
      if (imgCount === 0 && inline > 0)
        return fail(`${inline} background images and zero <img> tags — none of that imagery can rank.`, inline);
      if (inline > imgCount)
        return fail(
          `${inline} CSS background images vs ${imgCount} <img> tags — content imagery is invisible to Google Images.`,
          inline
        );
      return pass(`${inline} background image(s), balanced against ${imgCount} real <img> tags.`);
    },
  },
  {
    id: 'onsite-no-sentence-headings',
    category: 'onsite',
    tier: 'premium',
    impact: 'medium',
    label: 'No Sentence Headings',
    description: 'Headings should be concise, not entire paragraphs (max 100 chars)',
    fix: 'Keep headings under ~70 characters and move the explanation into the paragraph below.',
    run: (ctx) => {
      if (!ctx.doc.headings.length) return skip('No headings found.');
      const long = ctx.doc.headings.filter((h) => h.text.length > 100);
      return verdict(
        long.length === 0,
        `All ${ctx.doc.headings.length} headings are concise.`,
        `${long.length} heading(s) exceed 100 characters and read like paragraphs.`,
        long.slice(0, 3).map((h) => `H${h.level}: ${h.text.slice(0, 80)}…`)
      );
    },
  },
  {
    id: 'onsite-no-duplicate-plugins',
    category: 'onsite',
    tier: 'premium',
    impact: 'high',
    label: 'No Duplicate Functionality Plugins',
    description: 'No multiple cache or SEO plugins detected',
    fix: 'Run exactly one SEO plugin and one caching plugin — overlapping plugins emit conflicting tags.',
    run: (ctx) => {
      const html = ctx.doc.html;
      const seoPlugins = [
        { name: 'Yoast SEO', re: /yoast|wpseo/i },
        { name: 'Rank Math', re: /rank[-_ ]?math/i },
        { name: 'All in One SEO', re: /aioseo|all[-_ ]in[-_ ]one[-_ ]seo/i },
        { name: 'SEOPress', re: /seopress/i },
        { name: 'The SEO Framework', re: /the[-_ ]seo[-_ ]framework|autodescription/i },
      ].filter((p) => p.re.test(html));
      const cachePlugins = [
        { name: 'WP Rocket', re: /wp-rocket|rocket-loader-wp/i },
        { name: 'W3 Total Cache', re: /w3tc|w3-total-cache/i },
        { name: 'WP Super Cache', re: /wp-super-cache|supercache/i },
        { name: 'LiteSpeed Cache', re: /litespeed[-_ ]cache/i },
        { name: 'WP Fastest Cache', re: /wp-fastest-cache/i },
        { name: 'Autoptimize', re: /autoptimize/i },
      ].filter((p) => p.re.test(html));

      const conflicts = [];
      if (seoPlugins.length > 1) conflicts.push(`SEO: ${seoPlugins.map((p) => p.name).join(' + ')}`);
      if (cachePlugins.length > 1) conflicts.push(`Cache: ${cachePlugins.map((p) => p.name).join(' + ')}`);

      return verdict(
        conflicts.length === 0,
        'No overlapping SEO or caching plugins detected.',
        `Conflicting plugins detected — ${conflicts.join('; ')}`,
        conflicts
      );
    },
  },
  {
    id: 'onsite-gtm-not-in-body',
    category: 'onsite',
    tier: 'premium',
    impact: 'medium',
    label: 'GTM Not in Body',
    description: 'Google Tag Manager code should be in <head>, not <body>',
    fix: 'Move the GTM <script> into <head>; only the <noscript> iframe belongs at the top of <body>.',
    run: (ctx) => {
      const gtmRe = /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/;
      if (!gtmRe.test(ctx.doc.html)) return skip('Google Tag Manager is not installed.');
      const inHead = gtmRe.test(ctx.doc.head);
      const bodyScript = ctx.doc.scripts.some(
        (s) => /googletagmanager\.com\/gtm\.js/.test(s.code + JSON.stringify(s.attrs)) && !inHead
      );
      const bodyOnly = !inHead && (bodyScript || /GTM-[A-Z0-9]{4,}/.test(ctx.doc.body));
      return verdict(
        inHead,
        'The GTM container script loads from <head>.',
        bodyOnly
          ? 'GTM loads from <body> — tags fire late and can miss pageview data.'
          : 'GTM was detected but not inside <head>.'
      );
    },
  },
  {
    id: 'onsite-external-not-all-nofollow',
    category: 'onsite',
    tier: 'premium',
    impact: 'medium',
    label: 'External Links Not All Nofollow',
    description: 'Some external links should be followed for link equity',
    fix: 'Reserve rel="nofollow"/"sponsored" for paid and untrusted links; let editorial citations pass equity.',
    run: (ctx) => {
      const external = ctx.doc.links.filter((l) => l.external && l.href);
      if (external.length < 3) return skip('Too few external links to judge (needs 3+).');
      const followed = external.filter((l) => !/\bnofollow\b/.test(l.rel));
      return verdict(
        followed.length > 0,
        `${followed.length}/${external.length} external links pass equity.`,
        `All ${external.length} external links are nofollow — that reads as an unnatural, over-optimised pattern.`,
        followed.length
      );
    },
  },
  {
    id: 'onsite-no-staging-urls',
    category: 'onsite',
    tier: 'premium',
    impact: 'critical',
    label: 'No Staging URLs in Menu',
    description: 'Menu links should not point to staging/dev URLs',
    fix: 'Search-and-replace every staging hostname with the live domain across posts, menus and options.',
    run: (ctx) => {
      const stagingRe =
        /(staging|dev|test|preprod|uat|sandbox)[-.][a-z0-9-]+\.[a-z]{2,}|\.(local|test|dev|invalid)$|localhost|\d+\.\d+\.\d+\.\d+/i;
      const leaks = ctx.doc.links.filter((l) => l.href && stagingRe.test(l.host));
      return verdict(
        leaks.length === 0,
        'No staging or development URLs found in the markup.',
        `${leaks.length} link(s) still point at a staging/dev host: ${[...new Set(leaks.map((l) => l.host))]
          .slice(0, 3)
          .join(', ')}`,
        [...new Set(leaks.map((l) => l.host))]
      );
    },
  },
  {
    id: 'onsite-nav-not-nofollow',
    category: 'onsite',
    tier: 'premium',
    impact: 'high',
    label: 'Menu/Footer Links Not Nofollow',
    description: 'Navigation links should not have a nofollow attribute',
    fix: 'Remove rel="nofollow" from internal navigation — it blocks PageRank flowing through your own site.',
    run: (ctx) => {
      const navRegion = `${ctx.doc.nav}\n${ctx.doc.header}\n${ctx.doc.footer}`;
      const navAnchors = [...navRegion.matchAll(/<a\b([^>]*)>/gi)].map((m) => m[1]);
      if (!navAnchors.length) return skip('No navigation or footer anchors found.');
      const nofollowed = navAnchors.filter((a) => /rel\s*=\s*["'][^"']*nofollow/i.test(a));
      return verdict(
        nofollowed.length === 0,
        `None of the ${navAnchors.length} navigation/footer links are nofollowed.`,
        `${nofollowed.length} navigation/footer link(s) carry rel="nofollow".`,
        nofollowed.length
      );
    },
  },
  {
    id: 'onsite-robots-sitemap-reachable',
    category: 'onsite',
    tier: 'free',
    impact: 'high',
    label: 'Robots Sitemap Not Broken',
    description: 'XML sitemap URL in robots.txt is accessible',
    fix: 'Make sure the Sitemap: URL in robots.txt returns 200 and lists your live URLs.',
    run: (ctx) => {
      const declared = ctx.sitemaps.filter((s) => s.fromRobots);
      if (!declared.length) {
        const anyReachable = ctx.sitemaps.some((s) => s.ok);
        return anyReachable
          ? warn('robots.txt declares no sitemap, though one exists at the default location.')
          : fail('robots.txt declares no sitemap and none was reachable.');
      }
      const broken = declared.filter((s) => !s.ok);
      return verdict(
        broken.length === 0,
        `All ${declared.length} sitemap(s) declared in robots.txt return 200.`,
        `${broken.length} sitemap URL(s) in robots.txt are unreachable: ${broken
          .map((s) => `${s.url} (${s.status || 'no response'})`)
          .join(', ')}`,
        broken
      );
    },
  },
];

/* ------------------------------------- About-page check factories */

function aboutTextCheck(re, good, bad) {
  return (ctx) => {
    if (!ctx.about) return skip('Requires a premium deep scan.');
    if (!ctx.about.found) return fail('No About page could be fetched.');
    return verdict(re.test(ctx.about.text), good, bad);
  };
}

function aboutHeadingCheck(re, good, bad) {
  return (ctx) => {
    if (!ctx.about) return skip('Requires a premium deep scan.');
    if (!ctx.about.found) return fail('No About page could be fetched.');
    const inHeading = ctx.about.doc.headings.some((h) => re.test(h.text));
    return verdict(inHeading || re.test(ctx.about.text), good, bad);
  };
}

/* ---------------------------------------------------------- exports */

export const FREE_CHECKS = CHECKS.filter((c) => c.tier === 'free');
export const PREMIUM_CHECKS = CHECKS.filter((c) => c.tier === 'premium');

/** Per-category free/total counts — powers the pricing comparison table. */
export function categoryCounts() {
  return CATEGORIES.map((cat) => {
    const all = CHECKS.filter((c) => c.category === cat.id);
    return {
      ...cat,
      free: all.filter((c) => c.tier === 'free').length,
      total: all.length,
    };
  });
}

/** Public catalogue for the marketing page — no evaluator functions. */
export function checkCatalogue() {
  return CHECKS.map(({ id, category, tier, label, description, impact }) => ({
    id,
    category,
    tier,
    label,
    description,
    impact,
  }));
}
