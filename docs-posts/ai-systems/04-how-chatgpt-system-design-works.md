# How ChatGPT System Design Works
A conceptual, publicly-known-level walkthrough of the kind of architecture behind a
ChatGPT-style product — useful as a design study, not a claim about any specific
company's actual implementation details (which aren't public).

## Request path (conceptual)

`Client → API gateway (auth, rate limiting) → conversation/session service →
inference service (batched, streaming) → safety/moderation layer → client`

## Pieces worth understanding individually

- **Conversation state.** Each turn depends on the full prior conversation (or a
  summarized/truncated version of it, once it exceeds the model's context window) —
  so the service needs to assemble the right context on every request, not just the
  latest message.
- **Inference serving.** This is the [LLM System Design](03-llm-system-design.md)
  problem directly: batching many concurrent conversations' next-token generations
  together, streaming tokens back as they're produced.
- **Safety/moderation layers.** Realistic systems run input and output through
  classifiers/filters *in addition to* whatever behavior is trained into the model
  itself — [System Design Principles](../fundamentals/02-system-design-principles.md)'
  "defense in depth" applied directly: no single layer is trusted alone to catch
  everything.
- **Tool use / retrieval (when present).** If the assistant can search the web, run
  code, or look things up, that's effectively a sub-request to another system
  mid-generation — see [Agentic System Design](06-agentic-system-design.md) for how
  that loop is typically structured.

## Where the interesting scaling problems are

Not (only) storage or standard web-service scaling — the binding constraints are GPU
capacity, KV-cache memory, and cost per token, which is why so much of this space's
system design revolves around batching, quantization, and caching strategies specific
to inference (see [LLM System Design](03-llm-system-design.md)).
