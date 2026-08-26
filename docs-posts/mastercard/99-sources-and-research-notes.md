# Mastercard MPQR Research Notes

## Official findings confirmed 2026-08-26

The attached Mastercard MPQR overview states that MPQR is a consumer-initiated mobile payment program. Receiving Institutions, such as merchant banks, generate Mastercard QR codes for merchants. Originating Institutions and Transaction Originators, such as consumer banks and wallet providers, add QR scanning functionality, parse and verify QR data, and initiate payments through the server APIs.

MPQR QR codes can be static or dynamic. Static QR codes exclude the transaction amount and the consumer enters the amount in the payment application. Dynamic QR codes include transaction-specific information such as the amount and are generated for each transaction.

The published flow is: merchant presents the QR and amount; consumer scans or enters the Merchant ID; the payment application parses and verifies the QR; the originating institution checks funding; the Payment API request is sent to Mastercard; Mastercard routes the payment to the Receiving Institution; the Receiving Institution approves or declines and credits the merchant account; the originating institution notifies the consumer. If status is UNKNOWN, the Retrieval API can retrieve the latest transfer status.

Mastercard does not transmit funds itself. A licensed Financial Institution transmits the funds and the Receiving Institution credits the merchant account. Mastercard documentation says participants must be licensed or sponsored by a Mastercard-licensed financial institution, registered and approved for the MPQR program, and comply with applicable regulations including KYC.

The official MPQR Getting Started page describes the sequence: create a Sandbox project and keys; test Payment and Retrieval APIs; complete MPQR program registration; request Mastercard Test Facility (MTF) setup; perform attended testing with Mastercard-provided test cases; receive testing acknowledgement; schedule go-live; request Production access; create or upload Production Keys; wait for activation and environment configuration; then validate in Production.

The current MPQR API Basics and support documentation require OAuth 1.0a Authorization headers for MPQR server API calls. The separate OAuth 2.0/FAPI document is general Mastercard platform guidance and is not a reason to replace the current SmartGen OAuth 1.0a implementation.

The Payment API requires a unique Transfer Reference ID of 6–40 characters and returns a system-generated Transfer ID. A 200 response with APPROVED means the payment transaction succeeded; UNKNOWN, PENDING, DECLINE, and system errors require the documented status/retrieval handling. The sandbox supports simulated outcomes by amount, including approval above 50 and selected cent amounts for decline/error testing.

The Retrieval API retrieves by Transfer ID or Transfer Reference. A valid previously used sandbox reference or ID should return the transfer; an unknown value returns a resource-not-found result.

Mastercard provides Device SDKs for QR generation, QR scanning, parsing, and verification. The current SmartGen Worker uses sandbox account fixtures and direct Payment API testing; it does not yet provide an approved merchant QR generation or consumer-wallet scanning capability.

## Repository implications

The A-to-Z docs should clearly separate: (1) the current SmartGen sandbox proof of technical API integration, (2) an approved partner/sponsor model for real merchants, and (3) direct participant status requiring Mastercard and regulatory approval. It should not describe the current Worker as a live acquiring gateway, merchant bank, receiving institution, originating institution, or wallet provider.

## Official sources

- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/
- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/
- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/
- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/
- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/retrieval-api/
- https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/device-sdks/
- https://www.bb.org.bd/en/index.php/financialactivity/paysystems
