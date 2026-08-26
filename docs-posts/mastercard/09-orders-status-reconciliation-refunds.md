---
slug: "mastercard-mpqr-orders-status-reconciliation-refunds"
title: "SmartGen MPQR Orders, Status, Reconciliation, Refunds, and Disputes"
description: "Build the production payment lifecycle around Mastercard MPQR with server-side orders, idempotency, retrieval, reconciliation, refunds, disputes, and admin review."
order: 10
---

<!-- smartgen-mastercard-navigation -->

## SmartGen Mastercard navigation

Use the links below to move between the SmartGen Mastercard documentation chapters and the live Sandbox Lab. The Lab is for simulated technical testing only; it does not authorize real-money use or live merchant fulfillment.

- [A-to-Z index](/docs/mastercard/)
- [Sandbox Lab](/payment-gateway/mastercard-mpqr.html)
- [Overview and roles](/docs/mastercard/mastercard-mpqr-overview-and-roles/)
- [Account and keys](/docs/mastercard/mastercard-mpqr-account-setup-and-keys/)
- [OAuth 1.0a signing](/docs/mastercard/mastercard-mpqr-oauth1-signing/)
- [Payment and Retrieval API](/docs/mastercard/mastercard-mpqr-api-reference-smartgen/)
- [QR/static/dynamic flow](/docs/mastercard/mastercard-mpqr-qr-static-dynamic-device-sdks/)
- [Sandbox testing](/docs/mastercard/mastercard-mpqr-sandbox-testing/)
- [Worker security](/docs/mastercard/mastercard-mpqr-worker-deployment-security/)
- [Partner and Production onboarding](/docs/mastercard/mastercard-mpqr-partnership-and-production-onboarding/)
- [Orders and reconciliation](/docs/mastercard/mastercard-mpqr-orders-status-reconciliation-refunds/)
- [Bangladesh checklist](/docs/mastercard/mastercard-mpqr-bangladesh-operating-checklist/)
- [Troubleshooting](/docs/mastercard/mastercard-mpqr-troubleshooting/)
- [Security remediation](/docs/mastercard/mastercard-mpqr-security-remediation-status/)
- [MTF checklist](/docs/mastercard/checklists/mtf-readiness/)
- [Production checklist](/docs/mastercard/checklists/production-go-live/)
- [Safe examples](/docs/mastercard/examples/curl-and-worker-examples/)
- [Configuration template](/docs/mastercard/examples/configuration-template/)
- [Official Mastercard MPQR docs](https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/)


# SmartGen MPQR Orders, Status, Reconciliation, Refunds, and Disputes

## Why a provider response is not the whole payment system

The current Sandbox lab creates a transfer and displays the provider response. A production payment platform needs an internal order system around that API call. The order system protects against double charges, lost browser responses, delayed statuses, support disputes, and mismatches between provider records and settlement records.

## Recommended order lifecycle

```text
created
  -> payment_pending
  -> provider_submitted
  -> approved
  -> fulfilled

provider_submitted
  -> pending
  -> unknown
  -> retrieved_approved
  -> retrieved_declined
  -> failed
  -> cancelled

approved
  -> refund_requested
  -> refunded
  -> refund_failed
```

Only a server-side verified approval may move an order to `approved`. A browser redirect, localStorage item, screenshot, or client-provided status must never mark an order as paid.

## Minimum order record

```json
{
  "order_id": "SG_ORDER_20260826_000001",
  "merchant_id": "merchant_001",
  "provider": "mastercard_mpqr",
  "amount": "51.00",
  "currency": "USD",
  "status": "payment_pending",
  "transfer_reference": "SGMPQR_ORDER_000001",
  "provider_transfer_id": null,
  "provider_transaction_id": null,
  "correlation_id": null,
  "qr_type": "dynamic",
  "qr_expires_at": "2026-08-26T12:10:00Z",
  "created_at": "2026-08-26T12:00:00Z",
  "updated_at": "2026-08-26T12:00:00Z"
}
```

Store the expected amount, currency, merchant, and order ID server-side. Compare them with the verified provider response before fulfillment.

## Idempotency strategy

The same order must map to one logical payment attempt unless the platform has an explicit recovery process. Use a unique internal `order_id` and a unique provider `transfer_reference`. Before creating a new transfer, check whether an existing provider transfer ID is already recorded. If the client timed out after the provider accepted the request, retrieve by the known reference before retrying.

Do not use a random reference generated in the browser as the only idempotency control. The browser can be refreshed, duplicated, or manipulated.

## Unknown and pending status

The Mastercard documentation says the Retrieval API can be used when the Payment API result is `UNKNOWN`; a `PENDING` transaction is still in progress and should be retrieved again.[1][2]

Recommended logic:

1. Mark the internal order as `unknown` or `pending` when the provider status is not final.
2. Do not deliver the product or service yet.
3. Retrieve by the known Transfer ID when available.
4. Otherwise retrieve by the unique Transfer Reference.
5. Apply a bounded retry schedule.
6. Escalate to manual review if the status remains unresolved.
7. Fulfill only after verified `APPROVED`.
8. Never create a new transfer until the first attempt is resolved or the provider/sponsor authorizes a recovery procedure.

## Reconciliation

Reconciliation compares three records:

| Record | Source |
|---|---|
| Internal order | SmartGen database |
| Provider transfer | Mastercard Payment/Retrieval API or provider report |
| Settlement movement | Receiving institution/processor settlement statement |

Run reconciliation at least daily during a pilot. Flag cases where the amount, currency, reference, transfer ID, status, settlement date, or merchant does not match. Keep a manual exception queue with a reason, owner, action, and resolution timestamp.

## Admin dashboard

The required administrator view should include:

| Dashboard area | Required capability |
|---|---|
| Pending payments | Quick view, age, amount, reference, retrieval action |
| Approved payments | Order, transfer ID, transaction ID, fulfillment state |
| Declined/failed | Safe reason, retry policy, customer-support action |
| Unknown/pending | Retrieval history and manual review queue |
| Reconciliation | Provider-versus-order-versus-settlement comparison |
| Refunds | Request, approval, provider result, audit trail |
| Disputes | Case ID, evidence, status, response deadline |
| Audit log | Administrator identity, timestamp, action, before/after state |

Protect the dashboard with administrator authentication, least privilege, session controls, and audit logging. Never expose private keys or full payment credentials in the dashboard.

## Refunds and cancellations

The current SmartGen MPQR adapter implements Payment and Retrieval routes, not a production refund endpoint. A live refund process must be designed with the approved provider and sponsor. Do not imitate a refund by changing the internal order status only.

Before launch, document:

```text
who may request a refund
which provider operation performs the refund
whether a refund is full or partial
refund limits and time windows
merchant/customer notification
provider refund reference
settlement timing
failed-refund escalation
```

A customer cancellation before payment should cancel the internal order and expire the QR. A cancellation after an approved payment requires the provider-supported refund or reversal process and an audit record.

## Disputes and customer support

Define a support process for duplicate attempts, pending status, customer claims, incorrect amount, merchant non-delivery, and suspected fraud. Preserve the internal order ID, Transfer Reference, Transfer ID, transaction ID, provider correlation ID, timestamps, and sanitized response. Do not ask customers to send full card data, PIN, OTP, or private credentials.

## Receipts and invoices

Generate a receipt only after verified server-side approval. It should include the merchant name, SmartGen order ID, amount, currency, provider, transfer reference, final status, timestamp, and support contact. Do not include full account identifiers or sensitive authentication data.

If SmartGen sells goods or services, provide an invoice/download option according to the merchant and tax requirements. The invoice must reflect the internal order and verified payment state, not an untrusted browser value.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR Payment API status responses"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard MPQR Retrieval API"
