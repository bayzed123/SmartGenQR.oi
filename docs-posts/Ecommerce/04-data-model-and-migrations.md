---
title: "04. Data Model and Migrations"
description: "Rinova BD D1 schema concepts, relationships, lifecycle states, migration workflow, and data safety."
order: 5
---

# 04. Data Model and Migrations

## Core domains

The schema is organized around identity, catalogue, commerce, content, support, integrations, and audit. The source repository uses additive numbered migrations under `worker/migrations/`.

| Domain | Core records | Ownership |
|---|---|---|
| Identity | admin users, customers, sessions, roles | Worker/auth layer |
| Catalogue | categories, products, media, badges, reviews | Admin + D1 |
| Commerce | orders, order items, offers, payment attempts, returns | Worker + D1 |
| Operations | POS sales, inventory adjustments, notifications, audit | Admin + D1 |
| Content | site pages, blog posts, CMS content, banners, newsletter leads | Admin + D1/media |
| Support | chat conversations, chat messages, feedback, knowledge documents | Worker + admin |
| Integrations | provider references, courier state, analytics sync events | Server adapters |

## Important relationships

```text
customers 1──* orders 1──* order_items *──1 products
products *──1 categories
products 1──* product_media
orders 1──* payment_attempts
orders 1──* returns
chat_conversations 1──* chat_messages
knowledge_documents 1──* knowledge_chunks
admin_users 1──* audit_events
```

## Commerce invariants

The Worker must enforce these invariants before writing data:

| Invariant | Enforcement |
|---|---|
| Order total equals server calculation | Recalculate from current D1 product/offer/delivery rows |
| Order item price is historical | Store the unit price used at order creation |
| Stock cannot become negative | Transactional check/update or serialized adjustment |
| Payment attempt is tied to order | Foreign key/reference plus idempotency key |
| Provider status is not internal status | Normalize and map explicitly |
| Return belongs to order/customer | Check relationship before reading or writing |
| Admin mutation is attributable | Store actor, timestamp, reason, and affected entity |

## Chat and knowledge additions

Add these tables through additive migrations when implementing semantic knowledge:

| Table | Minimum columns |
|---|---|
| `knowledge_documents` | `id`, `slug`, `title`, `body`, `audience`, `locale`, `content_type`, `status`, `version`, `published_at`, `updated_by`, `updated_at` |
| `knowledge_chunks` | `id`, `document_id`, `chunk_index`, `text`, `vector_id`, `checksum`, `status` |
| `knowledge_sync_events` | `id`, `document_id`, `action`, `status`, `error_message`, `created_at` |
| `chat_feedback` | `id`, `conversation_id`, `message_id`, `rating`, `reason`, `created_at` |
| `chat_rate_limits` | `id`, `key_hash`, `window_start`, `request_count` |
| `admin_audit_events` | `id`, `actor`, `action`, `entity_type`, `entity_id`, `before_hash`, `after_hash`, `created_at` |

Do not store embeddings as a large D1 blob. D1 stores the source document and vector ID; Vectorize stores the searchable vector and safe metadata. Do not put private customer records, payment secrets, or raw session tokens into a vector index.

## Migration workflow

1. Modify the schema source or write a reviewed SQL migration.
2. Use a new sequential migration number; never rewrite an applied migration.
3. Test the migration against a disposable local or staging database.
4. Verify indexes, foreign keys, default values, and backfill behavior.
5. Run a pre-deployment backup or confirm D1 Time Travel coverage.
6. Apply the migration to staging and run the full test suite.
7. Apply to production during an approved release window.
8. Record the migration identifier and rollback/recovery plan.

## Seed data

Seed data must be synthetic, minimal, and clearly labelled. Never commit real customer names, phone numbers, addresses, payment references, provider tokens, or private chat transcripts. Use fixtures to cover active, inactive, out-of-stock, low-stock, discounted, returned, and ambiguous-payment states.

## References

[1]: https://developers.cloudflare.com/d1/ "Cloudflare D1"
[2]: https://developers.cloudflare.com/d1/reference/time-travel/ "D1 Time Travel"
