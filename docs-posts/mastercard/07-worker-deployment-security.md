---
slug: "mastercard-mpqr-worker-deployment-security"
title: "SmartGen Cloudflare Worker Deployment and MPQR Security"
description: "Deploy Mastercard MPQR securely in a Cloudflare Worker with secret bindings, CORS, environment separation, validation, logging, and incident response."
order: 8
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


# SmartGen Cloudflare Worker Deployment and MPQR Security

## Deployment architecture

The public GitHub Pages frontend calls the SmartGen Cloudflare Worker. The Worker calls Mastercard over HTTPS and stores the private signing key in Cloudflare Worker secrets. The browser never calls Mastercard directly and never receives the Consumer Key or private key.

```text
Customer browser
      |
      | HTTPS: amount + internal reference only
      v
SmartGen Cloudflare Worker
      |
      | OAuth 1.0a signed HTTPS request
      v
Mastercard MPQR API
      |
      v
Approved originating/receiving institution and settlement system
```

## Worker secrets

The current Worker expects:

```text
MASTERCARD_CONSUMER_KEY
MASTERCARD_SIGNING_KEY_PEM
```

Store them as Worker secrets:

```bash
npx wrangler secret put MASTERCARD_CONSUMER_KEY
npx wrangler secret put MASTERCARD_SIGNING_KEY_PEM
```

Never put secrets in `wrangler.toml`, `.env` committed to GitHub, HTML, browser JavaScript, issue comments, screenshots, or CI logs. Use a password manager or approved company vault for the original keystore password and backup material.

## Non-secret configuration

These values can be declared as non-secret Worker configuration only when they do not contain credentials:

```toml
[vars]
MASTERCARD_BASE_URL = "https://sandbox.api.mastercard.com/send/static"
MASTERCARD_PARTNER_ID = "ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo"
MASTERCARD_CURRENCY = "USD"
MASTERCARD_PAYMENT_ORIGINATION_COUNTRY = "BGD"
MASTERCARD_CARD_ACCEPTOR_NAME = "SmartGen Sandbox"
ALLOWED_ORIGINS = "https://smartgentools.com,https://bayzed123.github.io"
FRONTEND_URL = "https://smartgentools.com/payment-gateway/"
```

The published sandbox partner ID is for Sandbox only. MTF and Production use Mastercard-issued participant identifiers and environment configuration.

## Environment separation

Use separate Workers or clearly separated environments for Sandbox, MTF, and Production. Each environment should have its own endpoint, partner identifier, account fixtures, Consumer Key, signing key, logs, and alerting policy.

| Environment | Credentials | Endpoint | Data |
|---|---|---|---|
| Sandbox | Sandbox key pair | `sandbox.api.mastercard.com/send/static` | Published test fixtures |
| MTF | Mastercard-configured test access | `sandbox.api.mastercard.com/send` | Mastercard-provided test cases |
| Production | Activated Production key pair | `api.mastercard.com/send` | Approved merchant and settlement data |

Do not switch only the base URL and assume the project is production-ready. Production also requires the approved partner identifier, merchant relationship, QR payload, limits, testing acknowledgement, key activation, and operational controls.

## Optional client authentication and production order binding

The current public Sandbox page intentionally runs with `authMode: sandbox_public` so the technical demo remains usable. That mode is not suitable for Production. When a protected server-to-server client is ready, set `REQUIRE_CLIENT_AUTH=true` and store `SMARTGEN_CLIENT_API_KEY` as a Worker secret. Requests must then use `X-SmartGen-Api-Key` or `Authorization: Bearer ...`. CORS remains useful for browser-origin control, but it is never authentication.

For Production, set `REQUIRE_ORDER_BINDING=true` and store `SMARTGEN_ORDER_SIGNING_SECRET` as a Worker secret. The payment route then accepts a short-lived HMAC-signed `orderToken` containing the server-created `orderId`, approved amount, and transfer reference. Browser-supplied amount and reference values are ignored for the provider request. In a full deployment, the token should be minted only by an authenticated SmartGen order service after looking up the merchant, currency, recipient, and amount in a durable database.

The Worker includes a short-lived in-memory idempotency guard and per-instance rate limiter for Sandbox protection. These controls are not durable and are not sufficient for a multi-instance Production system. Production must use a durable idempotency record, per-user/merchant/order quotas, Cloudflare WAF/bot controls, abuse monitoring, and a provider-approved retry policy. The current health response reports these modes as `authMode`, `orderBinding`, `idempotency`, and `rateLimitPerMinute` without revealing secret values.

The Worker also supports a fail-safe Production order-binding mode. When enabled, it requires a short-lived HMAC-signed `orderToken` and uses the signed server-side amount and transfer reference instead of browser-supplied values. The signing secret is `SMARTGEN_ORDER_SIGNING_SECRET`; the token must be minted by an authenticated order service after a durable database lookup. The current public Sandbox remains in compatibility mode so the demonstration page continues to work.

## CORS configuration

The Worker should allow only known frontend origins. The current SmartGen CORS binding is:

```text
https://smartgentools.com,https://bayzed123.github.io
```

The Worker responds to `OPTIONS` preflight requests and echoes only an origin in the allow-list. For production, remove development origins that are not needed. Keep `Vary: Origin` on responses.

CORS is not authentication. It only controls browser-origin access. The Worker must still validate the request, enforce rate limits, protect credentials, and verify payment status server-side.

## Request validation

The Worker should validate at least:

| Input | Validation |
|---|---|
| Amount | Positive decimal, approved precision, server-side order total match |
| Currency | Allow-list configured for the merchant/provider |
| Transfer reference | Unique, safe characters, provider length limit |
| Order ID | Server-generated or authenticated internal ID |
| Merchant ID | Looked up server-side; never trusted from browser |
| QR data | Length, format, checksum, merchant binding, amount/currency match |
| Origin | Allow-list for browser CORS; not a substitute for user authentication |

Never accept sender/recipient account URIs, PANs, CVVs, or private signing keys from the public checkout page.

## Logging policy

Log only what is necessary to trace and reconcile a payment:

```text
internal_order_id
provider
environment
transfer_reference
provider_transfer_id
provider_transaction_id
status
HTTP_status
correlation_id
request_started_at
response_received_at
retry_count
```

Never log or return to the browser:

```text
private signing key
keystore password
OAuth Authorization header
Consumer Key
full PAN or account URI
CVV or PIN
OTP
unredacted personal data
```

The SmartGen Worker uses an explicit public-response allow-list for Mastercard Payment and Retrieval responses. It returns only safe identifiers, status, amount/currency, timestamps, and masked transaction metadata. It does not forward the raw Mastercard provider payload to the public page. Error responses likewise return a generic safe message and correlation ID without forwarding provider credential/account fields.

If provider responses contain masked account URIs or personal data, store only a sanitized subset. Encrypt sensitive operational records and limit access to authorized administrators.

## Rate limiting and abuse controls

Add per-IP, per-user, per-merchant, and per-order rate limits before production. Reject excessive attempts, invalid references, repeated failures, and suspicious amount patterns. Use a queue or controlled retry path for provider calls rather than allowing arbitrary client retries.

For real merchants, add authentication, merchant-specific API keys or signed requests, webhook verification if supported by the provider, replay protection, and an allow-list of registered merchant origins.

## Deployment verification

After deployment, verify:

```bash
curl -sS https://YOUR_WORKER.workers.dev/health
curl -i -X OPTIONS \
  https://YOUR_WORKER.workers.dev/api/mastercard/mpqr/payment \
  -H 'Origin: https://smartgentools.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Then run one safe Sandbox payment, retrieve it, inspect logs for secret leakage, and confirm the public page shows the expected result. The response must not contain `authorization`, `consumer_key`, `signing_key`, `private_key`, `secret`, `password`, `account_uri`, `pan`, `cvc`, `cvv`, `pin`, or token fields. Do not run a Production payment as a deployment health check without an approved pilot and explicit operational approval.

## Remediation status

| Finding | Current prototype status | Production requirement |
|---|---|---|
| SEC-01 public routes | Sandbox route is rate-limited; optional API-key/Bearer authentication is implemented but disabled for the public demo | Enable authentication, merchant identity, WAF/bot controls, per-user/merchant/order quotas, and abuse monitoring |
| SEC-02 browser amount/reference | Signed order-token mode is implemented but disabled in Sandbox | Enable it with an authenticated order service and durable merchant/order lookup |
| SEC-03 duplicate/retry | In-memory idempotency guard is implemented | Replace with durable idempotency and retrieval-before-retry workflow |
| SEC-04 refund/reversal | Not implemented because the approved provider operation is not available | Implement sponsor/provider refund or reversal endpoint and audit trail |
| SEC-05 headers/CORS | Worker headers and frontend CSP/referrer metadata are implemented; static-host CDN headers remain platform-dependent | Add HSTS, CSP, no-sniffing, no-referrer, and restrictive framing headers at the static-host/CDN layer |
| SEC-06 raw JSON/PII | Worker allow-list and browser-safe technical summary are implemented | Keep the allow-list minimal and retain sanitized data only |
| SEC-07 localStorage | Demo history uses tab-scoped `sessionStorage` with an explicit notice | Remove browser history and use authenticated server history |
| SEC-08 Math.random | Demo reference generation uses Web Crypto randomness | Use immutable server-side order IDs and provider references |
| SEC-09 mixed health schema | Mastercard-first service/provider/environment schema is live; bKash is marked `on_hold` | Add deployment/version metadata from the controlled deployment system if operationally required |
| SEC-10 scans | Secret scan, dependency audit, syntax tests, hardening tests, and full-history high-confidence scan are in CI | Add scheduled dependency review, SAST, Cloudflare audit review, and quarterly key-rotation drills |

The dependency graph now uses maintained `js-yaml` 4.x directly instead of the vulnerable `front-matter`/`gray-matter` wrappers that pulled in `js-yaml` 3.x. The documentation build and payment tests pass after the change.

## Incident response

If a credential is exposed, immediately revoke or rotate it in Mastercard Developers, create a replacement key pair, update the Worker secret, deploy to a test environment, verify a signed request, and then promote the replacement. Preserve only non-sensitive incident evidence. If an order may have been duplicated or status is uncertain, retrieve by the known reference before initiating another payment.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/response-error-codes/ "Mastercard MPQR Response and Error Codes"
