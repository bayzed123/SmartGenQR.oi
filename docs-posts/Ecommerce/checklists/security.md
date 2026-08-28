---
title: "Ecommerce Security Checklist"
description: "Rinova BD security verification for every release and incident review."
order: 21
---

# Ecommerce Security Checklist

| Control | Verification evidence | Status |
|---|---|---|
| Secret hygiene | Secret scan, `.gitignore`, no credentials in docs/screenshots/logs | [ ] |
| Admin authorization | Anonymous and wrong-role requests return 401/403 | [ ] |
| Customer isolation | One customer cannot read another customer’s order/profile | [ ] |
| Server pricing | Checkout ignores client-supplied price and total | [ ] |
| Payment binding | Callback maps to internal order and payment attempt | [ ] |
| Idempotency | Duplicate requests do not create duplicate order/payment effects | [ ] |
| CORS and cookies | Only approved origins and secure cookie attributes are active | [ ] |
| Rate limits | Chat, checkout, uploads, lookups, and login have limits | [ ] |
| AI retrieval | Customer filters exclude staff documents and private rows | [ ] |
| AI output | Unknown numbers, secrets, private data, and unsafe claims are blocked | [ ] |
| Media | Upload validation and private-object access are tested | [ ] |
| Audit | Privileged mutations record actor, entity, reason, and timestamp | [ ] |
| Recovery | Backup/restore and rollback owners are identified | [ ] |
| Browser proof | Screenshots and traces are scrubbed and mapped to requirements | [ ] |
