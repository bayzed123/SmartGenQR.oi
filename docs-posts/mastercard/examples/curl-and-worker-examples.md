# SmartGen Mastercard MPQR Examples

## Create a sandbox transfer through SmartGen

```bash
curl -sS -X POST \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: SGMPQR_EXAMPLE_001" \
  --data '{"amount":"51.00","transferReference":"SGMPQR_EXAMPLE_001"}'
```

Use a new reference every time. The `Idempotency-Key` prevents a repeated request from blindly creating another transfer. The response should contain `ok: true` and a `result.merchant_transfer` object when the simulated payment is accepted. This public request is Sandbox-only compatibility mode; it is not a Production authentication example.

## Retrieval verification (Production pattern)

The public Sandbox retrieval route intentionally rejects unauthenticated lookups with `403` and `state=verification_failed`. This prevents a syntactically acceptable or provider-fixture transfer ID from becoming payment proof. In Production, retrieval must be made by an authenticated order service with a short-lived signed order token containing the server-created order ID and the exact stored provider transfer ID or reference.

```bash
curl -sS \
  "https://YOUR_PROTECTED_WORKER/api/mastercard/mpqr/retrieve?transferId=mtrn_EXAMPLE&orderToken=BASE64URL_PAYLOAD.BASE64URL_HMAC_SIGNATURE" \
  -H "Authorization: Bearer $SMARTGEN_CLIENT_API_KEY" \
  -H "Accept: application/json"
```

For a reference-bound lookup, use the exact stored value and the same signed order token:

```bash
curl -sS \
  "https://YOUR_PROTECTED_WORKER/api/mastercard/mpqr/retrieve?ref=SGMPQR_EXAMPLE_001&orderToken=BASE64URL_PAYLOAD.BASE64URL_HMAC_SIGNATURE" \
  -H "Authorization: Bearer $SMARTGEN_CLIENT_API_KEY" \
  -H "Accept: application/json"
```

A `verified` response requires exact matching of the signed order’s transfer ID/reference, provider transfer ID/reference, expected amount, expected currency, and optional recipient. An `APPROVED` value without those matches is never sufficient for fulfillment.

## Protected server-to-server Production request

Production clients must not be browser pages. After SmartGen has an authenticated order service, enable `REQUIRE_CLIENT_AUTH=true`, `REQUIRE_ORDER_BINDING=true`, and `REQUIRE_IDEMPOTENCY_KEY=true`. The order service sends a short-lived signed `orderToken`; the browser does not choose the amount, currency, merchant, recipient, or provider reference.

```bash
curl -sS -X POST \
  "https://YOUR_PROTECTED_WORKER/api/mastercard/mpqr/payment" \
  -H "Authorization: Bearer $SMARTGEN_CLIENT_API_KEY" \
  -H "Idempotency-Key: SG_ORDER_001" \
  -H "Content-Type: application/json" \
  --data '{"orderToken":"BASE64URL_PAYLOAD.BASE64URL_HMAC_SIGNATURE"}'
```

The API verifies the token using the Worker secret `SMARTGEN_ORDER_SIGNING_SECRET`. Never put either secret in a browser or GitHub source file.

## Browser request

```javascript
const worker = "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev";
const response = await fetch(`${worker}/api/mastercard/mpqr/payment`, {
  method: "POST",
  headers: { "content-type": "application/json", "Idempotency-Key": "SGMPQR_BROWSER_001" },
  body: JSON.stringify({
    amount: "51.00",
    transferReference: "SGMPQR_BROWSER_001"
  })
});

const payload = await response.json();
if (!response.ok || !payload.ok) {
  throw new Error(payload.error || "Mastercard sandbox request failed");
}

const merchantTransfer = payload.result?.merchant_transfer;
const status = merchantTransfer?.status || merchantTransfer?.original_status;
const transferId = merchantTransfer?.id;
console.log({ status, transferId });
```

## Safe response normalization

```javascript
function normalizeMastercardResult(payload, orderId) {
  const direct = payload?.result?.merchant_transfer;
  const list = payload?.result?.merchant_transfers?.data?.merchant_transfer;
  const transfer = (direct && !Array.isArray(direct) ? direct : Array.isArray(list) ? list[0] : null) || {};
  const transaction = transfer?.transaction_history?.data?.transaction?.[0] || {};
  return {
    orderId,
    provider: "mastercard_mpqr",
    transferReference: transfer.transfer_reference || null,
    providerTransferId: transfer.id || null,
    providerTransactionId: transaction.id || null,
    status: String(transfer.status || transfer.original_status || "UNKNOWN").toLowerCase(),
    amount: transfer.transfer_amount?.value || transaction.transaction_amount?.value || null,
    currency: transfer.transfer_amount?.currency || transaction.transaction_amount?.currency || null,
    receivedAt: new Date().toISOString()
  };
}
```

Only the normalized server-side result should be used for fulfillment. The browser may display it, but the server must remain the source of truth. An empty retrieval list is not a successful transfer; treat it as not found and do not fulfill the order.

## Preflight test

```bash
curl -i -X OPTIONS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

Expected headers include:

```text
access-control-allow-origin: https://smartgentools.com
access-control-allow-methods: GET,POST,OPTIONS
```

## Never do this

```javascript
// Do not send credentials or card data from the browser.
fetch("https://sandbox.api.mastercard.com/...", {
  headers: {
    Authorization: "OAuth ...",
    "X-Mastercard-Consumer-Key": "..."
  },
  body: JSON.stringify({ pan: "...", cvc: "..." })
});
```

The browser should not know the Mastercard Consumer Key, signing key, OAuth header, PAN, CVV, PIN, or OTP.
