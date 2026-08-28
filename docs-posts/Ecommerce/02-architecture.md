---
title: "02. Architecture"
description: "Rinova BD Cloudflare edge architecture, service boundaries, bindings, trust zones, and integration rules."
order: 3
---

# 02. Architecture

## Reference architecture

```text
Customer browser ─┐
                  ├─ Cloudflare Worker / Hono ── Static assets from web/
Admin browser ────┘              │
                                 ├─ D1: products, orders, customers, CMS, chat, audit
                                 ├─ KV: cache, rate windows, feature flags
                                 ├─ R2/S3 adapter: product and editorial media
                                 ├─ Workers AI: customer and staff assistant generation
                                 ├─ Vectorize: approved semantic knowledge retrieval
                                 ├─ Payment adapter: server-only payment requests
                                 ├─ Courier adapter: delivery booking/status
                                 └─ Analytics/Sheets adapters: server-only reporting
```

Cloudflare Workers provides the serverless application boundary and bindings to storage, AI, and background capabilities.[1] D1 is the transactional SQL source of truth for commerce and operational state.[2] R2 is the object-storage boundary for large media and should not be replaced by database blobs.[3]

## Service boundary table

| Component | Responsibility | Must not do |
|---|---|---|
| Browser | Render UI, collect input, keep temporary bag state, display server responses | Store secrets, calculate trusted totals, authorize admin actions |
| Worker | Validate input, authenticate, authorize, calculate totals, call providers, return normalized JSON | Trust browser prices, expose provider keys, send full database to AI |
| D1 | Store normalized commerce, account, CMS, chat, and audit state | Store large images or secrets in plain text |
| KV | Cache safe reads, rate-limit windows, short-lived flags | Act as the only source of truth for orders or payments |
| R2/media | Store product, banner, blog, and review media | Publicly expose private objects without signed access |
| Workers AI | Generate grounded explanations and classifications | Decide current price, stock, order state, or permissions |
| Vectorize | Semantic retrieval of approved knowledge chunks | Store private raw customer records or unpublished secret instructions |
| Payment adapter | Call payment provider from Worker, normalize status | Trust client callback or mark an order paid without reconciliation |
| Courier adapter | Create shipment/request status, normalize tracking | Expose provider credential or mutate order without audit |
| Analytics adapter | Send privacy-minimized events/reports | Block checkout when analytics fails |

## Existing Worker bindings

The current configuration includes a D1 binding named `DB`, a KV binding named `CACHE`, a Workers AI binding named `AI`, static assets from `../web`, an optional/adapter-based media path, and observability. The model is selected through a non-secret variable such as `AI_MODEL`. IDs and environment-specific values belong in deployment configuration; secrets belong in secret storage.

Before adding Vectorize, add an environment-specific binding with a placeholder name. Do not copy account IDs, API tokens, signed URLs, or provider credentials into this guide.

## Request boundaries

Public routes may read only published catalogue/content data. Customer routes may read or write only the current customer’s records after verification. Admin routes must resolve the session and role inside the Worker. External provider calls must be server-side and should have timeout, retry, idempotency, and normalized error handling.

## Data ownership

D1 owns order lifecycle, product status, prices, stock, delivery settings, customer records, CMS publication state, chat metadata, and audit events. KV owns ephemeral state. R2 owns media bytes. Vectorize owns searchable embeddings, but D1 owns the document source, publication status, version, and re-indexing status. The Worker decides which source is authoritative for each answer.

## Failure model

The system should degrade gracefully. If analytics fails, checkout remains available. If media fails, a safe placeholder is used. If Vectorize fails, exact D1 answers continue and long-form recommendations ask for support. If Workers AI fails, the chatbot returns a safe fallback. If payment status is ambiguous, the order remains pending/unknown until reconciliation; it is never silently marked paid.

## Architecture references

[1]: https://developers.cloudflare.com/workers/ "Cloudflare Workers"
[2]: https://developers.cloudflare.com/d1/ "Cloudflare D1"
[3]: https://developers.cloudflare.com/r2/ "Cloudflare R2"
[4]: https://developers.cloudflare.com/vectorize/ "Cloudflare Vectorize"
[5]: https://developers.cloudflare.com/workers-ai/ "Cloudflare Workers AI"
