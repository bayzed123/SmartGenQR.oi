# SmartGen Mastercard MPQR Configuration Template

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


> This file is safe to copy as a starting point. It intentionally contains no Mastercard Consumer Key, private signing key, keystore password, PAN, CVV, or customer data.

## Sandbox configuration

```toml
name = "smartgen-mastercard-sandbox"
main = "workers/bkash-payment-gateway.js"
compatibility_date = "2026-08-26"

[vars]
MASTERCARD_BASE_URL = "https://sandbox.api.mastercard.com/send/static"
MASTERCARD_PARTNER_ID = "ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo"
MASTERCARD_CURRENCY = "USD"
MASTERCARD_PAYMENT_ORIGINATION_COUNTRY = "BGD"
MASTERCARD_CARD_ACCEPTOR_NAME = "SmartGen Sandbox"
MASTERCARD_FUNDING_SOURCE = "DEBIT"
ALLOWED_ORIGINS = "https://smartgentools.com,https://bayzed123.github.io"
FRONTEND_URL = "https://smartgentools.com/payment-gateway/"
# Sandbox compatibility only; these must be enabled for protected Production.
REQUIRE_CLIENT_AUTH = "false"
REQUIRE_ORDER_BINDING = "false"
REQUIRE_IDEMPOTENCY_KEY = "false"
RATE_LIMIT_PER_MINUTE = "15"
```

## Secret commands

Run these commands from a secure terminal. Wrangler prompts for the value; do not add a value after the command.

```bash
npx wrangler secret put MASTERCARD_CONSUMER_KEY
npx wrangler secret put MASTERCARD_SIGNING_KEY_PEM
# Production order service controls only:
# npx wrangler secret put SMARTGEN_CLIENT_API_KEY
# npx wrangler secret put SMARTGEN_ORDER_SIGNING_SECRET
```

## Production configuration shape

Do not fill this with guessed values. Mastercard or the approved sponsor must supply the Production endpoint, Partner Reference ID, merchant/settlement configuration, and production key process.

```toml
[env.production.vars]
MASTERCARD_BASE_URL = "https://api.mastercard.com/send"
MASTERCARD_PARTNER_ID = "<MASTERcard-issued-partner-reference-id>"
MASTERCARD_CURRENCY = "<approved-currency>"
MASTERCARD_PAYMENT_ORIGINATION_COUNTRY = "<approved-country-code>"
MASTERCARD_CARD_ACCEPTOR_NAME = "<approved-merchant-or-platform-name>"
ALLOWED_ORIGINS = "https://smartgentools.com"
FRONTEND_URL = "https://smartgentools.com/payment-gateway/"
REQUIRE_CLIENT_AUTH = "true"
REQUIRE_ORDER_BINDING = "true"
REQUIRE_IDEMPOTENCY_KEY = "true"
RATE_LIMIT_PER_MINUTE = "15"
```

Production secrets must be added to a separate Production Worker environment. Never copy Sandbox secrets into Production.

## Configuration verification

```bash
curl -sS "https://YOUR_WORKER.workers.dev/health"
```

The health response may report whether Mastercard configuration is present, but it must not print secret values.
