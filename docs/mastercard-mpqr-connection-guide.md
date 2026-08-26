# SmartGen Mastercard MPQR Connection Guide

**Prepared for SmartGen**  
**Status:** Mastercard sandbox integration working; production onboarding not yet completed.

> **Important:** I am an AI, not a lawyer or a licensed financial adviser. This is a technical and operational working guide, not formal legal, regulatory, or financial advice. Before accepting real customer funds, have a qualified Bangladesh payments lawyer and an approved Mastercard-acquiring or sponsoring institution review the structure.

## 1. What is already complete

SmartGen’s Cloudflare Worker is successfully authenticating with the Mastercard Merchant Presented QR sandbox using server-side OAuth 1.0a with an RSA-SHA256 signature. The public checkout page can create a sandbox transfer, display the response, and retrieve the transfer status. Your screenshot showing `APPROVED` confirms that the technical sandbox request was accepted.

The public payment landing page is now Mastercard-first. bKash has been removed from the active public checkout experience and is on hold. The bKash Worker routes remain in the repository only as inactive future code; they are not advertised as available and have no configured merchant credentials.

The current public test pages are:

| Purpose | URL |
|---|---|
| Mastercard-first payment landing page | https://smartgentools.com/payment-gateway/ |
| Mastercard MPQR sandbox lab | https://smartgentools.com/payment-gateway/mastercard-mpqr.html |
| Worker health endpoint | https://smartgen-bkash-sandbox.sayadmdbayezidhosan.workers.dev/health |

The current test is a **sandbox transfer simulation**. It is not a live Mastercard merchant account, does not charge a real customer, does not settle real funds, and does not by itself authorize SmartGen to operate a payment gateway.

## 2. What the attached OAuth 2.0 document means

The attached document is a general Mastercard platform guide for OAuth 2.0 and FAPI 2.0. It is not a replacement for the authentication requirement of the current MPQR API integration.

Mastercard’s current MPQR API Basics and Getting Started documentation instructs MPQR applications to send an OAuth 1.0a Authorization header. The current SmartGen Worker already implements that protocol correctly. Therefore, **no OAuth 2.0 code or key change is needed now**.

OAuth 2.0 should be considered only if Mastercard explicitly enables it for the specific MPQR project and API environment, and after the project documentation confirms the supported flow. Do not upload an OAuth 2.0 key, change the Worker signer, or replace the current Consumer Key merely because the general OAuth 2.0 guide is available.

## 3. The most important distinction: API success versus merchant access

A successful sandbox response proves that the request format, signature, credentials, endpoint, and sandbox test data are working. It does **not** mean that SmartGen has a production merchant account or that SmartGen can independently receive customer funds.

For MPQR participation, Mastercard identifies eligible participants such as originating institutions, transaction originators, receiving institutions, and processors. Participants must be a Mastercard-licensed financial institution or be sponsored by one, be registered and approved for the MPQR program, and comply with applicable requirements including KYC. Mastercard’s onboarding documentation also refers to regional registration forms and a Mastercard representative.[1]

For a small technology business, the practical first production model is usually to become the software and orchestration layer for an approved bank, processor, payment institution, or other Mastercard-sponsored participant. The second model is to pursue the required approvals and sponsorship for SmartGen to become a direct program participant. The second model is substantially more difficult and should not be assumed from having a Mastercard Developers account.

## 4. How a real MPQR transaction works

The MPQR documentation describes a flow in which the merchant presents a static or dynamic QR code, the consumer’s payment application scans and verifies the QR, and the originating institution’s server calls the Mastercard Payment API with the QR data and amount. If the transaction is approved, the Payment API returns a successful response with `status` equal to `APPROVED`. If the status is `UNKNOWN` or `PENDING`, the application uses the Retrieval API to obtain an updated status.[2][3][4]

The current SmartGen sandbox page is different from that complete merchant flow. It uses published sandbox account fixtures and does not yet receive a real merchant’s QR payload. The sandbox response may therefore have an empty `qr_data` field. That is not an authentication failure; it means the present test is a direct simulated transfer rather than a production merchant QR acceptance flow. The attached Mastercard overview confirms that a receiving institution normally generates the merchant QR, while an originating institution or transaction originator scans, parses, verifies, and submits the QR data to the Payment API.[7] SmartGen’s current sandbox Worker is a technical test client using Mastercard’s published sandbox fixtures; it is not yet a licensed receiving institution, originating institution, wallet provider, or merchant acquirer.

A production-capable flow needs the following provider-issued values and relationships:

| Required item | Who provides it | Where it belongs |
|---|---|---|
| MPQR program approval | Mastercard and sponsoring/licensed participant | Contract and onboarding records |
| Partner Reference ID | Mastercard or sponsoring participant | Cloudflare Worker secret/configuration |
| Merchant/acquirer relationship | Receiving institution or processor | Provider onboarding and settlement agreement |
| Merchant account or settlement account | Bank, processor, or approved participant | Provider-controlled configuration |
| Approved QR payload format | Mastercard program participant or QR service | Server-side payment request |
| Production Consumer Key and signing key | Mastercard project after approval | Cloudflare Worker secrets only |
| Test and production endpoint selection | Mastercard environment | Worker configuration |

Do not use the current sandbox recipient account as a real merchant settlement account. It is only a test fixture. Mastercard does not transmit funds itself; the licensed financial institution in the program transmits and settles the funds. Therefore SmartGen must obtain an approved receiving-institution or processor relationship before promising merchants that they can receive live money.[7]

## 5. QR roles and the next integration boundary

The attached overview makes the next boundary clear. A **static QR** does not contain the transaction amount; the consumer’s payment application enters the amount after scanning. A **dynamic QR** contains transaction-specific information such as the amount and is generated for each purchase. Merchant QR generation belongs to the receiving institution or its approved merchant software, while scanning, parsing, and verification belong to the consumer-facing payment application or its originating institution/transaction originator.[7]

For SmartGen, the next production integration should therefore be one of these two approved models:

| Model | SmartGen responsibility | Required partner capability |
|---|---|---|
| Merchant checkout/orchestration | Create the internal order, display an approved QR payload, call the partner’s payment service, and reconcile the result | Receiving institution or processor supplies merchant onboarding, QR data, settlement, and payment authorization |
| Consumer wallet/originating app | Scan or accept QR data, verify the payload, initiate Payment API calls, and notify the consumer | Mastercard-approved originating institution or transaction-originator status, app certification, and funding-account controls |

SmartGen should not claim that the current sandbox page generates a usable merchant QR. It currently demonstrates the server-side Payment and Retrieval APIs. A real QR flow requires an approved participant to supply the merchant QR payload and the contractual role, settlement account, and certification process.

## 6. Recommended SmartGen architecture

The browser should communicate only with SmartGen’s backend. It should send an internal order ID, amount, currency, provider selection, and a generated reference. It must not send a PAN, CVV, PIN, OTP, private signing key, or Mastercard Consumer Key.

The Worker should validate the order, create a unique provider reference, select the provider adapter, sign the Mastercard request, call the provider, normalize the response, and return a small safe result to the browser. The Worker should also support retrieval by transfer ID and reference. The provider response should be stored server-side only after sensitive fields have been removed or masked.

A production order record should contain at least:

| Field | Purpose |
|---|---|
| `order_id` | SmartGen’s internal immutable order identifier |
| `provider` | For example, `mastercard_mpqr` |
| `amount` and `currency` | Amount requested by the merchant application |
| `transfer_reference` | Unique value sent to Mastercard |
| `provider_transfer_id` | Mastercard-generated transfer ID |
| `provider_transaction_id` | Transaction ID when returned |
| `status` | `pending`, `approved`, `declined`, `unknown`, `failed`, or `refunded` |
| `correlation_id` | Provider support and troubleshooting reference |
| `created_at`, `updated_at` | Audit and reconciliation timestamps |
| `sanitized_provider_response` | Debugging data with account values removed or masked |

The status rule must be strict: only a verified server-side `APPROVED` result may move an order to paid. A browser message, screenshot, redirect, or client-supplied status must never mark an order as paid.

## 7. Required production controls before real money

SmartGen should add server-side order persistence before production. Browser `localStorage` is acceptable for the current demonstration history but is not an order database and can be deleted or altered by the user.

The backend should enforce idempotency. The same order should not create multiple transfers because a user double-clicked, a browser retried, or a network response was lost. Use one immutable order ID and one unique provider transfer reference, then retrieve the existing transfer before creating another one.

The backend should implement an explicit status lifecycle. An approved payment may be fulfilled. A declined payment should not be fulfilled. An unknown or pending payment should remain pending and be retrieved again according to the provider’s rules. Refunds and cancellations should be separate server-authorized operations with an audit record; do not simulate them by changing a browser label.

Logging should record timestamps, order IDs, provider references, status, HTTP status, and correlation IDs, but never private keys, full account URIs, CVV, PIN, OTP, or unmasked card numbers. Production and sandbox credentials must be separate. Production credentials must be stored only as encrypted Worker secrets or an equivalent secrets manager.

An administrator dashboard should show pending payments, approved payments, failed payments, retrieval results, and reconciliation exceptions. Access should require administrator authentication and audit logging. Customers should receive a receipt only after the server verifies the final status.

## 8. Onboarding path for SmartGen

### Step 1: Choose the business model

SmartGen should first decide whether it will be a software platform integrating an already approved payment participant, or whether it intends to become a direct regulated/payment-program participant. For a small business, the partner model is the realistic starting point: SmartGen provides the checkout software and the approved institution provides the payment, acquiring, settlement, and compliance relationship.

### Step 2: Prepare the business file

Prepare SmartGen’s legal business name, ownership details, trade license, tax and banking information, website, product description, expected transaction profile, refund policy, privacy policy, terms of service, customer-support process, fraud controls, and technical architecture. Exact documents depend on the selected sponsor, bank, processor, and regulator.

### Step 3: Contact Mastercard through the correct channel

Use the Mastercard Developers MPQR support path or a Mastercard representative and explain that SmartGen has completed the MPQR sandbox Payment and Retrieval API test but needs production program onboarding through a licensed or sponsored participant. Ask which participant category and sponsor structure applies, which regional registration forms are required, and how SmartGen can obtain an approved Partner Reference ID.

Mastercard’s published MPQR Getting Started guide says that after program registration, the applicant requests Mastercard Test Facility setup, performs attended testing with Mastercard-provided test cases, receives testing acknowledgement, schedules go-live, and then requests production access and production keys.[1]

### Step 4: Move from Sandbox to MTF

Do not change the sandbox code to production immediately. After Mastercard approves the program registration, request MTF setup and use the MTF endpoint and Partner Reference ID provided by Mastercard. MTF is the production-like testing environment. Complete the required attended test cases and retain the test evidence and acknowledgement.

### Step 5: Request production access

After testing is accepted and a go-live date is agreed, request production access in the Mastercard Developers project. Generate or upload the production key as instructed by Mastercard, wait for activation and environment configuration, then place the production Consumer Key and private signing key into new production-only Worker secrets. Never commit them to GitHub or paste them into a chat.

### Step 6: Configure real merchant data

Replace sandbox fixtures only after the receiving institution or approved processor provides the production merchant account, partner identifiers, QR payload rules, settlement instructions, currency/country settings, and transaction limits. This is also when SmartGen’s adapter should stop using the published test sender and recipient account URIs.

### Step 7: Run a controlled go-live

Start with one approved merchant, low limits, manual reconciliation, enhanced monitoring, and a documented rollback procedure. Compare SmartGen order records with provider reports and settlement statements. Expand only after successful reconciliation and support handling.

## 9. Bangladesh regulatory and provider considerations

Bangladesh Bank’s Payment Systems Department states that it issues licenses in the broad categories of Payment Service Provider (PSP) and Payment System Operator (PSO). Its description distinguishes a PSP that facilitates payments directly to customers and settles through a scheduled bank or financial institution from a PSO that operates a settlement system among participants, including examples such as payment gateways and aggregators. Bangladesh Bank also refers to business rationale, risk management, settlement systems, eligibility, and other requirements when considering applications.[5]

That description is a strong reason not to launch SmartGen as an independent public payment gateway merely because the Mastercard sandbox call is successful. Have a qualified Bangladesh payments lawyer or the intended sponsoring institution confirm whether SmartGen’s planned service is software-only, a payment gateway, a payment aggregator, a PSO-related activity, a PSP-related activity, or another structure.

If SmartGen later pursues bKash, bKash’s official business pages distinguish merchant services from online-business solutions and state that online business can include payment gateway, tokenized checkout, subscription payments, instant refunds, direct charges, B2C payout, and APIs. The merchant onboarding page asks for business information including NID, a valid trade license, and a bank account.[6] This remains separate from the currently active Mastercard path.

## 10. What you should do now

1. Keep using the current Mastercard sandbox page only for technical tests. Use a new transfer reference for every payment attempt.
2. Test the Retrieval control with the transfer ID returned by the page and confirm that the status remains consistent with the Payment API response.
3. Rotate the previously exposed Mastercard sandbox credentials. Store the replacement only in Cloudflare Worker secrets.
4. Contact Mastercard MPQR support or a Mastercard-approved sponsoring institution and request the production onboarding path, sponsor requirements, registration forms, Partner Reference ID process, MTF setup, and production approval criteria.
5. Decide whether SmartGen will begin as a software/orchestration provider for an approved participant. This is the recommended path for the current small-business stage.
6. Before any live transaction, add server-side order persistence, idempotency, administrator access control, reconciliation, refunds/cancellations, audit logs, privacy/terms pages, and provider-specific settlement controls.

## 11. Final answer about the attached file

The attached OAuth 2.0 guide is useful background documentation, but it does not require an update to the current SmartGen MPQR code. The current MPQR integration is correctly using OAuth 1.0a. Keep the implementation unchanged unless Mastercard confirms that OAuth 2.0 is supported and required for this specific MPQR project and environment.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard Merchant Presented QR — Getting Started"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard Merchant Presented QR — Payment API"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/ "Mastercard Merchant Presented QR — Retrieval API"
[4]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/use-cases/ "Mastercard Merchant Presented QR — Use Cases"
[5]: https://www.bb.org.bd/en/index.php/financialactivity/paysystems "Bangladesh Bank — Payment and Settlement Systems"
[6]: https://www.bkash.com/en/business/merchant "bKash — Merchant onboarding"
[7]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/ "Mastercard Merchant Presented QR — Overview"
