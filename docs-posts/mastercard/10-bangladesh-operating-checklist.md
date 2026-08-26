---
slug: "mastercard-mpqr-bangladesh-operating-checklist"
title: "SmartGen Mastercard MPQR Bangladesh Operating and Compliance Checklist"
description: "Prepare SmartGen’s Bangladesh business, partner, settlement, compliance, and operating file before offering Mastercard MPQR payments."
order: 11
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


# SmartGen Mastercard MPQR Bangladesh Operating and Compliance Checklist

> **This is a working checklist, not formal legal advice. A qualified Bangladesh payments lawyer, bank, sponsor, processor, and regulator should confirm the exact license and business structure before any real-money launch.**

## Bangladesh payment-system boundary

Bangladesh Bank’s Payment Systems Department states that it issues licenses in the broad categories of **Payment Service Provider (PSP)** and **Payment System Operator (PSO)**. Its published description distinguishes a PSP that facilitates payments directly to customers and settles through a scheduled bank or financial institution from a PSO that operates a settlement system among participants, including examples such as payment gateways and aggregators.[1]

The exact classification depends on SmartGen’s actual activities, contracts, fund flow, merchant relationships, and technology. Do not assume that calling the product “software” removes all payment obligations.

## Choose the legal operating model

| Model | SmartGen handles | Licensed/approved partner handles |
|---|---|---|
| Software provider | Software, checkout, dashboard, integrations, support tooling | Payment service, merchant acceptance, settlement, regulated controls |
| Partner-orchestrated platform | Merchant-facing orchestration under partner contract | Merchant onboarding, funds, QR issuance, provider approval, settlement |
| Direct payment participant | Approved payment role and its associated operations | Sponsor/financial institution support and Mastercard approval |
| Independent payment gateway | Gateway/aggregation and possibly settlement-related activity | Must be reviewed for licensing, approval, sponsorship, and regulatory obligations |

For SmartGen’s current size and status, the partner-orchestrated model is the most practical starting point. The partner should confirm which functions SmartGen may perform and which must remain with the licensed entity.

## Business-readiness file

Prepare these materials before approaching a bank, processor, sponsor, or Mastercard representative:

| File | Contents |
|---|---|
| Company identity | Registered name, founder/owners, address, incorporation/business information |
| Bangladesh business documents | Trade license, tax/business documents, bank account evidence, identity documents as requested |
| Website and product | SmartGen URLs, product screenshots, customer journey, support contact |
| Business model | Who pays SmartGen, merchant pricing, expected volume, refund model |
| Payment flow | Source of funds, receiving account, settlement path, merchant payout model |
| Merchant model | Target merchants, KYC/KYB process, prohibited categories, risk review |
| Technology | Frontend, Worker/API, secrets, environments, logs, access control |
| Security | Key management, incident response, data retention, vulnerability process |
| Operations | Reconciliation, support, dispute handling, refund workflow, monitoring |
| Policies | Terms, privacy notice, refund/cancellation, acceptable use, complaints |
| Financial forecast | Expected monthly volume, average amount, peak amount, currencies, countries |

The sponsor may request additional audited, financial, technical, or ownership information.

## Questions for the sponsor or partner

Ask the intended bank, processor, acquirer, wallet provider, or Mastercard-sponsored participant:

1. Which legal entity is the merchant of record or payment-service provider?
2. Which entity holds or settles merchant funds?
3. Which entity onboards and verifies merchants?
4. Can the partner sponsor SmartGen for MPQR, or only provide a separate payment service?
5. Who generates static and dynamic merchant QR payloads?
6. Who owns the merchant account and Partner Reference ID?
7. Which currencies and merchant categories are supported?
8. What are transaction, refund, and settlement limits?
9. What are the fees, chargeback/dispute rules, settlement cycle, and reserve requirements?
10. Which MTF test cases and certification steps apply to SmartGen?
11. What data may SmartGen store, for how long, and in which country/region?
12. What support SLA and incident-escalation path applies?

Get the answers in a written agreement or official onboarding document.

## Customer and merchant protection

Before production, SmartGen should publish clear terms and show the merchant/customer:

```text
merchant identity
amount and currency
order/reference
payment status
support contact
refund/cancellation rules
privacy notice
complaint process
```

Use server-side verification before delivering a product or service. Do not ask a customer to share a PIN, OTP, CVV, or full card number with SmartGen support.

## Data minimization

Store only the data needed to operate, reconcile, support, and comply with the service. Mask account URIs and payment identifiers where possible. Define access roles, retention periods, deletion procedures, breach response, and export procedures. Do not store authentication secrets in GitHub or the public website.

## Launch approval gate

SmartGen should not enable real payments until all relevant owners sign off:

| Owner | Sign-off |
|---|---|
| Mastercard/sponsor | Program role, Partner Reference ID, MTF/Production approval |
| Bank/processor | Merchant acceptance, settlement, refund, dispute, limits |
| Legal/compliance | Business model, licensing, contracts, policies, KYC/KYB |
| Security | Key storage, access control, logging, incident response |
| Engineering | Idempotency, status handling, tests, rollback |
| Operations | Reconciliation, support, monitoring, exception queue |
| Merchant pilot | Approved merchant, QR, amount, settlement, customer flow |

## References

[1]: https://www.bb.org.bd/en/index.php/financialactivity/paysystems "Bangladesh Bank Payment and Settlement Systems"
[2]: https://www.bb.org.bd/en/index.php/about/guidelist "Bangladesh Bank Regulations and Guidelines"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR eligibility and onboarding"
