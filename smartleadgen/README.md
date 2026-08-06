# SmartLeadGen

Digital marketing lead-generation dashboard.
**Developer:** Sayad Md Bayezid Hosan — [sayadbayezid.com](https://sayadbayezid.com)

---
Live Demu [smartGen Lead collector Pro](https://smartleadgen-frontend.sayadmdbayezidhosan.workers.dev/)
Live Demu [smartGen Lead collector Beta](https://smartledgen-d2l3wnvtlt4siv2quddtpf.streamlit.app)

## What changed from your last attempt — and why this one should actually collect data

Your old stack (Playwright + BeautifulSoup4 + gspread + pandas + regex) was the
right *idea* with one fragile link in the chain: **launching a real Chromium
browser to scrape the Google Maps website itself.** Two things made that link
break in practice, and both are now removed:

1. **Google Maps' website is bot-defended and constantly changing.** It's built
   for humans clicking around, not for automation — selectors change, content
   loads lazily, and headless browsers frequently get served empty or blocked
   pages with no visible error. That silent failure looks exactly like "the
   logic runs, but data doesn't collect" — which is what you described.
2. **Chromium needs 300–500MB+ of RAM per instance.** Streamlit Community
   Cloud's free tier caps a whole app at **~1GB RAM**. Add pandas, Streamlit
   itself, and any concurrency, and a Playwright-driven app is right at the
   edge of getting silently killed or timing out — with no clear error message
   pointing at "it's a memory problem."

**The fix:** this rebuild replaces Google Maps scraping with **Google's own
Places API (New)** — the official, structured, ToS-compliant way to get
exactly this data (name, address, phone, website, rating). It's a plain HTTPS
JSON request, so there's no browser, no Chromium, no selector to break, and
it comfortably fits free-tier hosting. BeautifulSoup + regex are kept — but
only for the part they're genuinely good at: reading a *business's own public
website* for a contact email, which is a static-HTML task, not a bot-defended
one.

You also don't need a separate backend API service. Streamlit itself plays
both roles here (UI + the Python logic that calls Google and writes your
sheet) — one deployable app, fewer moving parts, fewer places to fail.

---

## Architecture

```
smartleadgen/
├── app.py                       # Dashboard: search form, live table, admin panel, exports
├── backend/
│   ├── places_api.py            # Google Places API (New) — search engine
│   ├── enrichment.py            # Visits each business's own site for email/socials
│   ├── validation.py            # Phone/name validation, dedup, lead scoring
│   └── sheets_writer.py         # Google Sheets append (gspread)
├── .streamlit/
│   ├── config.toml              # Theme
│   └── secrets.toml.example     # Copy → secrets.toml for local dev
├── requirements.txt
└── .gitignore
```

**Data flow:** keyword + location → Places API (New) Text Search → validate +
dedupe → (optional) visit the business's own website for email/socials →
score the lead → show live in the table → CSV export / push to Google Sheets.

---

## 1. Google Places API setup (the core data source)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a
   new project (e.g. "smartleadgen").
2. **APIs & Services → Library** → enable **"Places API (New)"**. (The old
   "Places API" is legacy and closed to new projects — make sure it says *New*.)
3. **APIs & Services → Credentials** → Create Credentials → API key.
4. Click the new key → **Restrict key**:
   - Under "API restrictions," limit it to **Places API (New)** only.
   - Under "Application restrictions," you can leave it unrestricted for a
     server-side Streamlit app (it never runs in a user's browser), or use IP
     restrictions if you deploy to a host with a static IP.
5. **Billing must be enabled** on the project even to use free usage — Google
   requires a card on file. This is the part that matters most for a student
   budget, so do these two things immediately after enabling billing:
   - **APIs & Services → Places API (New) → Quotas** — set a request-per-day
     cap low enough that you can never be surprised (e.g. 200/day). Once hit,
     Google simply stops answering calls — it does not let you go over.
   - **Billing → Budgets & alerts** — set a budget alert (e.g. at $1) so
     you'd get an email long before anything meaningful is spent.

**On cost:** Places API (New) bills by the *highest-tier field* in your
request. Phone number, website, and rating fall in the "Enterprise" tier —
which SmartLeadGen needs, since that's the whole point of the tool. Google
gives a free monthly allowance per field-tier before any charge applies
(no single fixed number applies to every account — check your project's
current allowance and rate under **Billing → Reports**, since Google has
changed this pricing structure before and may again). For realistic
student/small-agency usage — a few hundred searches a month, not thousands —
you'll likely stay inside the free allowance; the quota cap above is your
safety net regardless. `backend/places_api.py` already requests only the
fields SmartLeadGen uses, which keeps every call as cheap as it can be for
what you need.

---

## 2. Google Sheets setup

1. In the same (or a new) Google Cloud project: enable **Google Sheets API**
   and **Google Drive API**.
2. **APIs & Services → Credentials → Create Credentials → Service account.**
   Give it any name (e.g. "smartleadgen-writer"). No roles needed.
3. Open the service account → **Keys → Add key → Create new key → JSON**.
   This downloads a `.json` file — this is what the admin panel's "Service
   account JSON" upload wants, or what goes into `GOOGLE_SERVICE_ACCOUNT_JSON`
   in secrets.
4. Open that JSON file and copy the `client_email` value
   (looks like `smartleadgen-writer@your-project.iam.gserviceaccount.com`).
5. **Open your target Google Sheet → Share → paste that email → give it
   Editor access.** This is the single most common setup mistake — the app
   will fail to open the sheet if this step is skipped.
6. Copy the sheet's URL — that's what goes in the "Google Sheet URL" field.

---

## 3. Run it locally

```bash
cd smartleadgen
pip install -r requirements.txt
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# edit .streamlit/secrets.toml with your real keys
streamlit run app.py
```

If you'd rather not touch `secrets.toml` yet, just run it and paste your
Places API key into the **⚙️ Admin — API & Sheet settings** panel at the top
of the page — masked as you type, kept only for that session.

---

## 4. Deploy free — Streamlit Community Cloud

1. Push this folder to a **public GitHub repo** (private repos work too, but
   the free tier only allows one private app).
2. Go to [share.streamlit.io](https://share.streamlit.io) → sign in with
   GitHub → **New app** → pick the repo, branch, and `app.py`.
3. Before or after deploying, open the app's **Settings → Secrets** and paste
   in the same key/value pairs from `secrets.toml.example`, filled in with your
   real values. This is the *permanent* store — unlike keys typed into the
   in-app admin panel, these survive app restarts.
4. Deploy. First load can take a minute; after ~12 hours with no visitors the
   app "sleeps" and needs one click to wake up — normal free-tier behavior,
   not a bug.

**Alternative free host:** [Hugging Face Spaces](https://huggingface.co/spaces)
also runs Streamlit apps for free and doesn't require a public repo. Same
`requirements.txt` and `secrets` pattern, different dashboard.

**Where Firestore/Cloudflare fit in:** Cloudflare Workers/Pages don't run a
persistent Python process, so they're not a fit for hosting the Streamlit app
itself. Where they *do* help: if you later want a second, queryable copy of
your leads beyond Google Sheets, **Firestore** (same Google Cloud project,
same service-account credentials you already set up above) is the more
natural next step than Cloudflare D1, precisely because it reuses
credentials you already have. Worth doing later, not needed to launch.

---

## 5. What each column means

| Column | Source |
|---|---|
| Business Name, Address, Rating, Reviews | Google Places API |
| Sector/Category | Places API `type`, cleaned up |
| Phone | Places API, validated & reformatted via `phonenumbers` (Google's own library — catches malformed numbers before they reach your sheet) |
| Website | Places API |
| Email, Facebook, Instagram, LinkedIn | Found by visiting the business's own website (only if a website exists) |
| Lead Score | 🔥 High = no website, or a website with no findable contact/socials — the clearest "needs a digital marketer" signal. 🟡 Medium = some presence but weak (rating < 4.0 or under 10 reviews). ⚪ Low = already well-established online. |
| Google Maps Link, Date Collected | Reference / audit trail |

Every row is deduplicated by Google's own Place ID, so re-running the same
search twice won't create duplicate rows in your sheet.

---

## 6. Ideas for later (not required to launch)

- **Hunter.io** as a fallback when the website-scrape finds no email — it has
  a small free monthly search allowance; check current limits at
  [hunter.io/pricing](https://hunter.io/pricing) before relying on a specific
  number, as free-tier terms shift over time.
- **"Smart prompt" mode** — instead of typing keyword + location separately,
  type a free-form goal ("marketing agency clients in Dhaka with no website")
  and have an LLM turn it into the structured search + a post-filter. This
  would call the **Anthropic API**, which is a separate, pay-as-you-go product
  from your Claude.ai subscription (a Pro plan doesn't include API credits).
  Current API pricing is at [docs.claude.com](https://docs.claude.com) —
  worth checking there directly since rates and models change.
- **Firestore** as a second datastore alongside Sheets, if you want to query/
  filter leads programmatically later instead of only viewing them as rows.

---

## 7. Design notes

Palette and type were chosen deliberately rather than left at Streamlit's
defaults: a signal-teal (`#0E7C6B`) and amber (`#E8A33D`) against ink and
off-white, Space Grotesk for headings, Inter for body text, and a small
animated "ping" mark in the header — a nod to what this tool actually does:
finding a signal (a real opportunity) inside a lot of noise (every business
listing that isn't one).