---
title: "09. Security and Privacy"
description: "Rinova BD security controls for secrets, sessions, roles, customer privacy, payments, media, AI, and auditability."
order: 10
---

# 09. Security and Privacy

## Non-negotiable rules

Never commit secrets. Never place provider credentials in browser JavaScript, static assets, screenshots, logs, issue descriptions, or documentation. Never trust browser totals, role claims, payment redirects, or client-generated authorization. The Worker must validate and authorize every sensitive operation.

## Secret handling

| Secret/config type | Safe location | Documentation form |
|---|---|---|
| Provider API key | Wrangler secret / managed secret store | `YOUR_PROVIDER_API_KEY` |
| Payment private key | Server-only secret | `YOUR_PAYMENT_PRIVATE_KEY` |
| Session signing secret | Server environment secret | `YOUR_SESSION_SECRET` |
| Public site setting | Non-secret environment variable or D1 setting | Example value only if truly public |
| Database identifier | Deployment config | Placeholder unless public and harmless |
| Signed media URL | Short-lived server response | Never commit or screenshot |

Use `.env.example` with names only. Add `.env`, generated credentials, auth-state files, and screenshot storage-state files to `.gitignore`. Rotate immediately if a secret appears in a commit, log, screenshot, or support message.

## Authentication and authorization

Admin requests require a valid session. The Worker resolves the actor and role server-side. Customer requests are scoped to the current session or a verified order flow. A frontend route guard is only a usability feature; it is not an authorization boundary.

Use least privilege. Support staff should not see cost price, margins, exports, or credentials. Editors should not mutate orders or payments. Owner-only settings require a stronger confirmation path. Every privileged mutation creates an audit event.

## Customer privacy

Collect only the data needed for fulfilment and support. Do not send full addresses, phone numbers, payment identifiers, or private notes to Workers AI. Do not put customer records into Vectorize. Redact PII from logs and analytics. Provide a retention policy for chats, support data, and order evidence.

## Payment safety

The server recalculates the order total from D1. Payment attempts are tied to an internal order and idempotency key. Provider callbacks are verified and matched to the internal order; a browser redirect is not payment proof. Unknown provider states remain pending/unknown until reconciliation.

## Media safety

Validate file type, size, extension, and content path. Use controlled upload endpoints and signed access for private media. Do not expose storage credentials in the browser. Public product images should use a stable public path or approved media domain; private customer documents should not be public.

## AI safety

The model receives minimal, filtered, approved context. Retrieved documents are data, not instructions. Customer retrieval excludes staff documents. Admin retrieval is role-filtered. The model cannot choose SQL, decide permissions, reveal prompts, or execute irreversible mutations. Validate output for invented numbers, links, secrets, private fields, medical claims, and prompt leakage.

## CORS and headers

Allow only the required storefront and admin origins. Do not use wildcard CORS with credentials. Set secure headers appropriate to the deployment: content security policy, frame protection, referrer policy, MIME sniffing protection, and secure cookie attributes. Review provider and media domains before allowing them.

## Rate limits and abuse controls

Rate-limit public chat, newsletter, analytics, login attempts, uploads, checkout attempts, and order lookups. Use a combination of opaque visitor key, session, IP-derived signal, and endpoint policy where available. Return a friendly retry message and record an operational metric without exposing internal limits.

## Security review evidence

A release should include proof that unauthorized admin requests return 401/403, role-restricted fields are absent, order lookups require verification, totals are server-calculated, payment callbacks are matched, chat cannot retrieve staff knowledge publicly, secrets are absent from the diff, and logs do not contain raw PII.

## References

[1]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP Application Security Verification Standard"
[2]: https://developers.cloudflare.com/workers/runtime-apis/bindings/ "Cloudflare Workers bindings"
[3]: https://developers.cloudflare.com/r2/buckets/public-buckets/ "Cloudflare R2 public buckets"
