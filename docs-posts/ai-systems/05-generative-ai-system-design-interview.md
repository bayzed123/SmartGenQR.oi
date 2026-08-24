# Generative AI System Design Interview
What tends to differentiate a strong answer in a generative-AI-flavored system design
interview from a standard web-service one.

## What interviewers are typically probing for

- **Cost-awareness as a first-class constraint.** Can you reason about cost per
  request the same way you'd reason about latency, and make explicit trade-offs
  (smaller model, caching, batching) rather than treating compute as free?
- **Latency strategy for a slow, sequential operation.** Since token-by-token
  generation is inherently sequential (see [LLM System
  Design](03-llm-system-design.md)), do you reach for streaming responses to fix
  *perceived* latency, since you often can't fix actual generation time?
- **Retrieval-augmented generation (RAG), when relevant.** For a "build a Q&A/
  assistant over private documents" style prompt: do you know that this splits into a
  *retrieval* problem (embedding + vector search over your documents) feeding a
  *generation* problem (the model, prompted with retrieved context) — and can you
  reason about each half's failure modes separately (irrelevant retrieval vs.
  hallucinated generation)?
- **Guardrails as a design requirement, not an afterthought.** Do you proactively
  bring up input/output filtering, rate limiting, and abuse prevention, or does the
  interviewer have to prompt you for it?

## A useful default structure for these problems

1. Clarify: is this a chat product, a retrieval/Q&A product, or an agentic
   (tool-using) product? Each has a different bottleneck.
2. Sketch the request path, being explicit about where the model call(s) sit and what
   else surrounds them (auth, rate limiting, moderation).
3. Go deep on whichever piece is most novel for the specific prompt — usually either
   the retrieval/ranking step (for RAG) or the batching/serving strategy (for raw
   chat).
4. Explicitly discuss cost, latency, and safety trade-offs — don't wait to be asked.
