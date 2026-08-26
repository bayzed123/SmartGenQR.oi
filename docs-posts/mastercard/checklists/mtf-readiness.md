# Mastercard MPQR MTF Readiness Checklist

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
