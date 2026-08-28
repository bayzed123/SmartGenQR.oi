---
title: "14. Contributing and Release Workflow"
description: "How developers safely change Rinova BD ecommerce code, schema, integrations, docs, and visual proof."
order: 15
---

# 14. Contributing and Release Workflow

## Start with a small design note

Before changing code, write the user outcome, affected route, data source, authorization scope, failure behavior, migration impact, and proof needed. This prevents a visual request from accidentally changing checkout or private data boundaries.

## Feature workflow

| Stage | Required output |
|---|---|
| Understand | Issue or note with acceptance criteria and affected surfaces |
| Model | Reviewed schema/API/state changes |
| Implement | Server validation and UI states together |
| Test | Unit, route, permission, and browser tests |
| Prove | Screenshot or trace mapped to the acceptance criteria |
| Review | Security, data, UX, accessibility, and rollback review |
| Release | Staging evidence, release owner, and rollback version |
| Document | Updated chapter, checklist, and troubleshooting note if needed |

## Code conventions

Keep business rules in the Worker, use parameterized D1 queries, normalize provider responses, and keep frontend code focused on rendering and interaction. Do not introduce a second data-fetching pattern without documenting why. Reuse existing route and UI conventions where they are secure and clear.

## Pull request requirements

A pull request should describe what changed, what did not change, how it was tested, whether a migration is included, which secrets or bindings are required by name only, what screenshots prove, and how to roll back. Do not include secret values or private customer screenshots in the pull request.

## Review questions

Reviewers should ask whether the browser can forge price/role/status, whether customer and admin scopes are separated, whether failures are recoverable, whether data is logged safely, whether the mobile state works, whether an AI response is grounded, and whether an operator knows what to do next.

## Documentation maintenance

Update the navigation map when adding or renaming a file. Update diagrams when boundaries change. Update screenshot mapping when behavior or layout changes. Check all links before merge. Keep references current and mark examples as examples.
