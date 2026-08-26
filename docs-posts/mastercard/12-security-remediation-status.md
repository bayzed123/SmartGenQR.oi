---
slug: "mastercard-mpqr-security-remediation-status"
title: "SmartGen Mastercard MPQR Security Remediation Status"
description: "Track SEC-01 through SEC-10 remediation for the SmartGen Mastercard MPQR sandbox prototype and the remaining Production controls."
order: 13
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


# SmartGen Mastercard MPQR Security Remediation Status

## Scope and audit boundary

This status records the remediation work for the security findings supplied to SmartGen. The public HTML, public JavaScript, relevant Worker source, configuration examples, CI workflows, and live API response surface were reviewed. No populated private RSA key, OAuth Authorization header, Consumer Key value, keystore password, CVV, PIN, OTP, or full payment credential was found in the inspected public surface or changed repository files.

This is not a forensic guarantee about every historical Git object, Cloudflare secret value, CI artifact, browser history item, local download, screenshot, or external password manager. Previously exposed credentials must still be rotated independently.

## Finding status

| ID | Severity | Current remediation | Production requirement |
|---|---|---|---|
| SEC-01 | High | Sandbox Mastercard routes now have a per-instance rate limiter. Optional `REQUIRE_CLIENT_AUTH` supports `X-SmartGen-Api-Key` or `Authorization: Bearer ...`. CORS remains origin control only. | Enable authenticated merchant/server-to-server access, durable per-IP/user/merchant/order quotas, Cloudflare WAF/bot controls, abuse monitoring, and provider-approved limits. |
| SEC-02 | High | `REQUIRE_ORDER_BINDING` mode is implemented. It verifies a short-lived HMAC-signed `orderToken` and uses the signed amount/reference instead of browser values. | Mint tokens only from an authenticated order service after durable database lookup of merchant, currency, recipient, and amount. |
| SEC-03 | High | A short-lived in-memory idempotency guard and retrieval-before-retry design are documented. | Replace memory with a durable idempotency record and provider-aware retry/retrieval workflow. |
| SEC-11 | Critical for fulfillment | The public retrieval route now fails closed with `verification_failed` unless protected order-binding mode is enabled. In protected mode, the signed order must match the requested transfer ID/reference and the returned provider transfer ID/reference, amount, currency, and optional recipient. | Keep retrieval behind authenticated order context and durable stored-order matching. Never fulfill from `status=APPROVED` alone. Treat unmatched, empty, or inconsistent results as `verification_failed` or `manual_review`. |
| SEC-04 | High | No fake refund operation was added. Internal status changes are not treated as refunds. | Connect the sponsor/provider’s approved refund or reversal operation and store an auditable refund reference. |
| SEC-05 | Medium | Worker responses send HSTS, no-sniffing, no-framing, no-referrer, CSP, and restrictive CORS headers. Public payment HTML has CSP and no-referrer metadata. | Add equivalent HTTP response headers at the static-host/CDN layer; remove wildcard static CORS if the hosting/CDN configuration permits it. |
| SEC-06 | Medium | Mastercard Payment/Retrieval responses use an explicit server allow-list. Browser technical output is reduced to safe status, amount, reference, IDs, and correlation metadata. | Keep provider data server-side and persist only the minimum sanitized fields. |
| SEC-07 | Medium | Sandbox history uses tab-scoped `sessionStorage` and has a clear prototype notice. | Remove browser history and use authenticated server-side history. |
| SEC-08 | Medium | Demo references use `crypto.getRandomValues`; Worker references use cryptographic UUID material. | Use immutable server-side order IDs and provider references as the authoritative idempotency keys. |
| SEC-09 | Medium | Health now reports Mastercard-first `service`, `provider`, `environment`, `configured`, `mastercardConfigured`, and `bkashStatus`. It does not report missing secret names. | Add controlled deployment/version metadata if required by operations, without exposing secrets or internal account identifiers. |
| SEC-10 | Low/Medium | CI includes tracked-file secret scanning, full-history high-confidence scanning, dependency audit, syntax checks, documentation build validation, and payment hardening tests. | Add scheduled dependency review, SAST, Cloudflare deployment audit review, and quarterly key-rotation drills. |

## Current health contract

The live health response is intentionally non-sensitive:

```json
{
  "ok": true,
  "service": "smartgen-mastercard-mpqr-sandbox-gateway",
  "provider": "mastercard_mpqr",
  "environment": "sandbox",
  "configured": true,
  "mastercardConfigured": true,
  "bkashStatus": "on_hold",
  "authMode": "sandbox_public",
  "orderBinding": "sandbox_legacy_amount",
  "idempotency": "optional_with_memory_guard",
  "rateLimitPerMinute": 15
}
```

The current `sandbox_public` and `sandbox_legacy_amount` modes are deliberate compatibility settings for the public technical demo. They must not be copied into a live merchant deployment. The public Sandbox retrieval route intentionally returns `403 verification_failed` because an arbitrary transfer ID or reference is not payment proof. The public page can display the sanitized result returned by a create request, but it cannot use an unauthenticated retrieval lookup to authorize fulfillment.

A Sandbox upstream may return a deterministic fixture such as `APPROVED` for syntactically valid or previously used-looking IDs. SmartGen therefore treats every unauthenticated retrieval result as unverified and never changes an internal order to `paid` from that response. Only a protected order token plus exact server-side order matching can produce `state=verified`.

The arbitrary-ID retrieval finding was reproduced during audit and is treated as a provider-fixture limitation or unresolved upstream behavior until Mastercard confirms otherwise. It is not accepted as payment evidence. Regression tests must assert that an uncreated ID cannot move an internal order to `paid`.

## Production configuration target

After an authenticated order service and durable store exist, a protected Production Worker should use the equivalent of:

```toml
REQUIRE_CLIENT_AUTH = "true"
REQUIRE_ORDER_BINDING = "true"
REQUIRE_IDEMPOTENCY_KEY = "true"
RATE_LIMIT_PER_MINUTE = "15"
```

The following must be secret bindings, never plain-text variables:

```text
SMARTGEN_CLIENT_API_KEY
SMARTGEN_ORDER_SIGNING_SECRET
MASTERCARD_CONSUMER_KEY
MASTERCARD_SIGNING_KEY_PEM
```

The current deployment helper preserves existing Cloudflare `secret_text` bindings. The new hardening controls remain disabled in the public Sandbox because the public demonstration page has no authenticated order service and no durable order database.

## Verification commands

```bash
node workers/smoke-test.mjs
node workers/mastercard-smoke-test.mjs
node workers/mastercard-hardening-test.mjs
npm audit --audit-level=high --omit=dev
```

For the live Worker, verify only safe fields:

```bash
curl -sS https://YOUR_WORKER.workers.dev/health
```

Never print the full Worker environment, secret bindings, OAuth header, request body containing account data, or private key while troubleshooting.

## References

[1]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/api-basics/ "Mastercard MPQR API Basics"
[2]: https://developer.mastercard.com/mastercard-merchant-presented-qr/documentation/server-apis/response-error-codes/ "Mastercard MPQR Response and Error Codes"
[3]: https://developers.cloudflare.com/workers/configuration/secrets/ "Cloudflare Workers Secrets"
[4]: https://www.bb.org.bd/en/index.php/financialactivity/paysystems "Bangladesh Bank Payment and Settlement Systems"
