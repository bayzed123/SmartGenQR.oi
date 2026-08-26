---
slug: "mastercard-mpqr-sandbox-testing"
title: "Mastercard MPQR Sandbox Testing and Evidence Guide"
description: "Run safe Mastercard MPQR sandbox tests, simulate approvals and declines, verify retrieval, and collect evidence without using real card data."
order: 7
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


# Mastercard MPQR Sandbox Testing and Evidence Guide

## Sandbox purpose

The Mastercard MPQR Sandbox returns simulated responses. It is designed to validate request construction, OAuth signing, API routing, response parsing, and error handling without moving real funds.[1]

The SmartGen public lab is available at:

```text
https://smartgentools.com/payment-gateway/mastercard-mpqr.html
```

The Worker health endpoint is:

```text
https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/health
```

## Safe test rules

Use only Mastercard-published sandbox fixtures. Never enter a personal card number, a real PAN, CVV, PIN, OTP, bank account, or customer data. Use a unique reference for every attempt. Do not test on a production endpoint.

Sandbox requests can create simulated provider records, so treat every test as an auditable event. Record the date, amount scenario, transfer reference, returned transfer ID, provider status, HTTP status, and correlation ID, but do not publish sensitive account fields.

## Approval test

The current published sandbox behavior approves a valid merchant transfer with an amount greater than 50. The SmartGen page defaults to `51.00` USD for this reason.

Browser steps:

1. Open the SmartGen MPQR sandbox lab.
2. Confirm the health indicator says `Worker online · Mastercard ready`.
3. Leave the amount at `51.00` or enter another amount above 50.
4. Generate a new transfer reference.
5. Select **Create Mastercard sandbox transfer**.
6. Confirm the result shows `APPROVED` and record the Transfer ID.
7. Select **Refresh transfer status**.
8. Confirm Retrieval API status agrees with the Payment API status.

Safe curl example through the Worker:

```bash
curl -sS -X POST \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Content-Type: application/json" \
  --data '{"amount":"51.00","transferReference":"SGMPQR_CLI_001"}'
```

Use a new reference if `SGMPQR_CLI_001` has already been used.

## Simulated decline and error tests

Mastercard’s sandbox documentation lists amount-based test scenarios. Use them only for sandbox validation:

| Test amount | Expected result | What SmartGen must verify |
|---:|---|---|
| `51.00` | HTTP 200 / `APPROVED` | Order becomes paid only after server verification |
| `0.01` | HTTP 402 / decline | Order remains unpaid and decline is recorded |
| `0.02` | HTTP 500 / system error | Do not blindly create a second transfer |
| `0.03` | Delayed response before approval | Timeout and retrieval logic work |
| `0.12` | Decline, refer to issuer | Safe failure message and audit record |
| `0.13` | Decline, lost card | Safe failure message and audit record |
| `0.14` | Decline, stolen card | Safe failure message and audit record |
| `0.15` | Decline, insufficient funds | Safe failure message and audit record |
| `0.16` | Decline, invalid issuer | Safe failure message and audit record |
| `0.17` | Decline, invalid transaction | Safe failure message and audit record |
| `0.18` | Decline, invalid amount | Safe failure message and audit record |
| `0.19` | Decline, invalid card number | Safe failure message and audit record |
| `0.20` | Decline, transactions not permitted | Safe failure message and audit record |
| `0.21` | Decline, duplicate transaction | Idempotency and duplicate handling work |
| `0.49` | Decline, fraud detected | Risk response and support logging work |

The exact response shape and reason-code spelling should be taken from the current Mastercard documentation and observed in the sandbox response. Do not hard-code a successful state based only on the HTTP status.

## Retrieval test

Retrieve by Transfer ID:

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?transferId=mtrn_EXAMPLE" \
  -H "Accept: application/json"
```

Retrieve by Transfer Reference:

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?ref=SGMPQR_CLI_001" \
  -H "Accept: application/json"
```

A previously used valid ID or reference should return a transfer. An unknown value should return a resource-not-found result. SmartGen should show a friendly error to the customer and preserve the provider correlation ID internally.

## CORS and browser verification

For a browser request from SmartGen, the Worker must return the exact allowed origin:

```bash
curl -i -X OPTIONS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

The response should include:

```text
HTTP/2 204
access-control-allow-origin: https://smartgentools.com
access-control-allow-methods: GET,POST,OPTIONS
```

Do not use `Access-Control-Allow-Origin: *` for a credentialed or sensitive production workflow. Allow only the known checkout origins.

## Evidence pack

For each test case, record:

```text
case_name
environment
request_started_at
amount
currency
transfer_reference
HTTP_status
provider_status
provider_transfer_id
provider_transaction_id
correlation_id
retrieval_status
expected_result
observed_result
pass_or_fail
```

Redact or omit PANs, account URIs, private keys, OAuth headers, and personal data. This evidence pack will help during MTF testing, partner review, and production troubleshooting.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API Sandbox Testing"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API Sandbox Testing"
