---
slug: "mastercard-mpqr-overview-and-roles"
title: "Mastercard MPQR Overview, Participants, and Money Flow"
description: "Understand Mastercard Merchant Presented QR, participant roles, QR types, payment flow, and SmartGen’s correct sandbox and production position."
order: 2
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


# Mastercard MPQR Overview, Participants, and Money Flow

## What MPQR is

Mastercard Merchant Presented QR is a consumer-initiated mobile payment program. A merchant presents a Mastercard QR code. A consumer uses an eligible payment application to scan or enter the merchant information, confirms the amount, and the consumer’s originating institution or wallet provider initiates the payment.[1]

MPQR is not the same as a generic QR image generator. The QR must contain a valid Mastercard/EMV-compatible payload and must be generated, parsed, and verified within the roles and controls approved for the program.

## The four main participant roles

| Role | Main responsibility | Typical organization |
|---|---|---|
| Receiving Institution | Holds or credits the merchant receiving account and can generate merchant QR codes | Merchant bank, acquirer, or approved processor |
| Originating Institution | Provides the consumer funding/payment application and initiates payments | Consumer bank or eligible financial institution |
| Transaction Originator | Provides a wallet or payment application and initiates payment transfers | Approved wallet provider or payment service |
| Processor | Provides technical processing and connectivity for an approved participant | Bank-owned or Mastercard-approved processor |

Mastercard’s documentation says eligible participants must be Mastercard-licensed financial institutions or sponsored by one, registered and approved for the MPQR program, and compliant with applicable requirements such as KYC.[2]

## Mastercard does not settle funds itself

Mastercard provides the network, data processing, APIs, and program infrastructure. Mastercard does not itself transmit the funds. A licensed financial institution transmits the funds and the Receiving Institution credits the merchant account.[1]

This distinction is important for SmartGen. A successful Mastercard Developers sandbox call proves technical connectivity, not that SmartGen has a settlement account or authorization to receive real customer funds.

## Static QR versus dynamic QR

| QR type | Amount in QR | Typical use | Main control consideration |
|---|---:|---|---|
| Static QR | No | Printed sign, counter display, reusable merchant QR | Consumer enters and confirms amount; stronger merchant/reference matching is important |
| Dynamic QR | Yes | Website checkout, invoice, ticket, one-time order | Generate per order; expire or mark consumed; bind to order and amount |

A static QR can be displayed on a website, printed at a counter, or placed on an invoice. A dynamic QR can be created for a particular transaction and amount. The exact QR payload and field rules must come from the approved participant and Mastercard program documentation.

## End-to-end payment flow

1. The merchant presents a static or dynamic Mastercard QR code and, where applicable, the transaction amount.
2. The consumer scans the QR or enters the Merchant ID if scanning is unavailable.
3. The consumer application parses and verifies the QR payload.
4. The originating institution or transaction originator verifies that the consumer’s funding is available.
5. The originating institution or transaction originator sends a Payment API request to Mastercard.
6. Mastercard routes the payment transaction to the Receiving Institution.
7. The Receiving Institution approves or declines the payment.
8. If approved, the Receiving Institution credits the merchant’s receiving account and notifies the merchant or its processor.
9. Mastercard returns the Payment API result to the originating institution or transaction originator.
10. The consumer application displays the outcome.
11. If the response is `UNKNOWN` or `PENDING`, the originating system retrieves the transfer status through the Retrieval API.[1][3][4]

## SmartGen’s current position

SmartGen’s current Worker is a secure technical sandbox client. It sends a server-side signed request using Mastercard’s published sandbox fixtures and receives a simulated transfer response. It currently acts as neither a live Receiving Institution nor a live Originating Institution/Transaction Originator.

| Current prototype feature | Interpretation |
|---|---|
| Sandbox OAuth 1.0a signing | Technical authentication works |
| Payment API response | Direct sandbox transfer simulation works |
| Retrieval API route | Transfer lookup is implemented |
| Published test account URIs | Test fixtures only, never live merchant accounts |
| Empty `qr_data` in a test response | The current call is not a complete merchant QR issuance flow |
| Public web page | Demonstration interface, not a live merchant checkout |

## The correct business model for SmartGen

For a small technology company, the most practical first model is to provide software and checkout orchestration for an approved bank, processor, acquirer, or Mastercard-sponsored participant. The partner supplies the regulated payment relationship, merchant settlement, QR credentials, and program approval. SmartGen supplies the software, merchant dashboard, order integration, and operational tooling.

The direct-participant model is possible only if Mastercard and the relevant financial/regulatory authorities approve SmartGen’s role, sponsorship, business model, controls, and operating structure. Do not claim direct acquiring, settlement, or payment-gateway authorization based only on Sandbox access.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/ "Mastercard Merchant Presented QR Overview"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/#before-you-start "Mastercard MPQR Before You Start"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API"
[4]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API"
