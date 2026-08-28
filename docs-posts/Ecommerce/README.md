---
title: "Rinova BD Ecommerce Full-Stack Documentation"
description: "Complete developer, operator, security, deployment, Cloudflare AI, admin dashboard, customer storefront, and Playwright proof documentation for Rinova BD."
order: 1
---

# Rinova BD Ecommerce Full-Stack Documentation

This documentation explains how to build, run, secure, test, deploy, and operate the Rinova BD ecommerce system. The implementation reference is the Rinova BD source repository, while this documentation is published inside the SmartGenQR knowledge repository for the team and future developers.

> **Security promise:** This documentation never contains API keys, passwords, private tokens, secret cookies, private customer data, payment credentials, or production secret values. Use placeholders and secret-manager instructions only.

## Start here

| Chapter | Purpose |
|---|---|
| [01. Product and system overview](01-product-and-system-overview.md) | Scope, roles, capabilities, current implementation, and reading path |
| [02. Architecture](02-architecture.md) | Frontend, Worker, D1, KV, R2/media, AI, payments, analytics, and trust boundaries |
| [03. End-to-end pipeline](03-end-to-end-pipeline.md) | Request-by-request flow from browser to database and back |
| [04. Data model and migrations](04-data-model-and-migrations.md) | Tables, relationships, lifecycle states, and migration discipline |
| [05. API and route reference](05-api-and-route-reference.md) | Public, customer, admin, media, checkout, and assistant routes |
| [06. Admin dashboard](06-admin-dashboard.md) | Operations, catalogue, inventory, orders, marketing, CMS, analytics, and roles |
| [07. Customer storefront](07-customer-storefront.md) | Discovery, product detail, bag, checkout, account, content, and accessibility |
| [08. Cloudflare AI chatbot system](08-cloudflare-ai-chatbot-system.md) | Customer chatbot, private admin assistant, grounding, retrieval, prompts, and guardrails |
| [09. Security and privacy](09-security-and-privacy.md) | Secrets, authentication, authorization, PII, payment safety, CORS, rate limits, and audit |
| [10. Local development and deployment](10-local-development-and-deployment.md) | Prerequisites, Wrangler, D1 migrations, media, environments, and release procedure |
| [11. Playwright testing and screenshot proof](11-playwright-testing-and-screenshot-proof.md) | Functional tests, visual snapshots, mapping, evidence, and CI workflow |
| [12. Operations and observability](12-operations-and-observability.md) | Logs, alerts, backups, reconciliation, support, and incident response |
| [13. Troubleshooting](13-troubleshooting.md) | Common failures and safe recovery steps |
| [Go-live checklist](checklists/go-live.md) | Release gates and sign-off evidence |
| [Security checklist](checklists/security.md) | Pre-release security verification |
| [Architecture map](diagrams/architecture.mmd) | Mermaid source for the system boundary map |
| [Customer order pipeline map](diagrams/customer-order-pipeline.mmd) | Mermaid source for checkout and order transitions |
| [AI chatbot retrieval map](diagrams/ai-chatbot-retrieval.mmd) | Mermaid source for grounded customer/admin chat |

## Visual proof

The documentation builder should use absolute image URLs for binary assets. The public screenshot proof is available here:

![Rinova BD storefront home — desktop Playwright capture](https://smartgentools.com/docs-posts/Ecommerce/screenshots/rinova-storefront-home.png)

![Rinova BD storefront home — mobile Playwright capture](https://smartgentools.com/docs-posts/Ecommerce/screenshots/rinova-storefront-mobile.png)

The editable architecture sources and rendered maps are linked in the navigation above and in the [screenshot and mapping evidence](screenshots/README.md) chapter.

## Public references

| Resource | Link |
|---|---|
| Rinova BD storefront | [https://rinovabd.com](https://rinovabd.com) |
| Rinova BD source repository | [https://github.com/bayzed123/rinovabd.com](https://github.com/bayzed123/rinovabd.com) |
| This documentation folder | [https://github.com/bayzed123/SmartGenQR.oi/tree/main/docs-posts/Ecommerce](https://github.com/bayzed123/SmartGenQR.oi/tree/main/docs-posts/Ecommerce) |
| Playwright documentation | [Visual comparisons](https://playwright.dev/docs/test-snapshots) |

The public links are convenience references. Never place private staging URLs, internal dashboards, admin credentials, screenshot cookies, signed media URLs, or secret-bearing query strings in this repository.

## System identity

Rinova BD is a static-asset storefront served through a Cloudflare Worker. The Worker exposes ecommerce APIs and admin APIs, uses D1 for transactional data, KV for cache/rate-limit style state, R2 or an S3-compatible media path for product assets, Workers AI for assistant responses, and external adapters for payment, courier, Google Sheets, and analytics integrations. The browser receives only public data or data authorized for the current session.

## Recommended reading order

A new developer should read the overview, architecture, pipeline, data model, and deployment chapters first. A frontend developer should then read the storefront and admin chapters. A backend or AI developer should read the API, chatbot, security, and operations chapters. Before merging changes, every contributor should follow the Playwright proof chapter and the appropriate checklist.

## Documentation conventions

All code examples use placeholders such as `YOUR_ACCOUNT_ID`, `YOUR_DATABASE_ID`, or `YOUR_SECRET_NAME`. Replace them locally through a secret manager or Wrangler secret command; do not replace them in committed documentation with real values. Every destructive or production-sensitive operation is marked with a confirmation requirement.
