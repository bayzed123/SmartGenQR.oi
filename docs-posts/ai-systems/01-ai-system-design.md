# AI System Design
AI system design applies the same fundamentals as the rest of this handbook — scale,
availability, consistency, reliability — to systems built around machine learning
models, where the "business logic" is a trained model rather than hand-written rules.

## What's genuinely different

- **Non-determinism.** The same input can produce different outputs (especially for
  generative models), which complicates testing, caching, and debugging in ways
  traditional systems don't face.
- **Expensive-per-request compute.** A single inference call can cost orders of
  magnitude more (in latency and dollars) than a typical API call, which pushes
  batching, caching, and cost-aware rate limiting from "nice to have" to "core
  requirement."
- **The model itself is a dependency that changes.** Retraining/redeploying a model is
  a deploy with a much fuzzier notion of "correctness" than a code deploy — you need
  offline evaluation and online monitoring (drift, quality regressions) as first-class
  parts of the pipeline, not just a test suite.
- **Data is the interface.** Feature pipelines, training data quality, and label
  quality often matter more to system behavior than the serving infrastructure around
  them.

## How this handbook's fundamentals still apply

Caching still helps (for deterministic or cacheable requests); rate limiting still
matters (arguably more, given cost-per-request); reliability patterns (circuit
breakers, graceful degradation) still apply, with a "fallback" often meaning a smaller/
cheaper model rather than a cached response.

The next few pages go deeper on specific flavors: [ML System
Design](02-ml-system-design.md) for the training/serving pipeline in general, then [LLM
System Design](03-llm-system-design.md) and [Agentic System
Design](06-agentic-system-design.md) for generative-model-specific concerns.
