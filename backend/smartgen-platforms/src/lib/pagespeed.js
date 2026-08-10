/**
 * Google PageSpeed Insights v5 — Core Web Vitals for the premium report.
 *
 * Free to call. An API key raises the quota to 25k/day; without one you get a
 * much lower anonymous quota, so we degrade gracefully rather than failing the
 * whole audit when PSI is slow or rate-limited.
 */

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const PSI_TIMEOUT_MS = 28_000;

/** Google's own Core Web Vitals thresholds. */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
};

export async function fetchCoreWebVitals(url, apiKey, strategy = 'mobile') {
  const params = new URLSearchParams({ url, strategy });
  params.append('category', 'PERFORMANCE');
  params.append('category', 'SEO');
  params.append('category', 'ACCESSIBILITY');
  params.append('category', 'BEST_PRACTICES');
  if (apiKey) params.set('key', apiKey);

  let payload;
  try {
    const res = await fetch(`${PSI_ENDPOINT}?${params}`, {
      signal: AbortSignal.timeout(PSI_TIMEOUT_MS),
    });
    if (!res.ok) {
      return unavailable(
        res.status === 429
          ? 'PageSpeed Insights is rate-limited right now. Add a PAGESPEED_API_KEY to raise the quota.'
          : `PageSpeed Insights returned ${res.status}.`
      );
    }
    payload = await res.json();
  } catch (err) {
    return unavailable(
      err?.name === 'TimeoutError'
        ? 'PageSpeed Insights took too long to respond.'
        : 'PageSpeed Insights could not be reached.'
    );
  }

  const lighthouse = payload.lighthouseResult || {};
  const audits = lighthouse.audits || {};
  const categories = lighthouse.categories || {};

  // Field data (real Chrome users) is the ranking signal; lab data is the
  // diagnostic. Report both, and prefer field data when it exists.
  const field = payload.loadingExperience?.metrics || {};
  const origin = payload.originLoadingExperience?.metrics || {};

  const metrics = {
    LCP: pick(field.LARGEST_CONTENTFUL_PAINT_MS, audits['largest-contentful-paint'], 'LCP'),
    INP: pick(
      field.INTERACTION_TO_NEXT_PAINT || field.EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT,
      audits['total-blocking-time'],
      'INP'
    ),
    CLS: pickCls(field.CUMULATIVE_LAYOUT_SHIFT_SCORE, audits['cumulative-layout-shift']),
    FCP: pick(field.FIRST_CONTENTFUL_PAINT_MS, audits['first-contentful-paint'], 'FCP'),
    TTFB: pick(field.EXPERIMENTAL_TIME_TO_FIRST_BYTE, audits['server-response-time'], 'TTFB'),
  };

  const opportunities = Object.values(audits)
    .filter(
      (a) =>
        a?.details?.type === 'opportunity' &&
        typeof a.numericValue === 'number' &&
        a.numericValue > 100
    )
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: stripLinks(a.description || ''),
      savingsMs: Math.round(a.numericValue),
    }));

  return {
    available: true,
    strategy,
    testedUrl: lighthouse.finalUrl || url,
    fetchedAt: new Date().toISOString(),
    hasFieldData: Object.keys(field).length > 0,
    originHasFieldData: Object.keys(origin).length > 0,
    overallFieldVerdict: payload.loadingExperience?.overall_category || null,
    scores: {
      performance: pct(categories.performance?.score),
      seo: pct(categories.seo?.score),
      accessibility: pct(categories.accessibility?.score),
      bestPractices: pct(categories['best-practices']?.score),
    },
    metrics,
    coreWebVitalsPassed: ['LCP', 'INP', 'CLS'].every((k) => metrics[k]?.rating === 'good'),
    opportunities,
    error: null,
  };
}

function unavailable(reason) {
  return {
    available: false,
    error: reason,
    scores: {},
    metrics: {},
    opportunities: [],
    coreWebVitalsPassed: null,
  };
}

function pct(score) {
  return typeof score === 'number' ? Math.round(score * 100) : null;
}

function rate(key, value) {
  const t = THRESHOLDS[key];
  if (!t || value == null) return null;
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

function pick(fieldMetric, labAudit, key) {
  if (fieldMetric && typeof fieldMetric.percentile === 'number') {
    return {
      value: fieldMetric.percentile,
      display: `${Math.round(fieldMetric.percentile)} ms`,
      source: 'field',
      rating: rate(key, fieldMetric.percentile),
      threshold: THRESHOLDS[key],
    };
  }
  if (labAudit && typeof labAudit.numericValue === 'number') {
    return {
      value: Math.round(labAudit.numericValue),
      display: labAudit.displayValue || `${Math.round(labAudit.numericValue)} ms`,
      source: 'lab',
      rating: rate(key, labAudit.numericValue),
      threshold: THRESHOLDS[key],
    };
  }
  return null;
}

function pickCls(fieldMetric, labAudit) {
  // The CrUX API returns CLS multiplied by 100.
  if (fieldMetric && typeof fieldMetric.percentile === 'number') {
    const value = fieldMetric.percentile / 100;
    return {
      value,
      display: value.toFixed(3),
      source: 'field',
      rating: rate('CLS', value),
      threshold: THRESHOLDS.CLS,
    };
  }
  if (labAudit && typeof labAudit.numericValue === 'number') {
    return {
      value: labAudit.numericValue,
      display: labAudit.displayValue || labAudit.numericValue.toFixed(3),
      source: 'lab',
      rating: rate('CLS', labAudit.numericValue),
      threshold: THRESHOLDS.CLS,
    };
  }
  return null;
}

function stripLinks(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}
