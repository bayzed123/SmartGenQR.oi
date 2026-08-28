---
title: "07. Customer Storefront"
description: "Rinova BD customer-facing ecommerce experience, page behavior, checkout rules, accessibility, and support entry points."
order: 8
---

# 07. Customer Storefront

## Storefront experience

The storefront should feel premium but useful: editorial imagery introduces the brand, category and search tools reduce friction, product detail pages explain the product honestly, and checkout remains direct. Public pages should not expose admin navigation, internal IDs, raw provider errors, or unpublished content.

## Page map

| Page | Required behavior |
|---|---|
| Home | Hero/banner, categories, featured products, editorial modules, newsletter, chat |
| Category/search | Query, category filter, sort, stock state, empty result guidance |
| Product detail | Gallery, price, stock, description, usage, reviews, related products, add to bag |
| Bag | Quantity controls, remove, subtotal preview, delivery note, checkout CTA |
| Checkout | Customer details, delivery area, authoritative quote, payment/COD option, consent |
| Confirmation | Order code, next steps, support link, no sensitive provider details |
| Account/track | Own orders and profile only after session/verification |
| Blog/CMS | Published editorial content, safe media, SEO metadata |
| Customer chat | Public support, verified product cards, escalation to WhatsApp/support |

## Product detail rules

A product page must distinguish current price, compare-at price, availability, badges, and editorial claims. Ingredients, usage, skin-type guidance, and benefits should come from approved product fields or published knowledge. The page should not imply medical treatment or clinical proof that is not documented. Reviews should show verified status only when the server has verified the purchase relationship.

## Checkout rules

The browser may submit product IDs and quantities but never controls the trusted amount. The Worker recalculates product prices, discounts, delivery fees, and totals from D1. Checkout should display a clear quote state, validation errors next to fields, a disabled submit state while processing, and a recoverable error when the provider is unavailable.

Do not clear a bag before the order is confirmed or safely persisted. Do not show “paid” based only on a client redirect. If payment is ambiguous, show a pending/verification message and provide the order code/support path.

## Search and recommendation behavior

Search should return exact name/category matches first, then semantic or editorial matches when available. Filters should preserve the query, show active filter chips, and offer a clear-all action. Customer chatbot recommendations must use the same verified product records as the storefront, so the card price, image, stock, and link cannot disagree with the product page.

## Banner and media behavior

Hero media must have a focal point, responsive crop, meaningful alternative text, and a safe placeholder. Do not store large assets in source-control frontend directories when the production architecture expects R2/media storage. A broken image should not collapse layout. Marketing banners must respect active dates, placement, and category targeting.

## Customer chat behavior

The chat launcher remains accessible without obscuring checkout controls. Show a clear loading state, support retry, preserve conversation context, and provide escalation when the answer is unavailable. The bot should answer in Bangla for Bangla messages and English for English messages. It should not output invented links; the Worker attaches verified product cards.

## Accessibility

Interactive controls need labels, visible focus, keyboard reachability, adequate contrast, and meaningful error text. Dialogs and drawers need focus management. Images need useful alternative text unless decorative. Reduced-motion users should not receive non-essential animation. Use the [WCAG 2.2 reference](https://www.w3.org/TR/WCAG22/) when reviewing the UI.

## Performance

Use responsive images, lazy loading below the fold, bounded catalogue payloads, cached public reads, and graceful fallback content. Keep third-party scripts non-blocking. Do not delay first render on analytics or chat initialization.
