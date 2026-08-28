---
title: "05. API and Route Reference"
description: "Rinova BD public, customer, admin, media, checkout, CMS, analytics, and chatbot route contract."
order: 6
---

# 05. API and Route Reference

## Route rules

All API routes are served by the Worker under `/api`. Requests are validated server-side. JSON responses should use consistent success and error shapes:

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": "Human-readable message", "code": "VALIDATION_ERROR" }
```

Never return stack traces, provider secrets, SQL statements, session tokens, or internal filesystem paths.

## Public routes

| Route | Method | Auth | Purpose |
|---|---:|---|---|
| `/api/categories` | GET | Public | Active categories |
| `/api/products` | GET | Public | Published product catalogue with safe filters |
| `/api/products/:slug` | GET | Public | Product detail and safe media/review data |
| `/api/content/home` | GET | Public | Published home content and banners |
| `/api/content/:slug` | GET | Public | Published CMS page |
| `/api/blog` | GET | Public | Published editorial listing |
| `/api/blog/:slug` | GET | Public | Published editorial detail |
| `/api/newsletter` | POST | Public, rate-limited | Capture validated newsletter email |
| `/api/analytics/event` | POST | Public, rate-limited | Privacy-minimized event ingestion |
| `/api/chat/customer` | POST | Public, rate-limited | Grounded customer chatbot |

## Customer routes

| Route | Method | Auth | Purpose |
|---|---:|---|---|
| `/api/customer/me` | GET | Customer session | Current customer profile summary |
| `/api/customer/profile` | PATCH | Customer session | Update allowed profile fields |
| `/api/checkout/quote` | POST | Public/customer | Recalculate authoritative totals without creating an order |
| `/api/checkout/order` | POST | Customer/guest policy | Create order from validated lines and server totals |
| `/api/orders/:orderCode` | GET | Verified customer | Safe order detail/status |
| `/api/orders/:orderCode/return` | POST | Verified customer | Submit eligible return request |
| `/api/payment/start` | POST | Order owner/session | Start payment attempt |
| `/api/payment/callback` | POST/GET | Provider verification | Normalize provider callback; never trust redirect alone |
| `/api/courier/status/:orderCode` | GET | Admin or verified customer | Safe tracking status |

## Admin routes

Every admin route resolves the session, actor, and role inside the Worker.

| Area | Examples | Authorization |
|---|---|---|
| Overview | `/api/admin/overview` | Admin |
| Products | `/api/admin/products`, `/api/admin/products/:id` | Manager/editor/owner as appropriate |
| Inventory | `/api/admin/inventory`, `/api/admin/inventory/adjust` | Manager/owner |
| Orders | `/api/admin/orders`, `/api/admin/orders/:id/status` | Support/manager/owner |
| Returns | `/api/admin/returns`, `/api/admin/returns/:id` | Support/manager/owner |
| Reviews | `/api/admin/reviews`, `/api/admin/reviews/:id/status` | Manager/editor/owner |
| Offers | `/api/admin/offers` | Manager/owner |
| Banners | `/api/admin/banners` | Editor/manager/owner |
| CMS/blog | `/api/admin/content`, `/api/admin/blog` | Editor/manager/owner |
| Media | `/api/admin/media`, `/api/media/upload` | Editor/manager/owner |
| Analytics | `/api/admin/analytics/ga4` | Owner/manager |
| Notifications | `/api/admin/notifications` | Admin |
| Assistant | `/api/admin/chat` | Admin; scope-aware |
| Knowledge | `/api/admin/knowledge/*` | Editor/manager/owner |
| Audit | `/api/admin/audit` | Owner/manager |

## Chat route contract

Customer request:

```json
{
  "visitorKey": "opaque-client-key",
  "messages": [
    { "role": "user", "content": "I need a gentle cleanser" }
  ]
}
```

Customer response:

```json
{
  "ok": true,
  "reply": "...",
  "products": [
    { "slug": "verified-slug", "name": "Verified product", "price": 590, "stock": 8 }
  ],
  "citations": [],
  "needsHumanSupport": false,
  "provider": "cloudflare-ai"
}
```

Admin requests use the same message shape but do not accept a client-supplied role or scope. The Worker derives the actor and role from the admin session. A future mutation-capable assistant must use a separate confirmation endpoint rather than executing changes through `/api/admin/chat`.

## Input validation

Validate string length, array length, numeric bounds, enum values, email syntax, slug syntax, quantity limits, date ranges, and content publication status. Use parameterized D1 statements. Reject unknown fields when a route performs a sensitive operation. Normalize errors so provider details are logged server-side but not returned to the browser.

## Caching

Cache only public, published, non-personalized responses. Never cache private order details, admin metrics, payment results, customer profiles, or assistant responses containing private context. Invalidate catalogue/content cache after a successful publication or product mutation.

## Versioning

When a response shape must change, add a versioned route or backward-compatible field. Document the change and update browser callers and Playwright fixtures together.
