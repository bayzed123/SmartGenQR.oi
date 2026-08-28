---
title: "13. Troubleshooting"
description: "Safe diagnosis and recovery for Rinova BD development, deployment, checkout, admin, media, AI, and browser-test failures."
order: 14
---

# 13. Troubleshooting

## Triage order

First identify the environment, route, timestamp, release version, and whether data was mutated. Then inspect normalized logs and dependency health. Do not immediately retry payment, refund, stock adjustment, or migration operations until idempotency and current state are known.

| Symptom | Likely area | Safe first action |
|---|---|---|
| Static page missing | Worker assets or route fallback | Check asset directory and deployment version |
| Public products empty | D1 query, active flag, or cache | Inspect safe catalogue response and invalidate public cache |
| Admin receives 401 | Session, origin, or cookie policy | Re-authenticate in staging; do not bypass the Worker gate |
| Checkout total differs | Server quote or stale browser bag | Re-run server quote; never trust browser total |
| Payment pending/unknown | Provider callback or reconciliation | Inspect attempt and internal order; do not mark paid manually without evidence |
| Image broken | Media path, CORS, or signed URL expiry | Check safe media reference and storage policy |
| Chat fallback | AI, retrieval, or provider issue | Check provider status and retrieval health; use D1-only fallback |
| Chat leaks private content | Retrieval filter or prompt boundary | Disable affected retrieval path and preserve evidence |
| D1 migration fails | Schema or backfill issue | Stop release, inspect migration in staging, use forward repair |
| Screenshot diff large | Browser/font/data volatility | Compare environment, freeze fixtures, review before update |

## Cloudflare binding failures

Check that the binding name used in TypeScript matches the deployment configuration for the active environment. Ensure D1, KV, AI, media, and Vectorize bindings are not accidentally pointing at production from local or preview. Never print secret values while diagnosing bindings.

## D1 failures

Inspect the normalized error code, migration state, and query parameters. Check whether a migration was applied to the intended database. Use parameterized SQL and bounded queries. If data appears inconsistent, stop mutations and compare the order/audit/reconciliation records before repairing.

## Checkout and payment failures

Capture the internal order code, payment-attempt identifier, provider status category, and timestamp—not credentials or raw payloads. Confirm idempotency before retrying. If the provider returns an ambiguous result, keep the internal state unknown/pending and run the reconciliation process.

## Chat failures

Separate generation failure from retrieval failure. If exact D1 facts work but long-form answers fail, Vectorize or knowledge indexing may be unavailable. If retrieval works but generation fails, use the configured fallback. If a customer receives staff content, disable the public retrieval path immediately, inspect `audience` filters, and rotate any exposed sensitive material.

## Browser-test failures

Check the base URL, fixture state, login setup, viewport, font loading, and third-party script volatility. Do not update snapshots merely to make CI green. Review the diff, confirm it maps to an intended design or behavior change, and store a short evidence note.

## Security incident

If a secret, private URL, customer record, or payment detail enters Git history, logs, screenshots, or a public response, stop further exposure, rotate the affected secret, restrict the affected endpoint, preserve minimal evidence, and follow the project incident process. Do not “fix” the repository by only deleting the visible line; history and provider credentials must be considered compromised.
