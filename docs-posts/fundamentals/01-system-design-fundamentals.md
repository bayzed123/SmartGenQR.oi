# System Design Fundamentals
System design is the process of defining the architecture, components, interfaces, and
data flow of a software system to satisfy a set of functional and non-functional
requirements — things like scale, latency, availability, and cost.

## Why it matters

- **Real engineering.** Every production system that serves more than a handful of users
  eventually has to answer questions about scale, failure, and change.
- **Interviews.** Most senior/staff engineering interviews at large tech companies include
  a system design round, because it's a good proxy for how you think, not just what you know.

## A repeatable approach

1. **Clarify requirements.** Separate *functional* requirements (what the system does) from
   *non-functional* ones (scale, latency, consistency, availability, cost).
2. **Estimate scale.** Back-of-the-envelope math for traffic, storage, and bandwidth — see
   [Back of the Envelope Calculation](04-back-of-the-envelope-calculation.md).
3. **Sketch a high-level design.** Boxes and arrows: clients, load balancer, services,
   datastores, caches, queues.
4. **Go deep on 1–2 components.** Whatever is most interesting or most constrained —
   usually the data model or a specific bottleneck.
5. **Discuss trade-offs.** There is rarely one right answer; the value is in reasoning
   explicitly about the trade-offs you're making.

## Where to go next

Read [System Design Principles](02-system-design-principles.md) for the recurring rules
of thumb, then [System Design Concepts](03-system-design-concepts.md) for the vocabulary
you'll need for everything else in this handbook.
