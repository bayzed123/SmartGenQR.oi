# SmartGen Mastercard MPQR Configuration Template

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
```

## Secret commands

Run these commands from a secure terminal. Wrangler prompts for the value; do not add a value after the command.

```bash
npx wrangler secret put MASTERCARD_CONSUMER_KEY
npx wrangler secret put MASTERCARD_SIGNING_KEY_PEM
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
```

Production secrets must be added to a separate Production Worker environment. Never copy Sandbox secrets into Production.

## Configuration verification

```bash
curl -sS "https://YOUR_WORKER.workers.dev/health"
```

The health response may report whether Mastercard configuration is present, but it must not print secret values.
