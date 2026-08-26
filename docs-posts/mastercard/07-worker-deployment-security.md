---
slug: "mastercard-mpqr-worker-deployment-security"
title: "SmartGen Cloudflare Worker Deployment and MPQR Security"
description: "Deploy Mastercard MPQR securely in a Cloudflare Worker with secret bindings, CORS, environment separation, validation, logging, and incident response."
order: 8
---

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

Never log:

```text
private signing key
keystore password
OAuth Authorization header
full PAN or account URI
CVV or PIN
OTP
unredacted personal data
```

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

Then run one safe Sandbox payment, retrieve it, inspect logs for secret leakage, and confirm the public page shows the expected result. Do not run a Production payment as a deployment health check without an approved pilot and explicit operational approval.

## Incident response

If a credential is exposed, immediately revoke or rotate it in Mastercard Developers, create a replacement key pair, update the Worker secret, deploy to a test environment, verify a signed request, and then promote the replacement. Preserve only non-sensitive incident evidence. If an order may have been duplicated or status is uncertain, retrieve by the known reference before initiating another payment.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/response-error-codes/ "Mastercard MPQR Response and Error Codes"
