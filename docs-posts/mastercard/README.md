---
slug: "mastercard-mpqr-a-to-z"
title: "SmartGen Mastercard MPQR Sandbox Integration & Payment Orchestration Prototype"
description: "A-to-Z SmartGen developer demo, API lab, partner-onboarding proof, architecture guide, security controls, MTF path, and Production gates for Mastercard MPQR."
order: 1
---

<!-- smartgen-mastercard-navigation -->

## SmartGen Mastercard navigation

Use the links below to move between the SmartGen Mastercard documentation chapters and the live Sandbox Lab. The Lab is for simulated technical testing only; it does not authorize real-money use or live merchant fulfillment.

- [A-to-Z index](/docs/mastercard/)
- [Sandbox Lab](/payment-gateway/mastercard-mpqr.html)
- [Overview and roles](/docs/mastercard/mastercard-mpqr-overview-and-roles/)
- [Account and keys](/docs/mastercard/mastercard-mpqr-account-setup-and-keys/)
- [OAuth 1.0a signing](/docs/mastercard/mastercard-mpqr-oauth1-signing/)
- [Payment and Retrieval API](/docs/mastercard/mastercard-mpqr-api-reference-smartgen/)
- [QR/static/dynamic flow](/docs/mastercard/mastercard-mpqr-qr-static-dynamic-device-sdks/)
- [Sandbox testing](/docs/mastercard/mastercard-mpqr-sandbox-testing/)
- [Worker security](/docs/mastercard/mastercard-mpqr-worker-deployment-security/)
- [Partner and Production onboarding](/docs/mastercard/mastercard-mpqr-partnership-and-production-onboarding/)
- [Orders and reconciliation](/docs/mastercard/mastercard-mpqr-orders-status-reconciliation-refunds/)
- [Bangladesh checklist](/docs/mastercard/mastercard-mpqr-bangladesh-operating-checklist/)
- [Troubleshooting](/docs/mastercard/mastercard-mpqr-troubleshooting/)
- [Security remediation](/docs/mastercard/mastercard-mpqr-security-remediation-status/)
- [MTF checklist](/docs/mastercard/checklists/mtf-readiness/)
- [Production checklist](/docs/mastercard/checklists/production-go-live/)
- [Safe examples](/docs/mastercard/examples/curl-and-worker-examples/)
- [Configuration template](/docs/mastercard/examples/configuration-template/)
- [Official Mastercard MPQR docs](https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/)


# SmartGen Mastercard MPQR Sandbox Integration & Payment Orchestration Prototype

## Read this first

This documentation explains how to build and operate **SmartGen Mastercard MPQR Sandbox Integration & Payment Orchestration Prototype** safely. It covers the current developer demo, API lab, partner-onboarding demonstration, architecture proof, and the steps required before a real-money launch.

> **The current SmartGen integration is a successful sandbox API prototype. It is not a live merchant account, acquiring bank, receiving institution, originating institution, wallet, payment service provider, or independently licensed payment gateway. No real-money use or live merchant fulfillment is permitted.**

## Non-negotiable Production gates

Before any live merchant fulfillment, all three gates must be complete:

1. **Retrieval trust fix:** retrieval must be bound to an authenticated internal order and stored payment attempt. An `APPROVED` status alone is never payment proof.
2. **Durable payment core:** the system must have database-backed order state, durable idempotency, timeout/UNKNOWN recovery, reconciliation, approved refund/reversal operations, and an administrator audit trail.
3. **Regulated launch path:** SmartGen must have an approved sponsor/acquirer/processor, Mastercard MTF/certification/Partner Reference ID, activated Production keys, settlement arrangements, and written Bangladesh operating approval appropriate to the business model.

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
| [01-overview-and-roles.md](/docs/mastercard/mastercard-mpqr-overview-and-roles/) | MPQR concept, participants, money flow, static/dynamic QR, and SmartGen’s correct role |
| [02-account-setup-and-keys.md](/docs/mastercard/mastercard-mpqr-account-setup-and-keys/) | Mastercard Developers project, Sandbox Keys, Consumer Key, PKCS#12, PEM conversion, rotation, and secret storage |
| [03-oauth1-signing.md](/docs/mastercard/mastercard-mpqr-oauth1-signing/) | OAuth 1.0a, RSA-SHA256, body hash, nonce, timestamp, signature base string, and Worker implementation |
| [04-api-reference-and-smartgen.md](/docs/mastercard/mastercard-mpqr-api-reference-smartgen/) | Payment and Retrieval endpoints, request fields, response handling, and SmartGen routes |
| [05-qr-static-dynamic-device-sdks.md](/docs/mastercard/mastercard-mpqr-qr-static-dynamic-device-sdks/) | QR generation/scanning roles, static versus dynamic QR, Device SDK boundary, and why the current test has empty `qr_data` |
| [06-sandbox-testing.md](/docs/mastercard/mastercard-mpqr-sandbox-testing/) | Sandbox setup, safe test cases, approval/decline/error simulations, retrieval, and evidence collection |
| [07-worker-deployment-security.md](/docs/mastercard/mastercard-mpqr-worker-deployment-security/) | Cloudflare Worker deployment, secrets, CORS, environments, logging, and threat controls |
| [08-partnership-and-production-onboarding.md](/docs/mastercard/mastercard-mpqr-partnership-and-production-onboarding/) | Sponsor/partner models, Mastercard registration, MTF, certification, production access, and go-live |
| [09-orders-status-reconciliation-refunds.md](/docs/mastercard/mastercard-mpqr-orders-status-reconciliation-refunds/) | Order lifecycle, idempotency, UNKNOWN/PENDING handling, reconciliation, refunds, disputes, and admin operations |
| [10-bangladesh-operating-checklist.md](/docs/mastercard/mastercard-mpqr-bangladesh-operating-checklist/) | Bangladesh Bank PSP/PSO considerations, business file, compliance questions, and local launch checklist |
| [11-troubleshooting.md](/docs/mastercard/mastercard-mpqr-troubleshooting/) | Common errors, diagnosis, recovery, and support evidence |
| [examples/curl-and-worker-examples.md](/docs/mastercard/examples/curl-and-worker-examples/) | Safe curl examples, browser flow, and response normalization examples |
| [examples/configuration-template.md](/docs/mastercard/examples/configuration-template/) | Non-secret configuration template; no credentials included |
| [checklists/mtf-readiness.md](/docs/mastercard/checklists/mtf-readiness/) | MTF readiness checklist |
| [checklists/production-go-live.md](/docs/mastercard/checklists/production-go-live/) | Production go-live checklist |
| [diagrams/mpqr-flow.mmd](https://github.com/bayzed123/SmartGenQR.oi/blob/main/docs-posts/mastercard/diagrams/mpqr-flow.mmd) | Mermaid architecture and transaction flow |

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
