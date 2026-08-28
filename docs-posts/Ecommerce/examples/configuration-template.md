---
title: "Configuration Template"
description: "Non-secret environment and binding template for Rinova BD ecommerce development and deployment."
order: 30
---

# Configuration Template

This file documents variable names and binding intent only. It intentionally contains no real credentials, private IDs, signed URLs, or secret values.

## Non-secret configuration

```toml
name = "rinovabd-worker"
main = "src/index.ts"
compatibility_date = "YYYY-MM-DD"

[vars]
SHOP_NAME = "Rinova BD"
SHOP_PHONE = "PUBLIC_SUPPORT_NUMBER"
AI_MODEL = "CLOUDFLARE_MODEL_ID"
R2_PUBLIC_URL = "https://media.example.com"

[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
database_name = "ENVIRONMENT_DATABASE_NAME"
database_id = "YOUR_DATABASE_ID"
migrations_dir = "migrations"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_NAMESPACE_ID"

# Configure per environment after creating the index.
# [[vectorize]]
# binding = "KNOWLEDGE"
# index_name = "YOUR_VECTORIZE_INDEX"
```

## Secret names

```text
SESSION_SECRET
PAYMENT_PROVIDER_SECRET
PAYMENT_PRIVATE_KEY
COURIER_API_TOKEN
GOOGLE_SERVICE_ACCOUNT_JSON
AI_GATEWAY_TOKEN
MEDIA_SIGNING_SECRET
```

Add values with the approved secret manager. Never commit them to this file or to `wrangler.toml`.

## Environment matrix

| Setting | Local | Preview | Production |
|---|---|---|---|
| D1 | Disposable/local | Dedicated staging DB | Production DB |
| Media | Local fixture or staging bucket | Staging bucket | Production bucket |
| Payments | Mock/sandbox | Sandbox | Approved production provider |
| AI | Test model/config | Controlled model/config | Approved model with monitoring |
| Customer data | Synthetic | Scrubbed | Real, protected |
| Admin auth | Test account | Staging account | Approved staff identities |

## Deployment reminders

Confirm the active environment before every migration, media upload, secret write, or deployment. Review the diff and run a secret scan first. Use placeholders in tickets, demos, and screenshots.
