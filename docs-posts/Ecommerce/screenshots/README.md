---
title: "Screenshot and Mapping Evidence"
description: "Secret-safe Playwright screenshots and requirement-to-proof mapping for Rinova BD ecommerce."
order: 31
---

# Screenshot and Mapping Evidence

These artifacts document the current public storefront and the intended system maps. The storefront screenshots were captured with Playwright against the public demo URL on 28 August 2026. They are visual evidence of the public surface only; they are not proof that private admin or payment flows are authorized for production.

## Captured screenshots

| Artifact | Viewport | Proof |
|---|---:|---|
| [rinova-storefront-home.png](rinova-storefront-home.png) | 1366px full page | Public home structure, hero/banner, product merchandising, editorial sections, footer, and customer chat entry |
| [rinova-storefront-mobile.png](rinova-storefront-mobile.png) | 390×844 viewport | Mobile responsive header, spacing, content crop, and initial storefront behavior |

## Architecture and behavior maps

| Map | Source | Rendered proof |
|---|---|---|
| System architecture | [architecture.mmd](../diagrams/architecture.mmd) | [architecture.png](../diagrams/architecture.png) |
| Customer order pipeline | [customer-order-pipeline.mmd](../diagrams/customer-order-pipeline.mmd) | [customer-order-pipeline.png](../diagrams/customer-order-pipeline.png) |
| AI chatbot retrieval | [ai-chatbot-retrieval.mmd](../diagrams/ai-chatbot-retrieval.mmd) | [ai-chatbot-retrieval.png](../diagrams/ai-chatbot-retrieval.png) |

## Requirement mapping

| Requirement | Evidence |
|---|---|
| Premium public storefront is reachable | Desktop and mobile screenshots |
| Responsive storefront exists | Mobile screenshot at 390×844 |
| Worker is the application boundary | Architecture map |
| D1 owns commerce state | Architecture and order pipeline maps |
| Checkout recalculates trusted totals | Customer order pipeline map and checkout tests |
| Customer and admin AI scopes are separated | AI chatbot retrieval map and security checklist |
| Product links are server-verified | AI chatbot chapter and customer chatbot tests |
| Admin mutations require audit/confirmation | Admin chapter, security checklist, and go-live checklist |

## Evidence safety

The screenshots were captured without logging into an admin account or submitting a payment. Before committing any future screenshot, inspect the image and ensure that it contains no private dashboard data, customer data, auth state, cookies, secret-bearing URLs, payment references, or signed storage URLs. If a screenshot contains sensitive information, delete it locally, rotate affected credentials if necessary, and do not commit it.

## Reproduce locally

```bash
BASE_URL=https://rinovabd.com npx playwright test tests/storefront-visual.spec.ts --project=chromium-desktop
BASE_URL=https://rinovabd.com npx playwright test tests/storefront-visual.spec.ts --project=chromium-mobile
```

Use a scrubbed staging environment for authenticated screenshots. Never use a production admin session as a reusable Playwright storage state.
