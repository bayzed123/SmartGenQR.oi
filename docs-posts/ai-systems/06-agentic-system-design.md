# Agentic System Design
An "agent" is a system that uses a model in a loop — plan, take an action (often
calling a tool), observe the result, decide the next step — rather than a single
prompt-in/response-out call.

## The core loop

`Goal → Plan/reason → Select & call a tool → Observe result → Update state → repeat
until done (or a limit is hit)`

This looks a lot like a classic control loop, and benefits from the same system design
thinking: it needs bounds (max steps, timeouts, budget) or it can run indefinitely,
burning cost without converging.

## Design components

- **Tool interface.** Tools (web search, code execution, API calls, database queries)
  need a well-defined contract — the model needs to reliably understand what a tool
  does and what it returns; poorly specified tools are a major source of agent
  failures, independent of model quality.
- **Memory.** Short-term (the current task's scratchpad/conversation) vs. long-term
  (facts that should persist across sessions) are different systems with different
  requirements — short-term memory can live in the request context; long-term memory
  usually needs its own retrieval system (often vector-search-backed, like the RAG
  pattern in [Generative AI System Design
  Interview](05-generative-ai-system-design-interview.md)).
- **Orchestration.** For multi-step or multi-agent workflows, something needs to own
  the overall state machine — deciding what runs next, handling partial failures of
  individual steps, and knowing when the overall task is actually done vs. stuck in a
  loop.
- **Guardrails at every tool call, not just at input/output.** Each tool call is a new
  opportunity for something to go wrong (a destructive action, a bad query) — the
  "defense in depth" principle applies per-action, not just to the overall
  conversation.

## Reliability is a bigger deal here than in a single-call system

A single failed model call in a normal chat product is one bad response. A failed step
in a 10-step agent loop can compound — an early mistake shapes everything the agent
does afterward. Bounding the loop (max iterations, budget, human-in-the-loop
checkpoints for high-stakes actions) matters more here than in almost any other system
in this handbook.
