---
title: "Ecommerce Architecture Diagrams"
description: "Mermaid source and rendered maps for the Rinova BD ecommerce system."
order: 32
---

# Ecommerce Architecture Diagrams

The Mermaid files in this directory are the editable architecture sources. The rendered PNG files are review artifacts for readers who prefer a visual map. When a system boundary changes, update the Mermaid source first, render the PNG, inspect it, and update the relevant documentation chapter.

| Diagram | Meaning |
|---|---|
| [architecture.mmd](architecture.mmd) | Browser, Worker, Cloudflare bindings, D1, media, AI, and external adapters |
| [customer-order-pipeline.mmd](customer-order-pipeline.mmd) | Quote, order, payment, fulfillment, returns, and reconciliation |
| [ai-chatbot-retrieval.mmd](ai-chatbot-retrieval.mmd) | Customer/admin scope, exact facts, Vectorize knowledge, Workers AI, and validation |

## Render locally

```bash
manus-render-diagram architecture.mmd architecture.png
manus-render-diagram customer-order-pipeline.mmd customer-order-pipeline.png
manus-render-diagram ai-chatbot-retrieval.mmd ai-chatbot-retrieval.png
```

Do not place secret values, private account identifiers, internal hostnames, or customer data into diagram labels.
