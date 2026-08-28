---
title: "03. End-to-End Pipeline"
description: "Detailed request and data pipelines for catalogue, checkout, orders, fulfillment, support, and admin operations."
order: 4
---

# 03. End-to-End Pipeline

## 1. Page and catalogue pipeline

1. The browser requests the storefront static assets.
2. The Worker serves the HTML, CSS, and JavaScript from the configured assets directory.
3. The browser calls the public catalogue endpoints.
4. The Worker validates query parameters, reads published products/categories/content from D1, and may return safe cached responses.
5. The browser renders cards, filters, product media, prices, and stock labels.
6. Analytics events are sent asynchronously and never block the page or checkout.

## 2. Product detail pipeline

The browser requests a product slug. The Worker resolves the active product, category, media, badges, reviews, and related products. The response contains only fields intended for public display. Product price and stock are rechecked on the server during checkout; the detail page is not a reservation.

## 3. Bag pipeline

The current bag may be kept in browser storage for convenience, but the server must treat it as untrusted input. At checkout the browser sends product identifiers and quantities. The Worker loads current D1 prices, active status, stock, offers, and delivery settings; calculates the authoritative subtotal, discount, delivery fee, and total; then creates an order or payment attempt.

```text
Untrusted bag lines
      ↓
Validate product IDs and quantity limits
      ↓
Read current active products from D1
      ↓
Check stock and purchase rules
      ↓
Resolve offer eligibility and delivery area
      ↓
Calculate subtotal, discount, fee, total
      ↓
Persist order + order items + idempotency key
      ↓
Start payment or COD workflow
```

## 4. Order pipeline

Use an explicit lifecycle rather than a single boolean:

| Stage | Meaning |
|---|---|
| `draft` | Checkout has not been finalized |
| `pending_payment` | Payment attempt started or awaiting customer action |
| `payment_unknown` | Provider result is ambiguous and needs reconciliation |
| `confirmed` | Order accepted and payment/COD rules passed |
| `processing` | Admin is preparing the package |
| `shipped` | Courier handoff completed |
| `delivered` | Delivery confirmed |
| `cancelled` | Order cancelled before completion |
| `return_requested` | Customer requested a return |
| `returned` | Returned item received/accepted |
| `refunded` | Approved refund completed |

Every transition should record actor, timestamp, previous state, new state, reason, provider reference where applicable, and idempotency key. The customer can see a safe subset of this state; the admin sees operational details according to role.

## 5. Payment pipeline

Payment requests originate only on the Worker. The browser never supplies an amount that the provider should trust. The Worker creates a provider request from the authoritative order total, stores the attempt, sends an idempotency key, and normalizes the provider response. A callback or retrieval response is matched to the internal order and stored attempt. An approved provider response alone is not proof if it cannot be tied to the internal order.

When the provider is unavailable, the order remains pending or unknown. The system must not decrement stock twice, create duplicate orders, or mark the order paid based only on a client redirect.

## 6. Fulfillment pipeline

After confirmation, the admin dashboard exposes the pick/pack state. A courier adapter can create a shipment and store a normalized tracking reference. Courier calls are retried safely and are recorded in an integration log. Customer notifications contain only the order code and delivery information needed for support.

## 7. Return and refund pipeline

A customer submits a return request with order identity and reason. The Worker checks eligibility against D1 policy and order state. Staff reviews the request. If approved, the system records the decision and next action. Refunds are initiated only through an explicit authorized operation and remain linked to the original payment attempt. Every refund or rejection is audited.

## 8. Chatbot pipeline

The customer and admin chat routes share generation code but not authorization scope. The Worker classifies intent, retrieves exact D1 facts when needed, retrieves approved knowledge, filters by audience and role, generates a response with Workers AI, validates the output, attaches verified product cards, and stores the turn. See [08. Cloudflare AI chatbot system](08-cloudflare-ai-chatbot-system.md).

## 9. Admin mutation pipeline

A dashboard mutation follows this sequence:

```text
Admin session → role check → validate input → D1 transaction
      → audit event → cache invalidation → normalized response
      → browser toast/table refresh → Playwright proof
```

A UI permission check is helpful for usability, but the Worker must repeat the permission check. Critical operations require confirmation and should show the before/after summary.
