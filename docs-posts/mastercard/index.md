---
slug: "mastercard-mpqr-a-to-z"
title: "Mastercard Merchant Presented QR: SmartGen A-to-Z Guide"
description: "Complete SmartGen guide for Mastercard MPQR sandbox integration, OAuth 1.0a, QR roles, partner onboarding, MTF, production readiness, security, reconciliation, and Bangladesh operating considerations."
order: 1
---

<!-- smartgen-mastercard-navigation -->

## SmartGen Mastercard navigation

Use the links below to move between the SmartGen Mastercard documentation chapters and the live Sandbox Lab. The Lab is for simulated technical testing only; it does not authorize real-money use or live merchant fulfillment.

- [A-to-Z index](/docs/mastercard-mpqr-a-to-z/)
- [Sandbox Lab](/payment-gateway/mastercard-mpqr.html)
- [Overview and roles](/docs/mastercard/01-overview-and-roles/)
- [Account and keys](/docs/mastercard/02-account-setup-and-keys/)
- [OAuth 1.0a signing](/docs/mastercard/03-oauth1-signing/)
- [Payment and Retrieval API](/docs/mastercard/04-api-reference-and-smartgen/)
- [QR/static/dynamic flow](/docs/mastercard/05-qr-static-dynamic-device-sdks/)
- [Sandbox testing](/docs/mastercard/06-sandbox-testing/)
- [Worker security](/docs/mastercard/07-worker-deployment-security/)
- [Partner and Production onboarding](/docs/mastercard/08-partnership-and-production-onboarding/)
- [Orders and reconciliation](/docs/mastercard/09-orders-status-reconciliation-refunds/)
- [Bangladesh checklist](/docs/mastercard/10-bangladesh-operating-checklist/)
- [Troubleshooting](/docs/mastercard/11-troubleshooting/)
- [Security remediation](/docs/mastercard/12-security-remediation-status/)
- [MTF checklist](/docs/mastercard/checklists/mtf-readiness/)
- [Production checklist](/docs/mastercard/checklists/production-go-live/)
- [Safe examples](/docs/mastercard/examples/curl-and-worker-examples/)
- [Configuration template](/docs/mastercard/examples/configuration-template/)
- [Official Mastercard MPQR docs](https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/)


# Mastercard Merchant Presented QR: SmartGen A-to-Z Guide

## Read this first

This documentation explains how to build and operate SmartGen’s **Mastercard Merchant Presented QR (MPQR)** integration safely. It covers the current sandbox prototype and the steps required before a real-money launch.

> **The current SmartGen integration is a successful sandbox API prototype. It is not a live merchant account, acquiring bank, receiving institution, originating institution, wallet, payment service provider, or independently licensed payment gateway.**

Mastercard’s MPQR program uses licensed financial institutions and approved participants. Mastercard provides APIs, processing, and program infrastructure, but a licensed financial institution transmits and settles funds. SmartGen must obtain the appropriate sponsor, bank, processor, program approval, and regulatory clearance before accepting live customer money.[1]

## Current SmartGen status

| Area | Status |
|---|---|
| Mastercard Developers project | Created |
| MPQR Sandbox API | Working |
| OAuth 1.0a RSA-SHA256 signing | Working in the Cloudflare Worker |
| Payment API | Working; sandbox approval verified |
| Retrieval API | Implemented |
| Public checkout page | Live at https://smartgentools.com/payment-gateway/mastercard-mpqr.html |
| Public page CORS | Configured for SmartGen domains |
| Real merchant QR payload | Not yet available |
| Mastercard Partner Reference ID for MTF/Production | Not yet available |
| MTF approval and certification | Not started |
| Production key and settlement account | Not available |
| bKash | On hold; no merchant/API credentials |

## Documentation map

| File | What it explains |
|---|---|
| [01-overview-and-roles.md](01-overview-and-roles.md) | MPQR concept, participants, money flow, static/dynamic QR, and SmartGen’s correct role |
| [02-account-setup-and-keys.md](02-account-setup-and-keys.md) | Mastercard Developers project, Sandbox Keys, Consumer Key, PKCS#12, PEM conversion, rotation, and secret storage |
| [03-oauth1-signing.md](03-oauth1-signing.md) | OAuth 1.0a, RSA-SHA256, body hash, nonce, timestamp, signature base string, and Worker implementation |
| [04-api-reference-and-smartgen.md](04-api-reference-and-smartgen.md) | Payment and Retrieval endpoints, request fields, response handling, and SmartGen routes |
| [05-qr-static-dynamic-device-sdks.md](05-qr-static-dynamic-device-sdks.md) | QR generation/scanning roles, static versus dynamic QR, Device SDK boundary, and why the current test has empty `qr_data` |
| [06-sandbox-testing.md](06-sandbox-testing.md) | Sandbox setup, safe test cases, approval/decline/error simulations, retrieval, and evidence collection |
| [07-worker-deployment-security.md](07-worker-deployment-security.md) | Cloudflare Worker deployment, secrets, CORS, environments, logging, and threat controls |
| [08-partnership-and-production-onboarding.md](08-partnership-and-production-onboarding.md) | Sponsor/partner models, Mastercard registration, MTF, certification, production access, and go-live |
| [09-orders-status-reconciliation-refunds.md](09-orders-status-reconciliation-refunds.md) | Order lifecycle, idempotency, UNKNOWN/PENDING handling, reconciliation, refunds, disputes, and admin operations |
| [10-bangladesh-operating-checklist.md](10-bangladesh-operating-checklist.md) | Bangladesh Bank PSP/PSO considerations, business file, compliance questions, and local launch checklist |
| [11-troubleshooting.md](11-troubleshooting.md) | Common errors, diagnosis, recovery, and support evidence |
| [examples/curl-and-worker-examples.md](examples/curl-and-worker-examples.md) | Safe curl examples, browser flow, and response normalization examples |
| [examples/configuration-template.md](examples/configuration-template.md) | Non-secret configuration template; no credentials included |
| [checklists/mtf-readiness.md](checklists/mtf-readiness.md) | MTF readiness checklist |
| [checklists/production-go-live.md](checklists/production-go-live.md) | Production go-live checklist |
| [diagrams/mpqr-flow.mmd](diagrams/mpqr-flow.mmd) | Mermaid architecture and transaction flow |

## The correct sequence for SmartGen

1. Continue sandbox testing with the existing OAuth 1.0a Worker.
2. Keep bKash inactive until approved merchant/API credentials are available.
3. Decide whether SmartGen will operate as software for an approved participant or pursue direct participant status.
4. Contact Mastercard MPQR support or an approved sponsor/acquirer/processor.
5. Obtain the correct Mastercard program registration and sponsor approval.
6. Request MTF setup and complete attended test cases.
7. Build server-side order storage, idempotency, reconciliation, refunds, audit logging, and administrator controls.
8. Obtain production approval, production keys, Partner Reference ID, merchant settlement setup, and QR payload capability.
9. Run a controlled pilot with one approved merchant.
10. Launch only after legal, regulatory, provider, security, and reconciliation sign-off.

## What “success” means at each stage

| Stage | Success means |
|---|---|
| Sandbox | The Worker signs requests and receives simulated Payment/Retrieval responses |
| MTF | Mastercard has configured the project and SmartGen passes assigned production-like test cases |
| Partner onboarding | An approved institution accepts SmartGen’s business and technical model and provides the required identifiers and settlement relationship |
| Production readiness | Production keys, partner identifiers, merchant QR payloads, operational controls, and compliance evidence are complete |
| Controlled launch | One approved merchant completes real transactions that reconcile to provider and settlement records |
| Scale | Monitoring, support, refunds, dispute handling, risk controls, and capacity are stable across merchants |

## Official references

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/ "Mastercard Merchant Presented QR Overview"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[4]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API"
[5]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API"
[6]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/device-sdks/ "Mastercard MPQR Device SDKs"
[7]: https://www.bb.org.bd/en/index.php/financialactivity/paysystems "Bangladesh Bank Payment and Settlement Systems"
