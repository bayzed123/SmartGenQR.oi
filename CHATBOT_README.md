# SmartGen AI Assistant — Implementation Guide

The chat widget that answers visitors' questions about SmartGen Tools.

It is **grounded**: every answer is built from the real tool catalogue, the FAQ
and the sitemap, and every link it hands out points at a page that actually
exists. It is **scoped**: it answers questions about SmartGen and politely
declines everything else. And it is **safe**: the AI key lives in Cloudflare,
never in the browser.

---

## Architecture

```
Browser                       Cloudflare Worker                Google
┌──────────────────┐          ┌─────────────────────┐          ┌──────────┐
│ assets/js/       │  POST    │ /api/chat           │          │ Gemini   │
│   chatbot.js     │─────────▶│  ├ rate limit       │─────────▶│ 2.0      │
│                  │          │  ├ retrieval        │          │ Flash    │
│ no API key       │◀─────────│  ├ scope gate       │◀─────────│          │
│ ever             │  answer  │  └ id → URL resolve │          └──────────┘
└──────────────────┘  +links  └─────────────────────┘
                                        │
                                        ▼
                              src/knowledge/site-index.js
                              (126 tools · 90 FAQs · 110 pages)
```

### Why the key moved

Earlier versions of `chatbot.js` held a placeholder for a build step to
substitute the Gemini key into. On a static GitHub Pages site that means the
key ships inside a JavaScript file every visitor can download and reuse. There
is no way to hide a key in client-side code — so the model call moved behind
the Worker, where `GEMINI_API_KEY` is a Cloudflare secret.

**Never put an API key in this repository or in GitHub Actions secrets for the
frontend.** See the table in `SEO_AUDIT_TOOL.md` § "Where the API keys live".

---

## How an answer is produced

1. **Rate limit.** 8 messages/minute and 40/hour per visitor, counted in the
   Cloudflare Cache API — no KV writes, so the chatbot cannot exhaust the free
   plan's daily write allowance.

2. **Retrieval.** The question is tokenised (stop words removed, light
   stemming, a synonym map for everyday phrasings like "shrink" → "compress")
   and scored against every tool, FAQ and key page with a field-weighted TF-IDF.

3. **Scope gate.** Genuine SmartGen questions score 69–800 on this corpus;
   off-topic ones top out near 39. Anything below a score of 50, or with less
   than 34% of its words present in the index, is declined **before** any model
   call — which also means off-topic traffic costs nothing.

4. **Shortcuts.** Two kinds of question never reach the model:
   - An exact FAQ match is returned verbatim.
   - "What tools do you have?" gets a generated catalogue tour.

5. **Grounded generation.** Only the retrieved entries go into the prompt. The
   model is told to reference tools **by id**, never to write a URL. The Worker
   then resolves those ids against the real catalogue — an id the model
   invented resolves to nothing and is dropped. This is why the bot cannot
   hallucinate a tool or a link.

6. **Graceful degradation.** If Gemini is down or unconfigured, retrieval alone
   still answers "which tool do I need?" properly. The visitor never sees an
   error where an answer belongs.

---

## Files

| Path | Role |
|---|---|
| `assets/js/chatbot.js` | The widget. No key, no secrets. Calls the Worker. |
| `assets/css/chatbot.css` | Styling, including the source cards and dark mode. |
| `data/faq.json` | 90 policy/general Q&A entries — the human-written knowledge. |
| `assets/js/search-data.js` | The tool catalogue (shared with site search). |
| `scripts/build-chatbot-knowledge.js` | Compiles the two above + sitemap into the Worker's index. |
| `backend/smartgen-platforms/src/knowledge/site-index.js` | Generated. Do not edit. |
| `backend/smartgen-platforms/src/lib/knowledge.js` | Retrieval and grounding. |
| `backend/smartgen-platforms/src/lib/chat.js` | Scope gate, prompt, id resolution. |
| `backend/smartgen-platforms/test/chat.test.js` | 12 tests covering retrieval, scoping and grounding. |

The widget loads **site-wide**, lazily: `assets/js/app.js` injects it once the
browser is idle or on the first interaction, so pages where nobody opens the
chat pay nothing for it at load time.

---

## Keeping the knowledge current

After adding a tool, publishing pages, or editing the FAQ:

```bash
npm run build-chatbot     # regenerates the Worker's index
git add backend/smartgen-platforms/src/knowledge/site-index.js
```

CI fails the build if the index is stale, so this cannot silently drift. It
also runs as part of `npm run build`.

Adding a tool to `assets/js/search-data.js` is enough — the chatbot picks it up
from there, so there is no second catalogue to maintain.

### Adding an FAQ

Append to `data/faq.json`:

```json
{
  "id": 91,
  "category": "Tools",
  "question": "Can I use SmartGen tools offline?",
  "answer": "Most tools run entirely in your browser, so once the page has loaded they keep working without a connection."
}
```

Keep the question phrased the way a visitor would type it — exact matches are
returned verbatim, without a model call, which is both faster and free.

---

## Teaching it new vocabulary

If visitors ask for something using words the catalogue does not contain, add a
synonym in `backend/smartgen-platforms/src/lib/knowledge.js`:

```js
const SYNONYMS = {
  shrink: ['compressor', 'compress'],
  // "make my picture smaller" should find the Image Compressor
};
```

Then add the phrasing to the retrieval test in `test/chat.test.js` so it stays
working.

---

## Tuning the scope gate

`MIN_SCORE` and `MIN_COVERAGE` in `src/lib/chat.js` decide what counts as a
SmartGen question.

- Bot refusing legitimate questions → lower `MIN_SCORE`, or add the phrasing to
  `SITE_INTENT`.
- Bot answering unrelated questions → raise `MIN_SCORE`.

Both directions are covered by tests; run `npm test` after changing them.

---

## Configuration

| Setting | Where | Default |
|---|---|---|
| Worker URL | `window.SMARTGEN_API_BASE` in `assets/js/app.js`; a page `<meta name="smartgen-api">` overrides it | `https://smartgen-platforms.sayadmdbayezidhosan.workers.dev` |
| `CHAT_HOURLY_LIMIT` | `wrangler.toml` `[vars]` | 40 |
| `GEMINI_API_KEY` | **Cloudflare secret** | — |

Without `GEMINI_API_KEY` the assistant still runs in retrieval-only mode: it
matches tools and answers FAQs, it just does not write prose.

---

## Testing

```bash
cd backend/smartgen-platforms && npm test
```

Covers: everyday phrasings resolving to the right tool, ranking, every
retrieved URL being real, off-topic refusal, on-topic rescue, FAQ shortcuts,
oversized input, and the guarantee that nothing outside the catalogue can reach
the prompt.
