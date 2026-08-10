/**
 * Google Sheets lead capture using a service account.
 *
 * Workers have no googleapis SDK, so we mint the OAuth2 access token by hand:
 * build a JWT, sign it RS256 with WebCrypto, exchange it at the token
 * endpoint, then append a row with the Sheets v4 API.
 *
 * Setup:
 *   1. Google Cloud Console → create a service account → create a JSON key.
 *   2. Enable the "Google Sheets API" for that project.
 *   3. Share your leads spreadsheet with the service account's client_email
 *      as an Editor.
 *   4. wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON   (paste the JSON)
 */

const TOKEN_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

/** Access tokens live an hour; cache per isolate so we sign at most hourly. */
let tokenCache = { token: null, expiresAt: 0, email: null };

export const LEAD_COLUMNS = [
  'Timestamp (UTC)',
  'Lead Type',
  'Full Name',
  'Email',
  'Website URL',
  'Competitor URL',
  'Country',
  'WhatsApp',
  'Preferred Contact',
  'Health Score',
  'Grade',
  'Issues Found',
  'Checks Passed',
  'Checks Failed',
  'Performance Score',
  'LCP',
  'CLS',
  'Top Issue',
  'Source',
  'Referrer',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'Country (Cloudflare)',
  'User Agent',
];

/**
 * Append one lead row. Never throws — a Sheets outage must not lose the user
 * their audit, so failures are returned for logging instead.
 */
export async function appendLead(env, lead) {
  const sheetId = env.LEADS_SHEET_ID;
  const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!sheetId) return { ok: false, skipped: true, error: 'LEADS_SHEET_ID is not configured.' };
  if (!raw) return { ok: false, skipped: true, error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not configured.' };

  let credentials;
  try {
    credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.' };
  }

  let token;
  try {
    token = await getAccessToken(credentials);
  } catch (err) {
    return { ok: false, error: `Could not mint a Google access token: ${err.message}` };
  }

  const tab = env.LEADS_SHEET_TAB || 'Leads';
  const range = `${encodeURIComponent(tab)}!A:Y`;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${range}` +
    ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ values: [leadToRow(lead)] }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `Sheets API ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Sheets request failed: ${err.message}` };
  }
}

/** Write the header row once, when setting up a fresh spreadsheet. */
export async function ensureHeaderRow(env) {
  const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!env.LEADS_SHEET_ID || !raw) return { ok: false, error: 'Sheets is not configured.' };

  const credentials = JSON.parse(raw);
  const token = await getAccessToken(credentials);
  const tab = env.LEADS_SHEET_TAB || 'Leads';
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.LEADS_SHEET_ID)}` +
    `/values/${encodeURIComponent(tab)}!A1?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [LEAD_COLUMNS] }),
  });

  if (!res.ok) {
    return { ok: false, error: `Sheets API ${res.status}: ${(await res.text()).slice(0, 300)}` };
  }
  return { ok: true, columns: LEAD_COLUMNS };
}

function leadToRow(lead) {
  return [
    lead.timestamp || new Date().toISOString(),
    lead.leadType || 'free_audit',
    lead.fullName || '',
    lead.email || '',
    lead.websiteUrl || '',
    lead.competitorUrl || '',
    lead.country || '',
    lead.whatsapp || '',
    lead.preferredContact || '',
    lead.score ?? '',
    lead.grade || '',
    lead.issueCount ?? '',
    lead.passed ?? '',
    lead.failed ?? '',
    lead.performanceScore ?? '',
    lead.lcp || '',
    lead.cls || '',
    lead.topIssue || '',
    lead.source || 'seo-audit-tool',
    lead.referrer || '',
    lead.utmSource || '',
    lead.utmMedium || '',
    lead.utmCampaign || '',
    lead.cfCountry || '',
    (lead.userAgent || '').slice(0, 250),
  ];
}

/* ------------------------------------------------- OAuth2 / JWT */

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);

  if (
    tokenCache.token &&
    tokenCache.email === credentials.client_email &&
    tokenCache.expiresAt > now + 60
  ) {
    return tokenCache.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: credentials.client_email,
    scope: TOKEN_SCOPE,
    aud: credentials.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const key = await importPrivateKey(credentials.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${b64urlBytes(new Uint8Array(signature))}`;

  const res = await fetch(claims.aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`token endpoint ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error('token endpoint returned no access_token');

  tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600),
    email: credentials.client_email,
  };
  return data.access_token;
}

async function importPrivateKey(pem) {
  // Wrangler secrets often arrive with literal "\n" sequences intact.
  const normalized = String(pem).replace(/\\n/g, '\n');
  const body = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');

  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function b64url(str) {
  return b64urlBytes(new TextEncoder().encode(str));
}

function b64urlBytes(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
