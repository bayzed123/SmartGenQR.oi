---
title: "01. Product and System Overview"
description: "Rinova BD ecommerce scope, actors, capabilities, environments, and engineering principles."
order: 2
---

# 01. Product and System Overview

## Purpose

Rinova BD is a beauty and personal-care ecommerce platform for product discovery, product education, shopping, delivery, customer support, and internal operations. The experience has two surfaces: a public storefront for shoppers and a protected admin dashboard for the owner and staff.

The source implementation uses a static frontend in `web/` and a TypeScript Cloudflare Worker in `worker/`. The Worker serves API routes and static assets, while D1 stores commerce and operational records. This is a practical edge-first design: the browser stays lightweight, business rules stay server-side, and the data store remains the authority for current commerce facts.

## Actors and trust levels

| Actor | Surface | Trust level | Main capabilities |
|---|---|---:|---|
| Visitor | Storefront | Untrusted | Browse catalogue, search, bag, public chat, newsletter |
| Verified customer | Account/checkout | Limited | Manage own details, submit order, view own order/support data |
| Support staff | Admin | Privileged | Review customers, orders, returns, and support conversations |
| Manager | Admin | Highly privileged | Manage products, inventory, orders, offers, reviews, banners, content |
| Owner | Admin | Highest | Manage settings, users, integrations, exports, and production controls |
| External provider | Server adapter | Constrained | Payment, courier, analytics, media, or communication operation only |

## Main capabilities

The storefront supports responsive navigation, category browsing, product detail pages, product media, search, filters, a local bag, checkout, order confirmation, account/track pages, CMS pages, blog/editorial content, marketing banners, newsletter capture, and customer chat. The admin area supports dashboard metrics, product and media management, inventory, orders, returns, reviews, offers, banners, CMS/editorial content, analytics, notifications, and a private admin assistant.

## System principles

| Principle | Implementation rule |
|---|---|
| Server is the authority | Prices, stock, order status, delivery fee, discount eligibility, and role permissions are server-checked |
| Public and private are separate | Customer responses and data never inherit admin scope; admin routes authenticate on every request |
| Provider adapters are replaceable | Payment, courier, media, and analytics integrations use isolated server functions |
| Migrations are additive | Schema changes are versioned and reviewed before applying to production |
| Secrets never enter source control | Use Wrangler secrets or the deployment provider’s secret manager |
| Progressive enhancement | The storefront remains useful if chat, analytics, or optional media services fail |
| Evidence-based releases | A release includes functional tests, visual screenshots, logs, and a rollback note |

## Non-goals

The platform is not a general marketplace, medical diagnosis service, financial adviser, or unrestricted autonomous operations agent. Chatbots must not invent product or medical claims. The admin assistant can summarize and guide, but irreversible mutations require the normal UI and explicit confirmation. Payment provider activation and legal/regulatory approval are separate go-live gates.

## Environments

| Environment | Purpose | Data policy |
|---|---|---|
| Local | Development and unit tests | Synthetic or scrubbed fixtures only |
| Preview/staging | Browser and integration testing | Separate database, media, credentials, and payment sandbox |
| Production | Real storefront and operations | Production secrets, backups, monitoring, and change approval |

Never connect local or preview code to production D1, production media buckets, live payment credentials, or private customer exports.

## Definition of done

A feature is complete when its data model, server route, UI states, authorization, error path, tests, visual proof, documentation, and rollback approach are present. A feature is not complete because the happy-path button works in one browser.

## References

[1]: https://developers.cloudflare.com/workers/ "Cloudflare Workers"
[2]: https://developers.cloudflare.com/d1/ "Cloudflare D1"
[3]: https://playwright.dev/docs/test-snapshots "Playwright visual comparisons"
