# SmartGen Mastercard MPQR Production Go-Live Checklist

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


> Production must remain disabled until Mastercard, the sponsor/processor, and the relevant business/compliance owners approve the launch.

## Mastercard approval

| Gate | Evidence |
|---|---|
| MPQR participant/sponsor role approved | Written Mastercard or sponsor confirmation |
| Required registration completed | Approved forms and onboarding record |
| MTF testing accepted | Test report and acknowledgement |
| Partner Reference ID received | Official provider record |
| Production access approved | Mastercard Developers project status |
| Production key activated | Activation confirmation |
| Go-live date agreed | Provider/sponsor change record |

## Merchant and settlement

| Gate | Evidence |
|---|---|
| Merchant is onboarded | KYB/KYC and contract record |
| Receiving institution is identified | Bank/processor agreement |
| Settlement account is approved | Provider confirmation |
| QR payload is approved | Static/dynamic QR test evidence |
| Fees and limits are documented | Contract and configuration |
| Refund and dispute ownership is clear | Operating procedure |

## Technical cutover

| Gate | Evidence |
|---|---|
| Production endpoint is configured | Approved configuration record |
| Production Partner Reference ID is configured | Provider-issued value |
| Production Consumer Key is secret | Secret-manager audit |
| Production private key is secret | Secret-manager audit |
| Sandbox fixtures are removed | Code/configuration review |
| Production currency/country/MCC are approved | Provider configuration |
| Order persistence is live | Database health check |
| Idempotency is tested | Duplicate/retry evidence |
| `UNKNOWN`/`PENDING` retrieval is tested | Status test evidence |
| Rate limits and alerts are enabled | Monitoring dashboard |
| Admin access is protected | Access-control review |

## Security and privacy

- [ ] No private keys, Consumer Keys, PANs, CVVs, PINs, or OTPs are in source control.
- [ ] Production and Sandbox secrets are separate.
- [ ] Logs are sanitized and access-controlled.
- [ ] CORS is limited to approved production origins.
- [ ] The browser never calls Mastercard directly.
- [ ] The browser cannot choose an arbitrary merchant or settlement account.
- [ ] Customer and merchant data retention is documented.
- [ ] Credential rotation and incident response are tested.
- [ ] Vulnerability and dependency review is complete.

## Controlled launch

Start with one approved merchant and a low transaction limit. Verify that one real transaction appears consistently in the internal order record, Mastercard/provider response, merchant dashboard, and settlement statement. Keep manual reconciliation active during the pilot. Do not expand merchant access until discrepancies and support cases are resolved.

## Rollback

Define the exact action that disables new payments while preserving retrieval and support access. Keep the last known working version available, and ensure a rollback does not create duplicate payments or change approved records. Assign a technical owner, operations owner, provider contact, and customer-support owner.
