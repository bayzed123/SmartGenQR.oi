# System Design Principles
A handful of principles show up in almost every well-designed system, regardless of
domain. They're not laws — they're defaults you should have a *reason* to deviate from.

- **Separation of concerns.** Each component should own one responsibility. It makes
  systems easier to reason about, test, and scale independently.
- **Loose coupling, high cohesion.** Components should depend on interfaces/contracts,
  not on each other's internals, so they can evolve and fail independently.
- **Statelessness where possible.** Stateless services scale horizontally trivially —
  just add more instances behind a load balancer. Push state into a datastore designed
  for it.
- **Design for failure.** Assume any node, disk, network link, or availability zone can
  fail at any time. Redundancy and graceful degradation aren't optional at scale.
- **Idempotency.** Operations that can safely be retried (because the network *will*
  drop responses) prevent a huge class of distributed-systems bugs.
- **Single source of truth.** Every piece of data should have one authoritative owner,
  even if it's cached or replicated elsewhere.
- **Defense in depth.** No single mechanism (a cache, a rate limiter, a validation layer)
  should be the only thing standing between your system and a bad outcome.
- **Simplicity over cleverness.** The best system is the simplest one that meets the
  requirements — complexity has an ongoing operational cost.

These principles trade off against each other constantly (consistency vs. availability,
simplicity vs. flexibility), which is why [Availability vs Consistency In System
Design](07-availability-vs-consistency-in-system-design.md) and the rest of this section
exist.
