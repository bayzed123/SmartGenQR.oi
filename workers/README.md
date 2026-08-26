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
