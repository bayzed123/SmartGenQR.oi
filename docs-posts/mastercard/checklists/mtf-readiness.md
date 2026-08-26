# Mastercard MPQR MTF Readiness Checklist

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


MTF means Mastercard Test Facility. It is a production-like testing environment configured by Mastercard after the MPQR program and participant path are approved. It is not Sandbox and it is not Production.

## Program and partner

- [ ] SmartGen’s legal entity and business model are documented.
- [ ] SmartGen’s intended MPQR role is confirmed in writing.
- [ ] A Mastercard-licensed sponsor, Receiving Institution, Originating Institution, Transaction Originator, or processor is identified.
- [ ] The sponsor agreement or onboarding route is documented.
- [ ] Mastercard registration requirements and applicable forms are confirmed.
- [ ] The MTF request is accepted by Mastercard.
- [ ] The MTF Partner Reference ID is received.

## Technical setup

- [ ] MTF endpoint is confirmed as `https://sandbox.api.mastercard.com/send` or the endpoint provided by Mastercard.
- [ ] MTF key/environment mapping is confirmed.
- [ ] MTF Worker environment is separate from Sandbox and Production.
- [ ] MTF Consumer Key is stored only as a secret.
- [ ] MTF private signing key is stored only as a secret.
- [ ] OAuth 1.0a RSA-SHA256 signer passes local tests.
- [ ] Exact body hash and Authorization header are verified.
- [ ] CORS allow-list contains only the approved test frontend origins.
- [ ] No secrets or full account data appear in logs.

## QR and merchant flow

- [ ] Sponsor confirms whether SmartGen is providing merchant checkout software, a consumer app, or another role.
- [ ] Static/dynamic QR responsibility is documented.
- [ ] Approved QR payload format is received.
- [ ] Merchant identity, amount, currency, country, and expiration are bound to the internal order.
- [ ] QR parsing/verification path is identified.
- [ ] Device SDK or approved library requirements are confirmed.
- [ ] QR certification/M-TIP or app-certification responsibility is assigned.

## Test evidence

- [ ] Payment approval case passes.
- [ ] Payment decline cases pass.
- [ ] Invalid input cases pass.
- [ ] Unknown/pending retrieval cases pass.
- [ ] Timeout and retry/idempotency case passes.
- [ ] Duplicate-reference case passes.
- [ ] CORS/browser case passes.
- [ ] Provider correlation IDs are recorded without sensitive data.
- [ ] Order state matches provider state.
- [ ] Reconciliation evidence is complete.

## Operational readiness

- [ ] Administrator dashboard can inspect pending/unknown payments.
- [ ] Manual retrieval action exists.
- [ ] Refund/reversal process is documented with the sponsor.
- [ ] Customer support and escalation contacts are known.
- [ ] Incident response and key-rotation plan is tested.
- [ ] Go-live and rollback owners are named.

## Approval gate

Do not request Production access until Mastercard and the sponsor confirm that the MTF test cases are complete and accepted, and that the Production onboarding and go-live path is ready.
