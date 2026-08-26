# SmartGen Mastercard MPQR Examples

## Create a sandbox transfer through SmartGen

```bash
curl -sS -X POST \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment" \
  -H "Origin: https://smartgentools.com" \
  -H "Content-Type: application/json" \
  --data '{"amount":"51.00","transferReference":"SGMPQR_EXAMPLE_001"}'
```

Use a new reference every time. The response should contain `ok: true` and a `result.merchant_transfer` object when the simulated payment is accepted.

## Retrieve by Transfer ID

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?transferId=mtrn_EXAMPLE" \
  -H "Accept: application/json"
```

## Retrieve by Transfer Reference

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?ref=SGMPQR_EXAMPLE_001" \
  -H "Accept: application/json"
```

## Browser request

```javascript
const worker = "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev";
const response = await fetch(`${worker}/api/mastercard/mpqr/payment`, {
  method: "POST",
  headers: { "content-type": "application/json" },
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
  const transfer = payload?.result?.merchant_transfer || {};
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

Only the normalized server-side result should be used for fulfillment. The browser may display it, but the server must remain the source of truth.

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
