/**
 * SERP Preview Tool — "Check Ranking". Looks up where a domain sits in
 * Google's organic results for a keyword, via the Google Custom Search JSON
 * API (https://developers.google.com/custom-search/v1/overview).
 *
 * WHY THIS NEEDS TWO SEPARATE CREDENTIALS
 * ----------------------------------------
 * The Custom Search API requires both an API key AND a Programmable Search
 * Engine id ("cx") configured to search the whole web. The key alone is not
 * enough — Google has no way to know what to search without a cx. Create one
 * at https://programmablesearchengine.google.com/ (turn on "Search the entire
 * web"), then set both as Worker secrets:
 *   GOOGLE_CSE_API_KEY   the API key
 *   GOOGLE_CSE_ID         the search engine id ("cx" in the CSE dashboard)
 *
 * WHY THIS IS RATE LIMITED SO MUCH HARDER THAN EVERYTHING ELSE
 * --------------------------------------------------------------
 * The Custom Search free tier is 100 queries/day TOTAL for the whole
 * project — not per visitor. A single popular page could burn the entire
 * daily allowance in minutes without a shared, global cap on top of the
 * usual per-visitor one. See checkRanking's global-quota check below.
 */

const ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const TIMEOUT_MS = 15_000;
const RESULTS_PER_PAGE = 10;

/**
 * @param {object} input
 * @param {string} input.domain   e.g. "smartgentools.com" or a full URL
 * @param {string} input.keyword  the search query to check
 * @param {object} env            Worker env — GOOGLE_CSE_API_KEY, GOOGLE_CSE_ID, AUDIT_KV
 */
export async function checkRanking(input, env) {
  const apiKey = env.GOOGLE_CSE_API_KEY;
  const cx = env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    return {
      available: false,
      reason:
        'Rank checking is not configured on the server yet. It needs a Google Programmable Search Engine (GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID).',
    };
  }

  const domain = normalizeDomain(input.domain);
  const keyword = String(input.keyword || '').trim();
  if (!domain) return { available: false, reason: 'Enter the page URL to check first.' };
  if (!keyword) return { available: false, reason: 'Enter a keyword to check ranking for.' };

  const global = await consumeGlobalQuota(env);
  if (!global.ok) {
    return {
      available: false,
      reason: `SmartGen's daily rank-check allowance (shared across every visitor) is used up. It resets at midnight UTC — ${global.used}/${global.limit} used today.`,
      code: 'global_quota_exhausted',
    };
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', keyword);
  url.searchParams.set('num', String(RESULTS_PER_PAGE));

  let json;
  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      // Quota errors come back as 429 from Google itself too.
      return {
        available: false,
        reason:
          res.status === 429
            ? "Google's search quota is exhausted for today."
            : `Google Custom Search returned ${res.status}. ${detail.slice(0, 200)}`,
      };
    }
    json = await res.json();
  } catch (err) {
    return {
      available: false,
      reason: err?.name === 'TimeoutError' ? 'The ranking check timed out.' : `Ranking check failed: ${err.message}`,
    };
  }

  const items = Array.isArray(json.items) ? json.items : [];
  const results = items.map((item, i) => ({
    position: i + 1,
    title: String(item.title || '').slice(0, 200),
    url: String(item.link || ''),
    snippet: String(item.snippet || '').slice(0, 300),
  }));

  const match = results.find((r) => hostnameOf(r.url) === domain || hostnameOf(r.url).endsWith(`.${domain}`));

  return {
    available: true,
    keyword,
    domain,
    position: match ? match.position : null,
    checked: results.length,
    inTop10: Boolean(match),
    topResults: results,
    dailyQuota: { used: global.used, limit: global.limit },
  };
}

function normalizeDomain(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return raw.replace(/^www\./, '').toLowerCase();
  }
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Global (project-wide, not per-visitor) daily counter in KV, so 100 free
 * queries/day can never be exhausted by traffic alone without the tool
 * degrading gracefully first. Defaults to 80 to leave the site owner some
 * headroom for their own testing on top of visitor usage.
 */
async function consumeGlobalQuota(env) {
  const limit = Number(env.CSE_DAILY_LIMIT || 80);
  if (!env.AUDIT_KV) return { ok: true, used: 0, limit };

  const day = new Date().toISOString().slice(0, 10);
  const key = `cse-global-quota:${day}`;
  const used = Number((await env.AUDIT_KV.get(key)) || 0) + 1;
  await env.AUDIT_KV.put(key, String(used), { expirationTtl: 2 * 24 * 60 * 60 });

  return { ok: used <= limit, used, limit };
}
