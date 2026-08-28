---
title: "Ecommerce Go-Live Checklist"
description: "Rinova BD production release gates and evidence checklist."
order: 20
---

# Ecommerce Go-Live Checklist

## Code and build

- [ ] Branch is based on the intended release commit.
- [ ] Type checks and unit tests pass.
- [ ] No debug routes, test bypasses, hardcoded credentials, or private URLs remain.
- [ ] Dependency changes are reviewed and lockfile is committed.
- [ ] Static assets build and the Worker serves the expected frontend.

## Data and migrations

- [ ] Migration SQL is reviewed and tested in a disposable environment.
- [ ] Staging migration and backfill completed successfully.
- [ ] Production D1 target is confirmed without exposing its identifier publicly.
- [ ] Backup/recovery coverage and restore owner are confirmed.
- [ ] Seed/demo records are not mixed with production records.

## Security

- [ ] Admin routes reject anonymous access.
- [ ] Role-restricted fields and mutations are server-enforced.
- [ ] CORS allows only approved origins.
- [ ] Cookies and security headers are configured.
- [ ] Rate limits exist for chat, checkout, login, uploads, newsletter, and lookups.
- [ ] Secret scan is clean.
- [ ] Logs and screenshots contain no secrets or raw PII.

## Commerce

- [ ] Server recalculates price, stock, offers, delivery, and total.
- [ ] Duplicate checkout is idempotent.
- [ ] Payment callbacks are verified and matched to internal attempts.
- [ ] Unknown payment states remain recoverable.
- [ ] Courier and return workflows are tested.

## AI and support

- [ ] Customer chatbot cannot retrieve staff documents.
- [ ] Admin assistant is role-scoped.
- [ ] Exact commerce answers come from D1 or approved adapters.
- [ ] AI fallback and human-support path work.
- [ ] Product cards and links are server-verified.
- [ ] Chat retention and feedback policy are documented.

## Browser proof

- [ ] Desktop and mobile storefront screenshots reviewed.
- [ ] Admin dashboard screenshots reviewed.
- [ ] Checkout validation and error states reviewed.
- [ ] Chat loading, success, refusal, and fallback states reviewed.
- [ ] Screenshot-to-requirement mapping is updated.
- [ ] Playwright traces/artifacts are scrubbed of private data.

## Release and rollback

- [ ] Staging smoke tests pass.
- [ ] Production release owner and window are recorded.
- [ ] Previous known-good version is identified.
- [ ] Rollback and forward-repair steps are written.
- [ ] Post-deploy health checks pass.
