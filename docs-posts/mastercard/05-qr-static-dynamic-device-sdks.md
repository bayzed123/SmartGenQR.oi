---
slug: "mastercard-mpqr-qr-static-dynamic-device-sdks"
title: "Mastercard MPQR QR Codes, Device SDKs, and Merchant Flow"
description: "Understand static and dynamic Mastercard QR codes, Device SDK responsibilities, merchant QR generation, scanning, parsing, and verification."
order: 6
---

# Mastercard MPQR QR Codes, Device SDKs, and Merchant Flow

## Why the current SmartGen test has no QR image

The current SmartGen test calls the Mastercard Payment API with Mastercard-published sandbox account fixtures. It is intentionally a direct server-side transfer simulation. The sandbox result may contain an empty `qr_data` field because SmartGen has not yet received a real merchant QR payload from an approved Receiving Institution.

This does not mean the OAuth or Payment API integration failed. It means the test currently proves Payment API connectivity, not QR issuance, QR scanning, or live merchant settlement.

## QR responsibilities

| Activity | Normal responsible party | SmartGen status |
|---|---|---|
| Register merchant for acceptance | Receiving Institution/acquirer/processor | Requires partner |
| Create merchant static QR | Receiving Institution or approved merchant software | Not yet enabled |
| Create merchant dynamic QR | Receiving Institution or approved merchant software | Not yet enabled |
| Present QR on website/invoice/signage | Merchant application | Can be built after payload is supplied |
| Scan QR | Consumer payment application | Requires wallet/bank app or Device SDK |
| Parse and verify QR | Consumer app/originating institution | Requires approved implementation |
| Call Payment API | Originating Institution/Transaction Originator | Sandbox technical test only |
| Credit merchant account | Receiving Institution | Requires settlement relationship |

Mastercard provides Device SDKs that can support QR generation, scanning, parsing, and verification. The correct SDK and certification path depend on the participant role and use case.[1]

## Static QR flow

A static QR does not include the transaction amount. It can be printed or displayed repeatedly. The consumer scans the QR, the payment application validates the merchant data, the consumer enters the amount, and the consumer confirms the transaction.

Static QR controls should include merchant identity verification, an allowed currency and country, amount limits, duplicate/replay detection, and a clear merchant receipt. A static QR must not be trusted solely because it is visually displayed on a merchant website; the app must parse and verify the payload.

## Dynamic QR flow

A dynamic QR is created for a particular order and can include the amount and order-linked information. It should have a short expiration time and a one-time-use rule. SmartGen should bind the dynamic QR to its internal order ID and expected amount.

A recommended dynamic flow is:

1. SmartGen creates an internal order with `pending` status.
2. An approved participant generates or returns a QR payload tied to the merchant and order.
3. SmartGen displays the QR and amount to the customer.
4. The consumer scans it with an eligible payment application.
5. The originating institution verifies and submits the payment.
6. SmartGen receives or retrieves the provider result.
7. SmartGen marks the order paid only after verified approval.
8. SmartGen expires or consumes the QR after final status.

## QR data handling

QR data is payment input, not a secret credential, but it is still untrusted input. The server must validate length, character set, merchant identity, currency, country, checksum/format, and amount binding according to the Mastercard and EMV specifications. Do not allow a browser to replace the recipient merchant account or route funds to an arbitrary destination.

If SmartGen later accepts QR data from a merchant application, the Worker should receive an internal order ID and approved merchant ID, look up the expected merchant configuration server-side, validate the QR payload, and reject a payload that does not match the registered merchant.

## Device SDK versus Server API

| Layer | Purpose |
|---|---|
| Device SDK | Camera/scanner integration, QR generation, parsing, verification, device interaction |
| Server API | Payment transfer creation, retrieval, provider authentication, status processing |
| Merchant backend | Order, merchant, amount, QR lifecycle, fulfillment, refunds, reconciliation |
| Consumer application | Scan/confirm payment and display customer outcome |
| Receiving Institution | Merchant account, approval, settlement, and merchant onboarding |

SmartGen’s Worker belongs to the server/API layer. It does not replace the consumer wallet or the Receiving Institution.

## QR display safety

Use HTTPS for every checkout page. Display the merchant name, amount, currency, order number, expiration time, and support contact next to a dynamic QR. Prevent clickjacking and frame embedding where appropriate. Do not render untrusted QR text as HTML. Keep the QR image or payload tied to the server-side order.

## Certification and testing boundary

The MPQR program requires participants to test and validate their role and use case. Mastercard’s overview states that Originating Institutions and Transaction Originators submit app certification requests to `mpqr_approvals@mastercard.com`, while Receiving Institutions complete the MPQR M-TIP certification process and submit requests to `QR_RI_Testing@mastercard.com`.[1]

SmartGen should ask the sponsor or approved participant which certification track applies. Do not send certification requests claiming a role that SmartGen has not been approved to perform.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/ "Mastercard Merchant Presented QR Overview"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/device-sdks/ "Mastercard MPQR Device SDKs"
[3]: https://www.emvco.com/emv-technologies/qrcodes/ "EMVCo QR Code Specifications"
