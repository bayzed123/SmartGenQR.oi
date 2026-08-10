/* ==========================================================================
   SmartGen SEO Audit Tool — frontend
   Talks to the SmartGen Platforms Worker. No build step, no dependencies.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------ config */

  // Point this at your deployed Worker. Overridable per-environment with
  // <meta name="smartgen-api" content="https://…"> in the page head.
  var API_BASE = (function () {
    var meta = document.querySelector('meta[name="smartgen-api"]');
    var configured = meta && meta.getAttribute('content');
    return (configured || 'https://smartgen-platforms.smartgentools.workers.dev').replace(/\/+$/, '');
  })();

  var STATUS_ICON = { pass: '✅', warn: '⚠️', fail: '❌', skip: '➖' };
  var STATUS_CLASS = { pass: 'is-pass', warn: 'is-warn', fail: 'is-fail', skip: 'is-skip' };

  var state = {
    report: null,
    scanning: false,
    captcha: { a: 0, b: 0 },
    catalogue: null,
  };

  /* --------------------------------------------------------- utilities */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function scoreColor(score) {
    if (score == null) return '#94a3b8';
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  function api(path, options) {
    var opts = options || {};
    return fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (res) {
      return res
        .json()
        .catch(function () {
          return { ok: false, error: 'The server returned an unreadable response.' };
        })
        .then(function (data) {
          return { status: res.status, data: data };
        });
    });
  }

  /* ------------------------------------------------------------- scan */

  var PROGRESS_STEPS = [
    'Resolving your domain…',
    'Fetching the homepage…',
    'Reading robots.txt and your sitemap…',
    'Checking trust pages and footer signals…',
    'Scoring 27 SEO and E-E-A-T checks…',
  ];

  function startProgress() {
    var wrap = $('#auditProgress');
    var fill = $('#progressFill');
    var label = $('#progressLabel');
    wrap.hidden = false;

    var step = 0;
    fill.style.width = '8%';
    label.textContent = PROGRESS_STEPS[0];

    var timer = setInterval(function () {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 1);
      fill.style.width = 15 + step * 19 + '%';
      label.textContent = PROGRESS_STEPS[step];
    }, 1600);

    return function stop(success) {
      clearInterval(timer);
      fill.style.width = '100%';
      label.textContent = success ? 'Report ready.' : 'Scan stopped.';
      setTimeout(function () {
        wrap.hidden = true;
        fill.style.width = '0';
      }, 900);
    };
  }

  function runScan(event) {
    if (event) event.preventDefault();
    if (state.scanning) return;

    var input = $('#siteUrl');
    var url = input.value.trim();
    if (!url) {
      input.focus();
      return;
    }

    state.scanning = true;
    var button = $('#scanButton');
    button.disabled = true;
    button.textContent = 'Auditing…';
    setError('');

    var stopProgress = startProgress();

    api('/api/audit', { method: 'POST', body: { url: url } })
      .then(function (res) {
        stopProgress(res.data && res.data.ok);

        if (!res.data || !res.data.ok) {
          if (res.data && res.data.code === 'quota_exhausted') {
            renderQuotaWall(res.data);
            return;
          }
          setError((res.data && res.data.error) || 'That scan did not complete. Please try again.');
          return;
        }

        state.report = res.data.report;
        renderReport(res.data.report, res.data.quota);
      })
      .catch(function () {
        stopProgress(false);
        setError(
          'We could not reach the audit service. Check your connection, or try again in a moment.'
        );
      })
      .finally(function () {
        state.scanning = false;
        button.disabled = false;
        button.textContent = 'Run Free Audit';
      });
  }

  function setError(message) {
    var box = $('#scanError');
    if (!message) {
      box.hidden = true;
      box.textContent = '';
      return;
    }
    box.hidden = false;
    box.textContent = message;
  }

  /* ----------------------------------------------------------- render */

  function renderReport(report, quota) {
    var root = $('#auditResults');
    root.hidden = false;

    renderScorePanel(report);
    renderCategories(report.score.categories);
    renderTopIssues(report.topIssues);
    renderAllChecks(report.results);
    renderLocked(report);
    renderImpact(report.impact);

    $('#leadCard').hidden = false;
    $('#leadWebsite').value = report.site.url || '';

    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (quota) renderQuota(quota);
  }

  function renderScorePanel(report) {
    var score = report.score.overall;
    var color = scoreColor(score);
    var circumference = 2 * Math.PI * 86;
    var offset = circumference * (1 - score / 100);

    $('#scorePanel').innerHTML =
      '<div class="score-dial">' +
      '<svg viewBox="0 0 200 200" role="img" aria-label="Overall SEO health score ' +
      score +
      ' out of 100">' +
      '<circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="16"/>' +
      '<circle cx="100" cy="100" r="86" fill="none" stroke="' +
      color +
      '" stroke-width="16" stroke-linecap="round" stroke-dasharray="' +
      circumference.toFixed(1) +
      '" stroke-dashoffset="' +
      offset.toFixed(1) +
      '"/>' +
      '</svg>' +
      '<div class="dial-value"><span class="dial-number" style="color:' +
      color +
      '">' +
      score +
      '</span><span class="dial-grade">Grade ' +
      esc(report.score.grade) +
      '</span></div>' +
      '</div>' +
      '<div class="score-summary">' +
      '<h2>' +
      esc(report.site.domain) +
      '</h2>' +
      '<p class="verdict">' +
      esc(report.score.verdict) +
      '</p>' +
      '<div class="stat-row">' +
      '<span class="stat-pill is-pass">' +
      report.score.passed +
      ' passed</span>' +
      '<span class="stat-pill is-warn">' +
      report.score.warned +
      ' warnings</span>' +
      '<span class="stat-pill is-fail">' +
      report.score.failed +
      ' failed</span>' +
      '<span class="stat-pill">' +
      report.score.total +
      ' checks run</span>' +
      (report.site.generator && report.site.generator !== 'Unknown'
        ? '<span class="stat-pill">' + esc(report.site.generator) + '</span>'
        : '') +
      '</div>' +
      '</div>';
  }

  function renderCategories(categories) {
    $('#categoryGrid').innerHTML = categories
      .map(function (cat) {
        var score = cat.score == null ? 0 : cat.score;
        var color = scoreColor(cat.score);
        return (
          '<div class="category-card">' +
          '<div class="cat-top">' +
          '<span class="cat-name">' +
          esc(cat.icon) +
          ' ' +
          esc(cat.name) +
          '</span>' +
          '<span class="cat-score" style="color:' +
          color +
          '">' +
          (cat.score == null ? '—' : score + '%') +
          '</span>' +
          '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          score +
          '%;background:' +
          color +
          '"></div></div>' +
          '<p class="cat-detail">' +
          cat.passed +
          ' of ' +
          cat.total +
          ' passed' +
          (cat.skipped ? ' · ' + cat.skipped + ' not applicable' : '') +
          '</p>' +
          '</div>'
        );
      })
      .join('');
  }

  function checkItemHtml(check, showFix) {
    return (
      '<li class="check-item ' +
      (STATUS_CLASS[check.status] || '') +
      '">' +
      '<span class="icon" aria-hidden="true">' +
      (STATUS_ICON[check.status] || '•') +
      '</span>' +
      '<div>' +
      '<div class="check-label">' +
      esc(check.label) +
      '<span class="impact-tag ' +
      esc(check.impact) +
      '">' +
      esc(check.impact) +
      '</span>' +
      '</div>' +
      '<p class="check-detail">' +
      esc(check.detail || check.description) +
      '</p>' +
      (showFix && check.fix && (check.status === 'fail' || check.status === 'warn')
        ? '<p class="check-fix"><strong>How to fix:</strong> ' + esc(check.fix) + '</p>'
        : '') +
      '</div>' +
      '</li>'
    );
  }

  function renderTopIssues(issues) {
    var section = $('#topIssuesSection');
    if (!issues || !issues.length) {
      section.innerHTML =
        '<h3>No blocking issues found 🎉</h3>' +
        '<p>Every free check passed. Your next wins are content depth and link acquisition — ' +
        'the premium audit covers 45 further checks that free scans do not reach.</p>';
      return;
    }
    section.innerHTML =
      '<h3>Fix these first — ' + issues.length + ' priority issues</h3>' +
      '<ul class="check-list">' +
      issues
        .map(function (i) {
          return checkItemHtml(i, true);
        })
        .join('') +
      '</ul>';
  }

  function renderAllChecks(results) {
    var byCategory = {};
    results.forEach(function (r) {
      (byCategory[r.category] = byCategory[r.category] || []).push(r);
    });

    // Render in the same order as the score panel so the two views line up.
    $('#allChecksBody').innerHTML = state.report.score.categories
      .map(function (cat) {
        var items = byCategory[cat.id] || [];
        if (!items.length) return '';
        return (
          '<details' +
          (cat.failed > 0 ? ' open' : '') +
          '>' +
          '<summary>' +
          esc(cat.icon) +
          ' ' +
          esc(cat.name) +
          '<span class="counts">' +
          cat.passed +
          '/' +
          cat.total +
          ' passed</span></summary>' +
          '<div class="cat-body"><ul class="check-list">' +
          items
            .map(function (i) {
              return checkItemHtml(i, true);
            })
            .join('') +
          '</ul></div>' +
          '</details>'
        );
      })
      .join('');
  }

  function renderLocked(report) {
    var panel = $('#lockedPanel');
    if (report.tier === 'premium') {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;

    var teasers = [
      'Preferred version check (www vs non-www duplicate homepages)',
      'All 9 About-page E-E-A-T checks',
      'Core Web Vitals — LCP, INP and CLS from real Chrome users',
      'Duplicate SEO / caching plugin conflicts',
      'Staging URLs leaking into your live menu',
      'AI-written 30-day action roadmap',
    ];

    panel.innerHTML =
      '<h4>🔒 45 more checks are waiting</h4>' +
      '<p>' +
      esc(report.locked ? report.locked.message : '') +
      '</p>' +
      '<div class="locked-preview">' +
      teasers
        .map(function (t) {
          return '<div class="locked-row"><span aria-hidden="true">🔒</span>' + esc(t) + '</div>';
        })
        .join('') +
      '</div>' +
      '<a class="tier-cta primary" href="#pricing">See what the full audit covers</a>';
  }

  function renderImpact(impact) {
    var box = $('#impactBox');
    if (!impact || !impact.issueCount) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    box.innerHTML =
      '<h3>📈 What fixing this is worth</h3>' +
      '<p>' +
      esc(impact.statement) +
      '</p>' +
      '<p class="form-note">Estimates are modelled from the issues found on your site and the ' +
      'typical impact of each fix. They are a planning guide, not a guarantee.</p>';
  }

  function renderQuota(quota) {
    if (!quota) return;
    var el = $('#quotaLine');
    if (quota.unlimited) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML =
      '<strong>' +
      quota.remaining +
      '</strong> of ' +
      quota.limit +
      ' free audits left today' +
      (quota.remaining === 0 ? ' — the full audit has no daily limit.' : '.');
  }

  function renderQuotaWall(payload) {
    var root = $('#auditResults');
    root.hidden = false;
    $('#scorePanel').innerHTML =
      '<div class="score-summary" style="grid-column:1/-1">' +
      '<h2>You have used all ' +
      esc(payload.quota.limit) +
      ' free audits for today</h2>' +
      '<p class="verdict">Your free scans reset in the next 24 hours. If you need results now, ' +
      'the full 72-check audit has no daily limit and includes Core Web Vitals, a 30-day roadmap ' +
      'and a competitor benchmark.</p>' +
      '<a class="tier-cta primary" href="#pricing" style="display:inline-block;margin-top:1rem">See the full audit</a>' +
      '</div>';
    ['#categoryGrid', '#topIssuesSection', '#allChecksBody'].forEach(function (sel) {
      $(sel).innerHTML = '';
    });
    $('#lockedPanel').hidden = true;
    $('#impactBox').hidden = true;
    $('#leadCard').hidden = true;
    renderQuota(payload.quota);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* -------------------------------------------------------- lead form */

  function newCaptcha() {
    state.captcha = {
      a: 5 + Math.floor(Math.random() * 20),
      b: 2 + Math.floor(Math.random() * 12),
    };
    $('#captchaQuestion').textContent =
      'What is ' + state.captcha.a + ' + ' + state.captcha.b + '?';
    $('#captchaAnswer').value = '';
  }

  function submitLead(event) {
    event.preventDefault();

    var status = $('#leadStatus');
    var button = $('#leadSubmit');
    var form = event.target;

    var answer = Number($('#captchaAnswer').value);
    if (answer !== state.captcha.a + state.captcha.b) {
      showLeadStatus('That security answer is not right. Give it another try.', 'is-error');
      newCaptcha();
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending…';
    status.hidden = true;

    var params = new URLSearchParams(location.search);
    var payload = {
      lead: {
        leadType: 'free_audit',
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        websiteUrl: form.websiteUrl.value.trim(),
        country: form.country.value,
        whatsapp: form.whatsapp.value.trim(),
        preferredContact: (form.querySelector('input[name="preferredContact"]:checked') || {}).value,
        company_website: form.company_website.value,
        source: 'seo-audit-tool',
        referrer: document.referrer || '',
        utmSource: params.get('utm_source') || '',
        utmMedium: params.get('utm_medium') || '',
        utmCampaign: params.get('utm_campaign') || '',
      },
      captcha: { a: state.captcha.a, b: state.captcha.b, answer: answer },
      report: state.report
        ? {
            site: state.report.site,
            score: state.report.score,
            impact: state.report.impact,
            topIssues: state.report.topIssues,
          }
        : null,
    };

    api('/api/lead', { method: 'POST', body: payload })
      .then(function (res) {
        if (res.data && res.data.ok) {
          showLeadStatus(
            '✅ Thanks — your full report is on its way. Check your inbox within 24 hours ' +
              '(and your spam folder, just in case).',
            'is-success'
          );
          form.reset();
        } else {
          showLeadStatus(
            (res.data && res.data.error) || 'We could not save your details. Please try again.',
            'is-error'
          );
        }
      })
      .catch(function () {
        showLeadStatus('We could not reach the server. Please try again in a moment.', 'is-error');
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = 'Email Me The Full Report';
        newCaptcha();
      });
  }

  function showLeadStatus(message, className) {
    var status = $('#leadStatus');
    status.hidden = false;
    status.className = 'form-status ' + className;
    status.textContent = message;
  }

  /* ------------------------------------------------- check catalogue */

  function loadCatalogue() {
    api('/api/checks')
      .then(function (res) {
        if (!res.data || !res.data.ok) return;
        state.catalogue = res.data;
        renderCatalogue(res.data);
      })
      .catch(function () {
        /* The static fallback markup in the page stays visible. */
      });
  }

  function renderCatalogue(data) {
    var byCategory = {};
    data.checks.forEach(function (c) {
      (byCategory[c.category] = byCategory[c.category] || []).push(c);
    });

    $('#catalogueBody').innerHTML = data.categories
      .map(function (cat) {
        var items = byCategory[cat.id] || [];
        return (
          '<details>' +
          '<summary>' +
          esc(cat.icon) +
          ' ' +
          esc(cat.name) +
          '<span class="counts">' +
          cat.free +
          ' free · ' +
          cat.total +
          ' total</span></summary>' +
          '<div class="cat-body">' +
          items
            .map(function (c) {
              return (
                '<div class="cat-row">' +
                '<span aria-hidden="true">' +
                (c.tier === 'free' ? '✅' : '⭐') +
                '</span>' +
                '<div><strong>' +
                esc(c.label) +
                '<span class="tier-chip ' +
                esc(c.tier) +
                '">' +
                (c.tier === 'free' ? 'Free' : 'Premium') +
                '</span></strong>' +
                '<span>' +
                esc(c.description) +
                '</span></div>' +
                '</div>'
              );
            })
            .join('') +
          '</div>' +
          '</details>'
        );
      })
      .join('');

    var tbody = $('#pricingRows');
    if (tbody) {
      tbody.innerHTML = data.categories
        .map(function (cat) {
          return (
            '<tr><td>' +
            esc(cat.icon) +
            ' ' +
            esc(cat.name) +
            '</td><td>' +
            cat.free +
            '</td><td>' +
            cat.total +
            '</td></tr>'
          );
        })
        .join('');
    }
  }

  /* -------------------------------------------------------------- init */

  function init() {
    $('#scanForm').addEventListener('submit', runScan);
    $('#leadForm').addEventListener('submit', submitLead);
    $('#printReport').addEventListener('click', function () {
      window.print();
    });

    newCaptcha();
    loadCatalogue();

    api('/api/quota')
      .then(function (res) {
        if (res.data && res.data.ok) renderQuota(res.data.quota);
      })
      .catch(function () {});

    // Deep link support: /seo-audit-tool/?url=example.com runs immediately.
    var prefill = new URLSearchParams(location.search).get('url');
    if (prefill) {
      $('#siteUrl').value = prefill;
      runScan();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
