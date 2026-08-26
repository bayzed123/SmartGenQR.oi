# bKash Sandbox Research Notes

## Official sources reviewed

- Official developer portal: https://developer.bka.sh/
- Tokenized Checkout overview: https://developer.bka.sh/docs/tokenized-checkout-overview

## Findings

The bKash developer portal documents Checkout, Tokenized Checkout, Auth & Capture, Instant Payout, and Webhooks. The Tokenized Checkout overview describes a hosted payment experience and a two-step model: customers first create an agreement to receive an Agreement ID, then future payments can use that token for a simplified flow.

The official docs navigation exposes token-management and payment endpoints for Tokenized Checkout, including Grant Token, Refresh Token, Create Agreement, Execute Agreement, Query Agreement, Create Payment, Execute Payment, Query Payment, Search Transaction, Refund Transaction, and Refund Status. The implementation must keep bKash credentials server-side and must not trust a client-provided payment status without server-side verification.

The user supplied a sandbox hosted payment URL and a sample Create Payment request/response. The sample includes amount 4.53 BDT, intent authorization, currency BDT, merchant invoice number, callback URLs, and a bKash hosted URL. The provided URL contains a paymentId and signature-like hash and is treated as test data only; it must not be hardcoded as a production credential or reused for new payments.

## Sandbox reachability check

The user-supplied hosted sandbox URL was opened in the browser. It returned an empty gray page with no detectable interactive controls or rendered payment form, so reachability of the URL was confirmed but a sandbox customer payment could not be completed from this session. No credentials, wallet PIN, or payment action was submitted.
