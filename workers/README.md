# SmartGen bKash Sandbox Payment Gateway

This directory contains a Cloudflare Worker that keeps bKash credentials on the server and exposes a small API for the SmartGen GitHub Pages checkout at `payment-gateway/index.html`.

> **Sandbox only.** The sample payment URL and response supplied for this task are test data. Do not hardcode them, do not reuse their payment ID, and do not commit any bKash username, password, app key, or app secret.

## Payment flow

The browser submits an amount and payer reference to `POST /api/payments/create`. The Worker validates the input, grants or reuses a short-lived bKash access token, creates a unique merchant invoice, and returns only the hosted `bkashURL`. The browser redirects the customer to bKash.

After the hosted page returns to `GET /api/payments/callback`, the Worker reads the provider result and, for a successful provider callback, executes the payment server-side. The result is redirected back to the GitHub Pages checkout. A separate `GET /api/payments/status?paymentId=...` endpoint is provided for a server-side query check.

## Configuration

Copy `wrangler.toml.example` to `wrangler.toml` and replace the base URL with the exact sandbox base URL from bKash onboarding. The user-provided API path is the default configuration. If your bKash account uses the official v1.2.0-beta route family, override the paths with `/tokenized/checkout/token/grant`, `/tokenized/checkout/create`, `/tokenized/checkout/execute`, and the corresponding query path.

Set merchant credentials as secrets:

```bash
npx wrangler secret put BKASH_USERNAME
npx wrangler secret put BKASH_PASSWORD
npx wrangler secret put BKASH_APP_KEY
npx wrangler secret put BKASH_APP_SECRET
```

Deploy the Worker:

```bash
npx wrangler deploy --config workers/wrangler.toml
```

After the first deployment, set `BKASH_CALLBACK_URL` to the public Worker URL plus `/api/payments/callback`, redeploy, and put that Worker URL into `PAYMENT_WORKER_URL` in `payment-gateway/index.html`.

## Local tests

The health endpoint does not contact bKash and is safe to use before credentials are configured:

```bash
curl -sS https://YOUR_WORKER.workers.dev/health
```

The create endpoint requires credentials and a live bKash sandbox base URL:

```bash
curl -sS -X POST https://YOUR_WORKER.workers.dev/api/payments/create \
  -H 'content-type: application/json' \
  -d '{"amount":"4.53","payerReference":"Customer","platform":"https://smartgentools.com"}'
```

A correctly configured response should include a newly generated `paymentId`, a new `bkashURL`, `amount`, `currency`, and `transactionStatus`. A payment ID is single-use for execution and should not be reused after a completed or failed execution.

## Mastercard MPQR sandbox prototype

The Worker also exposes `POST /api/mastercard/mpqr/payment` and `GET /api/mastercard/mpqr/retrieve`. These routes call Mastercard’s Merchant Presented QR Sandbox API using server-side OAuth 1.0a with an RSA-SHA256 signature and request-body hash. The sandbox base URL is `https://sandbox.api.mastercard.com/send/static`, and the documented sandbox partner ID is `ptnr_BEeCrYJHh2BXTXPy_PEtp-8DBOo`.

Create a Mastercard Developers project for the **Mastercard Merchant Presented QR** service, download the sandbox PKCS12 key, and convert or load the private signing key as PKCS#8 PEM for the Worker. Configure the following secrets with Wrangler:

```bash
npx wrangler secret put MASTERCARD_CONSUMER_KEY
npx wrangler secret put MASTERCARD_SIGNING_KEY_PEM
npx wrangler secret put MASTERCARD_TEST_SENDER_ACCOUNT_URI
npx wrangler secret put MASTERCARD_TEST_RECIPIENT_ACCOUNT_URI
```

Create a test transfer:

```bash
curl -sS -X POST https://YOUR_WORKER.workers.dev/api/mastercard/mpqr/payment \
  -H 'content-type: application/json' \
  -d '{"amount":"51.00","transferReference":"SGMPQR_TEST_001"}'
```

The sandbox documentation uses amounts greater than 50 to simulate an `APPROVED` merchant transfer, while selected cent amounts simulate declines or errors. Save the returned transfer `id`, `transfer_reference`, and `correlation-id`, then retrieve it:

```bash
curl -sS "https://YOUR_WORKER.workers.dev/api/mastercard/mpqr/retrieve?transferId=YOUR_TRANSFER_ID"
```

The sandbox is a simulated environment for development and is not evidence that SmartGen is approved to accept live Mastercard payments. Production access requires the appropriate Mastercard program participation, a licensed or sponsored financial institution relationship, and compliance with applicable regulations.

## Security checklist

Credentials are read only from Worker secrets and are never sent to the browser. CORS is limited to `ALLOWED_ORIGINS`; input is validated before bKash requests; merchant invoice numbers are generated server-side; bKash callback results are followed by server-side execution; and payment status is never accepted from a browser-only field as proof of settlement.

The Worker currently uses an in-memory token cache, which is appropriate for a simple sandbox deployment. For high-volume production use, use a durable token store or a carefully designed cache strategy, add idempotency and order persistence, and complete bKash's production onboarding and webhook verification requirements before accepting real money.

## Official references

1. [bKash Developer Portal](https://developer.bka.sh/)
2. [Tokenized Checkout Overview](https://developer.bka.sh/docs/tokenized-checkout-overview)
3. [Grant Token](https://developer.bka.sh/docs/grant-token-3)
4. [Create Payment](https://developer.bka.sh/docs/create-payment-1)
5. [Execute Payment](https://developer.bka.sh/docs/execute-payment-1)
6. [Instant Payment Notification](https://developer.bka.sh/docs/webhooks)
