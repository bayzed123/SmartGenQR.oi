/**
 * Safe outbound fetching for the audit crawler.
 *
 * This Worker takes a URL from an anonymous visitor and fetches it, so every
 * request has to be treated as a potential SSRF attempt. We only ever allow
 * http/https on public hostnames, we cap the body size, and we cap the time.
 */

const MAX_BODY_BYTES = 2_500_000; // 2.5 MB is plenty for a homepage
const FETCH_TIMEOUT_MS = 12_000;

export const USER_AGENT =
  'Mozilla/5.0 (compatible; SmartGenAuditBot/1.0; +https://smartgentools.com/seo-audit-tool/)';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
]);

/** Private / link-local / loopback IPv4 ranges plus IPv6 equivalents. */
function isPrivateAddress(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTNAMES.has(host)) return true;
  // Anything inside the reserved .internal / .local / .localhost space.
  if (/\.(internal|local|localhost|home\.arpa)$/.test(host)) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    if (ipv4.slice(1).some((n) => Number(n) > 255)) return true;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  if (host.includes(':')) {
    // IPv6: block loopback, unique-local (fc00::/7) and link-local (fe80::/10).
    if (host === '::1' || host === '::') return true;
    if (/^f[cd][0-9a-f]{2}:/i.test(host)) return true;
    if (/^fe[89ab][0-9a-f]:/i.test(host)) return true;
    return false;
  }

  return false;
}

/**
 * Normalise and validate a user-supplied website URL.
 * @returns {URL}
 * @throws {Error} with a `.userMessage` safe to show a visitor.
 */
export function normalizeTargetUrl(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw badUrl('Please enter a website URL.');
  }

  let raw = input.trim();
  if (raw.length > 2048) throw badUrl('That URL is too long.');
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw badUrl('That does not look like a valid website URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw badUrl('Only http:// and https:// websites can be audited.');
  }
  if (url.username || url.password) {
    throw badUrl('URLs with embedded credentials are not supported.');
  }
  if (!url.hostname.includes('.')) {
    throw badUrl('Please enter a full domain, for example example.com.');
  }
  if (isPrivateAddress(url.hostname)) {
    throw badUrl('Private, local and internal addresses cannot be audited.');
  }

  url.hash = '';
  return url;
}

function badUrl(message) {
  const err = new Error(message);
  err.userMessage = message;
  err.status = 400;
  return err;
}

/**
 * Fetch a URL, following redirects manually so we can record the chain and
 * re-validate every hop against the SSRF rules.
 *
 * @returns {Promise<{ok:boolean, status:number, url:string, finalUrl:string,
 *   redirects:string[], headers:Headers|null, body:string, contentType:string,
 *   error:string|null, timingMs:number}>}
 */
export async function safeFetch(target, options = {}) {
  const {
    method = 'GET',
    maxRedirects = 5,
    readBody = true,
    accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  } = options;

  const started = Date.now();
  const redirects = [];
  let current;

  try {
    current = target instanceof URL ? new URL(target.href) : normalizeTargetUrl(String(target));
  } catch (err) {
    return failure(String(target), err.userMessage || 'Invalid URL', started, redirects);
  }

  for (let hop = 0; hop <= maxRedirects; hop++) {
    let response;
    try {
      response = await fetch(current.href, {
        method,
        redirect: 'manual',
        headers: {
          'User-Agent': USER_AGENT,
          Accept: accept,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      const reason = err?.name === 'TimeoutError' ? 'Request timed out' : 'Could not connect';
      return failure(current.href, reason, started, redirects);
    }

    const location = response.headers.get('location');
    const isRedirect = response.status >= 300 && response.status < 400 && location;

    if (!isRedirect) {
      let body = '';
      const contentType = response.headers.get('content-type') || '';
      if (readBody && method !== 'HEAD') {
        body = await readCapped(response);
      }
      return {
        ok: response.ok,
        status: response.status,
        url: target instanceof URL ? target.href : String(target),
        finalUrl: current.href,
        redirects,
        headers: response.headers,
        body,
        contentType,
        error: null,
        timingMs: Date.now() - started,
      };
    }

    let next;
    try {
      next = new URL(location, current.href);
    } catch {
      return failure(current.href, 'Invalid redirect target', started, redirects);
    }
    if (next.protocol !== 'http:' && next.protocol !== 'https:') {
      return failure(current.href, 'Unsupported redirect protocol', started, redirects);
    }
    if (isPrivateAddress(next.hostname)) {
      return failure(current.href, 'Redirect pointed at a private address', started, redirects);
    }

    redirects.push({ from: current.href, to: next.href, status: response.status });
    current = next;
  }

  return failure(current.href, 'Too many redirects', started, redirects);
}

function failure(url, error, started, redirects) {
  return {
    ok: false,
    status: 0,
    url,
    finalUrl: url,
    redirects,
    headers: null,
    body: '',
    contentType: '',
    error,
    timingMs: Date.now() - started,
  };
}

/** Read a response body but stop once MAX_BODY_BYTES have arrived. */
async function readCapped(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const chunks = [];
  let total = 0;

  try {
    while (total < MAX_BODY_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      chunks.push(decoder.decode(value, { stream: true }));
    }
  } catch {
    // Truncated bodies are still useful — audit what we managed to read.
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }

  chunks.push(decoder.decode());
  return chunks.join('');
}

/** HEAD first, fall back to a bodyless GET for servers that reject HEAD. */
export async function probe(url) {
  const head = await safeFetch(url, { method: 'HEAD', readBody: false });
  if (head.status && head.status !== 405 && head.status !== 501) return head;
  return safeFetch(url, { method: 'GET', readBody: false });
}
