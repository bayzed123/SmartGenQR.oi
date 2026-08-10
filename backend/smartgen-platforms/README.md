# SmartGen Platforms — SEO Audit API

Cloudflare Worker backend for the [SmartGen SEO Audit Tool](https://smartgentools.com/seo-audit-tool/).

This Worker **only scans and scores**. Email delivery is deliberately left to
the separate SmartGen mailer, which reads the leads spreadsheet — so a slow
inbox can never stall or crash an audit.

---

## What it does

| Capability | Free tier | Premium tier |
|---|---|---|
| SEO / E-E-A-T checks | 27 | 72 |
| Health score + grade | ✅ | ✅ |
| Priority fix list | Top 5 | Top 15 |
| Google Core Web Vitals (PageSpeed Insights) | — | ✅ |
| AI-written 30-day roadmap (Gemini) | — | ✅ |
| Competitor side-by-side benchmark | — | ✅ |
| Traffic impact prediction | ✅ (basic) | ✅ (full) |
| White-label PDF payload | — | ✅ |
| Audits per visitor per day | 3 | unlimited |

**Why 3 free audits/day** — one is not enough to earn trust, five removes any
reason to pay. Three lets a visitor scan their own site, a competitor, and a
client's site; the paywall then lands exactly when intent is highest. It also
keeps usage inside Cloudflare's free KV write allowance. Change it with the
`FREE_AUDIT_LIMIT` var — no code edit needed.

Visitors are identified by a SHA-256 of IP + user-agent + accept-language.
No cookie, no login.

---

## Cost

Everything runs on free tiers:

| Service | Free allowance | What we use it for |
|---|---|---|
| Cloudflare Workers | 100,000 req/day | the API itself |
| Workers KV | 100k reads / 1k writes per day | quota counters + 6h report cache |
| PageSpeed Insights API | 25,000 req/day with a key | Core Web Vitals |
| Gemini API (AI Studio) | free tier | 30-day roadmap |
| Google Sheets API | free | lead storage |
| GitHub Pages | free | the frontend |

Each audit costs 3 KV writes (burst counter, quota counter, and the report
cache on a miss), so the free plan comfortably covers ~300 audits/day — well
past the point where the tool is paying for itself.

The one limit worth watching is the free plan's **10 ms CPU per request**; the
crawler caps parsed HTML at 400 KB to stay inside it. If you ever see
`Error 1102` (CPU exceeded) on very large sites, the Workers Paid plan at
$5/month lifts it — nothing in the code needs to change.

---

## Deploy

```bash
cd backend/smartgen-platforms
npm install

# 1. Log in
npx wrangler login

# 2. KV is already created and wired into wrangler.toml:
#      SMARTGEN_AUDIT_KV          c4787a835bbb48f0bd1ed5cf03f23d49
#      SMARTGEN_AUDIT_KV_preview  db7cc5a006634b71bb4f7d15a082f4e5
#    (Nothing to do — listed here so you can verify in the dashboard.)

# 3. Set the secrets
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON   # paste the whole .json on one line
npx wrangler secret put PAGESPEED_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ADMIN_TOKEN                   # any long random string
npx wrangler secret put PREMIUM_UNLOCK_SECRET         # any long random string

# 4. Put your spreadsheet id in wrangler.toml → [vars] LEADS_SHEET_ID

# 5. Ship it
npx wrangler deploy
```

Then write the spreadsheet header row once:

```bash
curl -X POST https://smartgen-platforms.<subdomain>.workers.dev/api/admin/init-sheet \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Finally, set `API_BASE` in `/seo-audit-tool/audit.js` to your Worker URL.

### Google Sheets setup

1. Google Cloud Console → **Create service account** → **Keys → Add key → JSON**.
2. Enable the **Google Sheets API** for that project.
3. Open your leads spreadsheet → **Share** → add the service account's
   `client_email` as an **Editor**. Skipping this step is the cause of ~every
   `403` from the Sheets API.
4. Copy the spreadsheet id out of its URL into `LEADS_SHEET_ID`.

---

## API

### `GET /api/health`
Reports which integrations are configured. Use it to confirm a deploy.

### `GET /api/checks`
Public catalogue of all 72 checks (id, category, tier, label, description,
impact). The marketing page renders its comparison table from this, so the
site can never advertise a check the engine does not run.

### `GET /api/pricing`
Tier comparison and per-category free/total counts. Prices live server-side so
the frontend cannot be edited into a cheaper checkout.

### `GET /api/quota`
Free audits remaining for the calling visitor.

### `POST /api/audit`
```json
{ "url": "example.com" }
```
Returns the 27-check free report and consumes one daily audit. Repeat scans of
the same domain within 6 hours are served from cache.

### `POST /api/audit/premium`
```json
{
  "url": "example.com",
  "competitorUrl": "competitor.com",
  "strategy": "mobile",
  "unlockToken": "…",
  "whiteLabel": { "agencyName": "Acme SEO", "logoUrl": "https://…", "accentColor": "#0f172a" },
  "lead": { "fullName": "…", "email": "…" }
}
```
Requires a valid unlock token (`Authorization: Bearer …` also works). Returns
all 72 checks plus Core Web Vitals, the AI roadmap, the competitor comparison
and the white-label block.

### `POST /api/lead`
```json
{
  "lead": { "fullName": "…", "email": "…", "websiteUrl": "…", "country": "…",
            "whatsapp": "…", "preferredContact": "email" },
  "captcha": { "a": 18, "b": 5, "answer": 23 },
  "report": { }
}
```
Appends a row to the leads spreadsheet. The captcha sum is re-verified
server-side, and a hidden `company_website` honeypot silently drops bots.

---

## Premium unlock tokens

`PAYMENTS_ENABLED=false` (the current default) keeps premium in **preview**:
the endpoint still demands a signed token, so it is not open to the internet,
but no payment is checked. Mint one with:

```bash
npm run mint-token -- --secret "$PREMIUM_UNLOCK_SECRET" --order preview-001 --days 30
```

When you turn payments on, flip `PAYMENTS_ENABLED=true` and have your checkout
webhook mint tokens with the same HMAC algorithm
(`base64url(payload).base64url(hmacSha256(payload))`, payload `{order, exp}`).

---

## Safety

- **SSRF**: every target URL and every redirect hop is re-validated. Loopback,
  RFC1918, CGNAT, link-local (including `169.254.169.254`), `.internal`/`.local`
  and credentialed URLs are all rejected. Covered by tests.
- **Body caps**: responses are read to at most 2.5 MB and parsed to at most 400 KB.
- **Timeouts**: 12 s per fetch, 5 redirect hops max.
- **CORS**: locked to `ALLOWED_ORIGINS`.
- **Abuse**: 4 scans/minute burst brake plus the daily quota, both per visitor.

---

## Tests

```bash
npm test
```

Covers the registry invariants (exactly 72 checks, 27 free, per-category counts
matching the published pricing table), scoring behaviour on known-good and
known-broken fixtures, roadmap construction, and the SSRF guard.
