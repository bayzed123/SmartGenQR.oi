---
slug: "mastercard-mpqr-partnership-and-production-onboarding"
title: "Mastercard MPQR Partnership, Sponsorship, MTF, and Production Onboarding"
description: "Follow the real Mastercard MPQR path from Sandbox to approved partner, Mastercard Test Facility, certification, Production access, and controlled go-live."
order: 9
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


# Mastercard MPQR Partnership, Sponsorship, MTF, and Production Onboarding

## The central requirement

Mastercard MPQR is a program for approved participants, not an open public payment API that any developer account can turn into a live acquiring service. Mastercard identifies Receiving Institutions, Originating Institutions, Transaction Originators, and Processors as participant categories. Participants must be licensed by Mastercard or sponsored by a Mastercard-licensed financial institution, registered and approved for the MPQR program, and compliant with applicable regulations including KYC.[1]

For SmartGen, the most realistic first path is to partner with an approved bank, acquirer, processor, wallet provider, or payment institution. SmartGen can provide the software and orchestration layer while the approved participant provides the regulated payment relationship, merchant onboarding, QR capability, settlement, and program controls.

## Two possible partnership models

| Model | SmartGen does | Partner does | Difficulty |
|---|---|---|---|
| Software/orchestration partner | Checkout UI, merchant dashboard, order system, API integration, reconciliation tools | Licensed participant status, merchant account, QR issuance, settlement, compliance | Recommended first path |
| Direct MPQR participant | Payment application or merchant-side service under an approved participant role | Sponsor/financial institution and Mastercard program approval | Requires formal approval and certification |

Do not describe SmartGen as a Mastercard acquirer, merchant bank, wallet, originating institution, receiving institution, or licensed payment gateway until the relevant organization formally approves that role.

## What to prepare before contacting partners

Prepare a concise partner pack:

| Document | Contents |
|---|---|
| Company profile | SmartGen legal entity, owners, address, website, contact person |
| Product overview | What SmartGen sells, who pays, countries/currencies, expected volume |
| Technical architecture | GitHub Pages frontend, Cloudflare Worker backend, secrets, logging, status flow |
| Security summary | OAuth signing location, data minimization, access control, incident response |
| Merchant model | Who the merchants are, onboarding process, KYC/KYB plan, settlement model |
| Customer flow | Static/dynamic QR, payment confirmation, pending/unknown handling |
| Operations plan | Reconciliation, support, refunds, disputes, monitoring, escalation |
| Policies | Terms, privacy notice, refund/cancellation policy, acceptable-use policy |
| Business documents | Trade license, bank account, tax/business registration, identity documents as requested |

The exact document list comes from the sponsor, bank, processor, Mastercard, and applicable regulator. Do not assume that a developer account replaces business onboarding.

## Partner outreach message

Use a clear message such as:

```text
Subject: SmartGen request for Mastercard Merchant Presented QR sponsorship/onboarding

Hello,

SmartGen is a Bangladesh-based technology business building a secure payment-orchestration platform. We have completed the Mastercard Merchant Presented QR Sandbox Payment API and Retrieval API tests using server-side OAuth 1.0a signing.

We are seeking the correct approved partner/sponsor path for a software platform serving merchants. Please advise:

1. Which MPQR participant or partner model applies to SmartGen.
2. Whether your organization can provide acquiring/receiving-institution or processor sponsorship.
3. Required Mastercard registration forms and business documents.
4. Merchant onboarding and settlement-account requirements.
5. Partner Reference ID and Mastercard Test Facility setup process.
6. Required QR generation, scanning, parsing, verification, and certification steps.
7. Production key activation and go-live requirements.

We will not use the Sandbox fixtures for real funds and will not request Production access until the program and regulatory requirements are approved.

Regards,
SmartGen
```

Send this through Mastercard’s official Contact Sales/Support route or to an approved institution. Do not send private keys, passwords, Consumer Keys, or full test credentials in the first outreach message.

## Mastercard’s Sandbox-to-Production sequence

Mastercard’s published Getting Started flow is:

1. Create the MPQR Sandbox project and keys.
2. Test Payment and Retrieval APIs without Mastercard assistance.
3. Complete the MPQR program registration process and submit the applicable forms.
4. Request setup in the Mastercard Test Facility (MTF).
5. Use Sandbox keys in MTF if instructed, or create the approved replacement keys.
6. Perform attended testing using test cases supplied by Mastercard.
7. Receive testing acknowledgement after validation.
8. Agree on a go-live date.
9. Request Production access in the Mastercard Developers project.
10. Create or upload the Production key according to Mastercard instructions.
11. Wait for key activation and Production environment configuration.
12. Replace Sandbox endpoint, Partner ID, account fixtures, and secrets with approved Production values.
13. Run controlled Production validation and begin the approved pilot.[2]

## Mastercard Test Facility (MTF)

MTF is the production-like Mastercard test environment. It is not the same as Sandbox and is not real-money Production. Mastercard configures MTF for the approved project and provides test cases.

Before MTF, obtain written confirmation of:

```text
MTF endpoint
Partner Reference ID
key/environment mapping
approved merchant/QR test data
test cases
expected response scenarios
support contact
attendance/certification process
```

Do not assume the Sandbox partner ID works in MTF. The MPQR documentation states that MTF and Production use the Partner Reference ID supplied after program registration.[2][3]

## Certification boundaries

The participant’s role determines certification. The MPQR overview states that Originating Institutions and Transaction Originators submit app certification requests for evaluation, while Receiving Institutions complete the MPQR M-TIP certification process for QR conformance and functionality.[1]

Ask the sponsor which certification path applies to SmartGen’s exact role. If SmartGen only supplies software for a sponsor, the sponsor may own the certification submission while SmartGen supplies technical evidence.

## Production key process

When Mastercard approves Production access, follow the project-specific instructions. Generate or upload the Production key, store the private key only in the Production Worker secret manager, and keep the Sandbox key in a separate environment. Wait for activation and configuration before testing.

A safe cutover plan is:

1. Deploy the Production Worker code without enabling public checkout.
2. Add Production secrets using the approved secret mechanism.
3. Verify configuration without printing secrets.
4. Run a signed non-customer validation only if Mastercard and the sponsor authorize it.
5. Create one controlled pilot merchant/order.
6. Reconcile the provider result and settlement report.
7. Enable the public flow for the pilot.
8. Monitor, document, and expand gradually.

## Partner questions SmartGen must answer

| Question | Required answer |
|---|---|
| Who is the merchant of record? | Legal entity approved by the provider |
| Who holds customer/merchant funds? | Licensed institution and settlement account |
| Who owns the QR? | Receiving Institution or approved merchant service |
| Who initiates the payment? | Approved originating institution or transaction originator |
| Who performs KYC/KYB? | Defined partner/compliance owner |
| Who handles refunds? | Contractual provider/merchant responsibility |
| Who handles disputes? | Defined provider and merchant support path |
| What is SmartGen’s fee? | Contractually documented, regulator/provider approved where applicable |
| Where is data stored? | Approved systems with retention and access policy |
| What happens on UNKNOWN? | Retrieval/reconciliation policy before fulfillment |

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/ "Mastercard MPQR Overview and certification roles"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/getting-started/ "Mastercard MPQR Getting Started and Production onboarding"
[3]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-reference/payment-api/ "Mastercard MPQR environment and Partner ID requirements"
