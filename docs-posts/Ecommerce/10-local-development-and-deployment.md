---
title: "10. Local Development and Deployment"
description: "Safe Rinova BD setup, local Worker development, D1 migrations, media configuration, environment separation, and release procedure."
order: 11
---

# 10. Local Development and Deployment

## Prerequisites

Install a supported Node.js version, Git, Wrangler, and the project’s package manager. Authenticate Wrangler through the approved Cloudflare account workflow. Do not paste tokens into shell history or documentation.

## Repository layout

```text
rinovabd.com/
  web/                 # static storefront, admin UI, media references
  worker/
    src/index.ts       # Worker routes and server logic
    migrations/        # additive D1 SQL migrations
    wrangler.toml      # bindings and non-secret configuration
    package.json
  docs/                # project-local technical notes
```

## Local setup

```bash
git clone https://github.com/bayzed123/rinovabd.com.git
cd rinovabd.com/worker
pnpm install
pnpm typecheck
pnpm dev
```

The local Worker should use a local or disposable D1 database and synthetic fixtures. Keep the frontend asset path aligned with the Worker configuration. If the project uses npm instead of pnpm in a particular environment, use the lockfile already committed by the project rather than mixing package managers.

## Configuration policy

Non-secret variables may live in `wrangler.toml` when they are safe for source control. Provider credentials, private keys, session secrets, and access tokens must be added through Wrangler secret storage or the deployment platform’s secret manager.

```bash
wrangler secret put PAYMENT_PROVIDER_SECRET
wrangler secret put COURIER_API_TOKEN
wrangler secret put SESSION_SECRET
```

Use environment-specific configuration for local, preview, and production. Never point local development at production D1 or production media.

## D1 migration workflow

Run migrations in a disposable environment first, inspect generated SQL, test backfills, and verify foreign keys and indexes. Apply to staging, run browser/API tests, then apply to production during an approved window. Keep a migration log and confirm recovery coverage before destructive changes.

```bash
cd worker
wrangler d1 migrations list YOUR_DATABASE_NAME --remote
wrangler d1 migrations apply YOUR_DATABASE_NAME --remote
```

Replace placeholders locally. Do not paste real database IDs or account credentials into this guide.

## Vectorize and AI setup

Create an environment-specific Vectorize index for semantic knowledge. Configure the embedding model and generation model as deployment settings, not hardcoded secrets. Index only approved, versioned documents. Customer and staff retrieval must use separate namespaces or strict metadata filters.

## Media setup

Use R2 or the project’s server-side S3-compatible adapter for product and editorial media. Upload through a controlled admin route or approved deployment utility. Validate file type and size. Store the resulting public or signed media reference in D1; do not commit large binary media to the codebase unless the project explicitly treats the file as a small static asset.

## Deployment order

1. Review the diff and secret scan.
2. Run type checks and unit tests.
3. Apply schema migrations to staging.
4. Deploy the Worker to staging.
5. Run API, admin, customer, and Playwright screenshot tests.
6. Verify logs, health routes, payment sandbox, courier sandbox, and AI fallback.
7. Obtain release approval.
8. Apply production migrations.
9. Deploy production Worker/assets.
10. Run smoke tests and record evidence.

Cloudflare Workers is designed for serverless deployment and binding-based access to storage, AI, and other services.[1] D1 supports serverless SQL queries from Workers and includes disaster-recovery features such as Time Travel.[2] R2 provides object storage for large unstructured media without typical egress bandwidth fees.[3]

## Rollback

For application rollback, redeploy the previous known-good Worker version and static asset bundle. For schema rollback, prefer a forward-compatible repair migration; do not casually drop production columns or tables. For data corruption, stop the affected mutation path, preserve evidence, use a reviewed recovery procedure, and record the incident.

## References

[1]: https://developers.cloudflare.com/workers/ "Cloudflare Workers"
[2]: https://developers.cloudflare.com/d1/ "Cloudflare D1"
[3]: https://developers.cloudflare.com/r2/ "Cloudflare R2"
[4]: https://developers.cloudflare.com/vectorize/ "Cloudflare Vectorize"
[5]: https://developers.cloudflare.com/workers-ai/ "Cloudflare Workers AI"
