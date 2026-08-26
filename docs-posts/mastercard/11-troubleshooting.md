---
slug: "mastercard-mpqr-troubleshooting"
title: "SmartGen Mastercard MPQR Troubleshooting and Support Runbook"
description: "Diagnose Mastercard MPQR OAuth, HTTP, field, CORS, status, retrieval, and deployment failures without exposing credentials."
order: 12
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


# SmartGen Mastercard MPQR Troubleshooting and Support Runbook

## First diagnostic rule

Separate the problem into four layers:

| Layer | Question |
|---|---|
| Browser | Did the page send the request and receive CORS headers? |
| SmartGen Worker | Did the Worker validate and sign the request? |
| Mastercard API | Did Mastercard accept, decline, or reject the request? |
| Partner/settlement | Is the merchant, QR, account, or settlement relationship approved? |

A direct curl request can work while a browser request fails because of CORS. A signed Sandbox request can work while Production fails because the Production partner, key, merchant, or program approval is missing.

## Common symptoms

| Symptom | Likely cause | Safe action |
|---|---|---|
| Browser says Worker unavailable | Missing/incorrect CORS origin, stale page, Worker unreachable | Test `OPTIONS`, reload page, check Worker health |
| HTTP 503 from Worker | Required secret/configuration missing | Check names and environment; never print values |
| Mastercard authentication error | Wrong Consumer Key/key pair, expired key, bad body hash, wrong signature URL | Verify project, key, exact body, method, URL, timestamp; rotate if exposed |
| HTTP 400 invalid input | Missing field, unsupported value, bad account/QR format | Compare against current Mastercard field specification |
| HTTP 402 decline | Sandbox/provider decline scenario | Record reason; do not fulfill; do not retry blindly |
| HTTP 500/system error | Provider simulation or transient error | Retrieve by reference before retrying |
| HTTP 404 retrieval | Unknown Transfer ID/reference or wrong environment | Confirm ID, reference, and endpoint environment |
| Payment approved but no QR image | Direct transfer test or missing approved QR payload | Obtain QR capability from Receiving Institution/partner |
| Sandbox works, MTF fails | MTF not configured, wrong Partner Reference ID, missing approval | Ask Mastercard/sponsor to confirm MTF setup |
| MTF works, Production fails | Production key not activated, wrong endpoint/partner/merchant | Verify Production onboarding and cutover checklist |

## CORS test

```bash
curl -i -X OPTIONS \
  "https://YOUR_WORKER.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

The response should contain the exact allowed origin and the allowed methods. Do not solve a production CORS issue by opening the Worker to every origin.

## OAuth diagnosis

Check these items without printing credentials:

1. The Consumer Key belongs to the same Mastercard project as the public key corresponding to the private signing key.
2. The private key is a valid PKCS#8 PEM value and has not been truncated.
3. The request uses OAuth 1.0a with `RSA-SHA256`.
4. `oauth_body_hash` is the Base64 SHA-256 hash of the exact bytes sent as the request body.
5. The signature base URL has the correct scheme, host, and path and excludes the query string.
6. Query and OAuth parameters are encoded and sorted correctly.
7. The timestamp is current and the nonce is unique.
8. The Authorization header values are percent-encoded correctly.
9. The environment, Consumer Key, Partner ID, and endpoint all belong together.

Do not troubleshoot by switching to OAuth 2.0 unless Mastercard confirms that the current MPQR project and endpoint support it.

## Status uncertainty

If the request times out after submission, do not automatically create another transfer. Keep the internal order in `unknown`, retrieve by Transfer ID if it was returned, otherwise retrieve by Transfer Reference, and escalate after the defined retry window.

## Support evidence

When opening a Mastercard or partner support case, provide:

```text
environment
API family and operation
UTC timestamp
HTTP status
provider status/reason code
Transfer Reference
Transfer ID if returned
correlation-id
sanitized request summary
sanitized response summary
```

Never attach private keys, keystore passwords, OAuth headers, full PANs, CVVs, PINs, OTPs, or unmasked customer data.

## Credential exposure response

If a Consumer Key, private key, keystore password, or OAuth header is exposed:

1. Revoke or rotate the affected Sandbox/MTF/Production key in Mastercard Developers.
2. Create a replacement key pair as instructed by Mastercard.
3. Update only the appropriate Worker secret.
4. Deploy to a non-production environment.
5. Run the signer and API smoke tests.
6. Remove exposed material from local files, downloads, shell history, CI logs, screenshots, and messages.
7. Record the incident and affected environment.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/response-error-codes/ "Mastercard MPQR Response and Error Codes"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API"
