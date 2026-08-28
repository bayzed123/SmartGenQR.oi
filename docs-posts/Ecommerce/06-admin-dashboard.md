---
title: "06. Admin Dashboard"
description: "Rinova BD admin control room, module responsibilities, role permissions, workflow behavior, and operator safety."
order: 7
---

# 06. Admin Dashboard

## Dashboard purpose

The admin dashboard is the private control room for Rinova BD. It should optimize for rapid operational decisions: what needs attention, which orders are blocked, which products need restocking, which content is unpublished, and which integrations need recovery.

Use a persistent sidebar, a clear page title, a date-range control for metrics, a global notifications area, and a private assistant entry point. The dashboard is not the public storefront; do not reuse the storefront’s marketing navigation pattern.

## Recommended navigation

| Section | Primary screens | Operator outcome |
|---|---|---|
| Overview | Revenue, orders, stock, alerts, activity | Understand today’s state quickly |
| Catalogue | Products, categories, media, badges | Keep public catalogue correct |
| Inventory | Stock, thresholds, adjustments, POS | Prevent overselling and stockouts |
| Orders | Pipeline, order detail, payment, courier | Move orders through fulfillment |
| Returns | Requests, decisions, refunds | Resolve customer issues safely |
| Reviews | Moderation, verified status, response | Maintain trustworthy proof |
| Marketing | Offers, banners, newsletter | Manage merchandising and campaigns |
| Content | CMS pages, blog, SEO, media | Publish editorial commerce content |
| Analytics | GA4 summaries, event health, exports | Understand acquisition and behavior |
| AI assistant | Staff chat, sources, feedback | Ask grounded operational questions |
| Settings | Store, delivery, roles, integrations | Manage controlled configuration |
| Audit | Mutations, exports, security events | Investigate and prove changes |

## Overview cards

The first screen should display revenue and order count for a selected range, gross profit when role permits, low-stock count, order pipeline, return status, recent activity, and integration health. Every metric should show its date range and source. Avoid unexplained “live” numbers that mix POS and ecommerce without labelling.

## CRUD behavior

Product and content editors should support draft, preview, publish, archive, and restore. List screens need loading, empty, error, pagination or bounded limits, search, filters, and visible last-updated timestamps. Destructive actions require a confirmation dialog with the entity name and impact. Success and failure should be announced through an accessible toast and reflected in the list.

## Inventory behavior

Inventory adjustments must record quantity before, delta, quantity after, reason, actor, and timestamp. Stock thresholds should be visible. A low-stock item should link directly to the product and adjustment action. Avoid silent bulk changes; bulk operations must show a review screen before commit.

## Order behavior

Order detail should show customer-safe identity, items, server-calculated totals, payment attempt state, delivery state, notes, timeline, and available next actions. The UI must distinguish `pending_payment`, `payment_unknown`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `return_requested`, `returned`, and `refunded`. State-changing actions must be role-checked by the Worker and recorded in audit.

## Admin assistant behavior

The assistant should live beside, not replace, the dashboard. Each answer should show the date range, source type, and a link to the relevant page. It may summarize exact D1 data and approved staff runbooks. It must not execute an irreversible change from free text. If the admin asks “delete,” “refund,” “change price,” or “publish,” the assistant explains the required page and confirmation workflow.

## Role-aware visibility

The server supplies a permission map to the UI for usability, but the Worker remains authoritative. For example, a support role may see order status and return history but not cost price or gross margin. A content editor may edit a blog post but not payment settings. Hidden navigation is not a security control.

## Responsive and accessible behavior

The sidebar collapses into a drawer on small screens. Tables provide horizontal scrolling or a carefully designed card view. Keyboard focus remains visible. Dialogs trap focus and close predictably. Loading states use skeletons for cards and tables; error states preserve retry actions; empty states explain the next useful action.

## Visual language

Use the Rinova premium direction: warm light surfaces, charcoal text, orchid accent `#D77FD9`, restrained borders, strong whitespace, and a dark sidebar only where contrast supports scanning. Accent color should indicate action and hierarchy, not replace readable text. Buttons need visible hover, focus, disabled, loading, and pressed states.
