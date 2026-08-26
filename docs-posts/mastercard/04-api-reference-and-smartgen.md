---
slug: "mastercard-mpqr-api-reference-smartgen"
title: "Mastercard MPQR Payment and Retrieval API Reference for SmartGen"
description: "Map Mastercard MPQR Payment and Retrieval APIs to SmartGen Worker routes with request fields, environments, status rules, and examples."
order: 5
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


# Mastercard MPQR Payment and Retrieval API Reference for SmartGen

## Environment URLs

| Environment | Base URL | Partner identifier |
|---|---|---|
| Sandbox | `https://sandbox.api.mastercard.com/send/static` | Published sandbox partner ID |
| Mastercard Test Facility (MTF) | `https://sandbox.api.mastercard.com/send` | Mastercard-issued Partner Reference ID |
| Production | `https://api.mastercard.com/send` | Mastercard-issued Partner Reference ID |

The API path is:

```text
/v1/partners/{partnerId}/merchant/transfers/payment
```

The retrieval paths are:

```text
/v1/partners/{partnerId}/merchant/transfers/{transferId}
/v1/partners/{partnerId}/merchant/transfers?ref={transferReference}
```

The Sandbox partner ID is a Mastercard-published test value. Do not use it for MTF or Production.[1][2][3]

## SmartGen’s public Worker routes

| Browser/merchant application route | Method | Worker behavior |
|---|---|---|
| `/api/mastercard/mpqr/payment` | `POST` | Validates amount, creates/sends signed Mastercard Payment API request, returns safe result |
| `/api/mastercard/mpqr/retrieve?transferId=...` | `GET` | Signs and sends Mastercard Retrieval API request by Transfer ID |
| `/api/mastercard/mpqr/retrieve?ref=...` | `GET` | Signs and sends Mastercard Retrieval API request by Transfer Reference |
| `/health` | `GET` | Reports Worker and Mastercard configuration state without secret values |

The browser should call the Worker route, not Mastercard directly. The Worker holds the Consumer Key and private signing key.

## Payment request example

The exact production payload depends on the approved participant role, merchant QR data, account URIs, and Mastercard field specifications. A simplified sandbox shape is:

```json
{
  "merchant_payment_transfer": {
    "payment_type": "P2M",
    "amount": "51.00",
    "currency": "USD",
    "transaction_local_date_time": "2026-08-26T12:00:00.000Z",
    "payment_origination_country": "BGD",
    "sender_account_uri": "pan:SANDBOX_SENDER;exp=2077-08;cvc=123",
    "recipient_account_uri": "pan:SANDBOX_RECIPIENT;exp=2077-08;cvc=123",
    "sender": {
      "first_name": "Sandbox",
      "last_name": "Sender",
      "address": {
        "line1": "Sandbox Test",
        "city": "Dhaka",
        "country": "BGD"
      }
    },
    "recipient": {
      "first_name": "SmartGen",
      "last_name": "Sandbox",
      "merchant_category_code": "5734",
      "address": {
        "line1": "SmartGen Test",
        "city": "Dhaka",
        "country": "BGD"
      }
    },
    "participant": {
      "card_acceptor_name": "SmartGen Sandbox"
    },
    "channel": "KIOSK",
    "device_id": "SMARTGEN-SANDBOX",
    "location": "state:BD",
    "mastercard_assigned_id": "111111",
    "transfer_reference": "SGMPQR_EXAMPLE_001"
  }
}
```

The values marked as sandbox values above are illustrative. Do not use them for a real payment. In a real merchant QR flow, the approved participant supplies the QR payload and the valid receiving-account relationship. Never accept arbitrary recipient account data from an untrusted browser.

## Browser-to-Worker example

```javascript
const response = await fetch(
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/payment",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      amount: "51.00",
      transferReference: "SGMPQR_WEB_001"
    })
  }
);

const data = await response.json();
if (!response.ok || !data.ok) {
  throw new Error(data.error || "Sandbox payment failed");
}

const transfer = data.result?.merchant_transfer;
console.log(transfer?.status, transfer?.id);
```

The browser sends only the amount and internal transfer reference. It does not send the OAuth header or private key.

## Payment response handling

A successful Mastercard response normally contains a `merchant_transfer` resource with fields such as `id`, `transfer_reference`, `status`, `original_status`, `transfer_amount`, `transaction_history`, and provider metadata. SmartGen should normalize the response to a small internal object:

```json
{
  "orderId": "SG_ORDER_001",
  "provider": "mastercard_mpqr",
  "transferReference": "SGMPQR_WEB_001",
  "providerTransferId": "mtrn_example",
  "providerTransactionId": "txn_example",
  "status": "approved",
  "amount": "51.00",
  "currency": "USD",
  "correlationId": "provider-correlation-id",
  "receivedAt": "2026-08-26T12:00:00.000Z"
}
```

Do not copy the entire provider response into a customer receipt. Remove or mask account URIs and personal data first.

## Retrieval examples

Retrieve by transfer ID through SmartGen:

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?transferId=mtrn_EXAMPLE" \
  -H "Accept: application/json"
```

Retrieve by reference through SmartGen:

```bash
curl -sS \
  "https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/api/mastercard/mpqr/retrieve?ref=SGMPQR_WEB_001" \
  -H "Accept: application/json"
```

Mastercard documents retrieval by either the system-generated Transfer ID or the Transfer Reference supplied in the Payment API request.[2]

## Status decision table

| Provider status/result | SmartGen order state | Action |
|---|---|---|
| HTTP 200 and `status=APPROVED` | `approved` | Fulfill only after server-side verification |
| HTTP 200 and `status=PENDING` | `pending` | Retrieve again according to provider policy; do not fulfill yet |
| HTTP 200 and `status=UNKNOWN` | `unknown` | Retrieve and reconcile; do not assume success or failure |
| HTTP 402 with decline reason | `declined` | Show failure; do not fulfill; retain reason safely |
| HTTP 400 validation error | `failed` | Fix request/configuration; do not retry blindly |
| HTTP 500/system error | `unknown` or `retryable` | Use idempotency and retrieval before creating another transfer |
| Network timeout | `unknown` | Retrieve by known reference before retrying payment creation |

## Amount and reference validation

The current SmartGen Worker validates positive amounts with up to two decimal places and validates transfer references using the Mastercard sandbox pattern. Production validation should also enforce the approved currency, merchant limits, decimal precision, country, merchant account, and order total on the server.

Mastercard’s Payment API documentation specifies a unique Transfer Reference ID of 6–40 characters using the permitted safe character set. Generate it server-side or derive it from an immutable internal order ID.[1]

## Error and support evidence

For every provider request, preserve an internal audit record containing:

```text
internal_order_id
provider
endpoint_environment
HTTP_method
HTTP_status
provider_status
transfer_reference
provider_transfer_id
correlation_id
request_started_at
response_received_at
retry_count
```

Do not preserve private keys, OAuth headers, full PANs, CVVs, PINs, OTPs, or unmasked account URIs. The provider correlation ID is useful when contacting Mastercard support.[1][2]

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started"
