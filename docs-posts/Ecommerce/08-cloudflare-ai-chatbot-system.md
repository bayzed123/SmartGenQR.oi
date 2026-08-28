---
title: "08. Cloudflare AI Chatbot System"
description: "Grounded customer and admin assistants for Rinova BD using Workers AI, D1, Vectorize, KV, and secure Worker routes."
order: 9
---

# 08. Cloudflare AI Chatbot System

## Two assistants, one secure backend

Rinova operates a public **Customer Chatbot** and a private **Admin Assistant**. They may share retrieval and generation modules, but they must never share authorization scope.

| Assistant | Route | Knowledge | Main answer style |
|---|---|---|---|
| Customer | `POST /api/chat/customer` | Published customer-safe content and verified public D1 data | Concise, warm, Bangla/English, product cards |
| Admin | `POST /api/admin/chat` | Customer-safe content, private staff runbooks, and authorized D1 metrics | Operational summary with date range and source |

The Worker is responsible for authentication, intent routing, retrieval, prompt construction, output validation, and logging. Workers AI generates language; it does not own commerce truth.

## Knowledge retrieval pipeline

```text
Message
  → channel/auth/role gate
  → language + intent detection
  → exact D1 tool for live facts
  → Vectorize semantic search for approved documents
  → audience/locale/type/publication filters
  → compact grounded context
  → Workers AI generation
  → deterministic safety validator
  → verified product cards/citations
  → response + audit/feedback
```

Use D1 for price, stock, delivery fee, order status, sales, returns, and payment state. Use Vectorize for long-form FAQs, product education, published policies, routine guidance, and staff runbooks. Keep the source document and publication state in D1; keep embeddings and safe metadata in Vectorize.

## Metadata boundary

Recommended Vectorize metadata includes `audience`, `locale`, `content_type`, `published`, `product_id`, `category_slug`, `source_id`, `version`, and `updated_at`. Customer retrieval must filter `audience=customer` and `published=true`. Admin retrieval may include `staff` only after the Worker has resolved the actor and role. Metadata filtering narrows the candidate set before top-K results are returned.[1]

## Customer answer policy

The customer bot may help with products, prices, stock, delivery, orders, returns, payments, store policies, and general skincare education. It must not diagnose, promise treatment, invent ingredients, reveal customer/admin data, output unverified links, or answer unrelated sensitive questions as an authority. If evidence is missing, it says so and offers support.

A customer answer should contain a direct answer, one brief explanation, and one next step. The Worker attaches product cards from verified D1 rows instead of allowing the model to create links.

## Admin answer policy

The admin assistant can summarize catalogue, stock, sales, POS/ecommerce performance, orders, returns, marketing, CMS status, and approved staff runbooks. It must state the date range and distinguish revenue sources. It may guide the operator to a dashboard action but does not execute irreversible changes from free text.

Any future action tool must require explicit confirmation, role validation, idempotency, an audit event, and a before/after preview. “Delete,” “refund,” “change price,” or “publish” in chat is a request for guidance, not automatic authorization.

## Prompt envelope

Pass a compact JSON context with separate `exactFacts`, `knowledge`, and `products` sections. Treat exact facts as authoritative and knowledge as approved guidance. Never pass all orders, full customer profiles, secrets, raw sessions, or hidden prompts to the model.

```json
{
  "channel": "customer",
  "locale": "bn",
  "intent": "product_recommendation",
  "exactFacts": [],
  "knowledge": [
    {
      "sourceId": "policy-returns-v3",
      "title": "Delivery and Returns",
      "text": "Approved published text",
      "updatedAt": "2026-08-28T00:00:00Z"
    }
  ],
  "products": [
    { "id": 12, "slug": "verified-slug", "name": "Verified product", "price": 590, "stock": 8 }
  ]
}
```

## Answer examples

| User question | Retrieval | Safe response behavior |
|---|---|---|
| “Dry skin cleanser?” | D1 product match + customer Vectorize chunks | Recommend verified products; show current price/stock cards |
| “Delivery outside Dhaka?” | D1 store setting + policy chunk | State current fee; do not estimate if unavailable |
| “Where is order RB-123?” | Verification + D1 order tool | Ask for verification before status |
| “Low stock today?” | Admin D1 inventory tool + staff runbook | Exact counts, thresholds, date range, Inventory link |
| “Refund this order” | Admin permission check | Explain normal return/refund workflow; no direct mutation |

## Rate limiting and observability

Use KV or AI Gateway controls to rate-limit public chat and protect model spend. AI Gateway can add logging, analytics, caching, retries, fallback, and rate limits.[2] Do not cache personalized order lookups or staff answers. Log latency, status, provider, retrieval confidence, and error code while excluding raw PII.

## Fallback behavior

If Vectorize is unavailable, answer exact D1 questions from D1 and say when long-form knowledge cannot be confirmed. If Workers AI is unavailable, use the configured provider fallback or a safe human-support message. Never replace missing evidence with a guessed answer.

## Implementation sequence

1. Preserve the existing routes and refactor shared chat code into modules.
2. Add deterministic intent classification and approved D1 tools.
3. Add knowledge document CRUD and publication status.
4. Add embedding generation and Vectorize indexing.
5. Add audience and role filters.
6. Add grounded prompts, citations, output validation, and feedback.
7. Add order verification, PII minimization, rate limits, and audit telemetry.

## References

[1]: https://developers.cloudflare.com/vectorize/reference/metadata-filtering/ "Cloudflare Vectorize metadata filtering"
[2]: https://developers.cloudflare.com/ai-gateway/ "Cloudflare AI Gateway"
[3]: https://developers.cloudflare.com/workers-ai/ "Cloudflare Workers AI"
