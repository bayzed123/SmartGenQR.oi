# Availability vs Consistency In System Design
This is the practical, feature-by-feature version of the CAP trade-off.

## Ask: what's the cost of being wrong?

- **A bank balance shown 2 seconds stale** → a user could overdraw, or see a
  confusing number. **Choose strong consistency.**
- **A "likes" counter shown 2 seconds stale** → nobody notices or cares. **Choose
  availability + eventual consistency.**
- **A flight seat map shown 2 seconds stale** → double-booking is expensive but
  recoverable (rebook, refund). Often **hybrid**: optimistic UI + a consistent check
  at the moment of purchase.

## Techniques that give you both, most of the time

- **Read-your-writes consistency** — the specific user who just wrote data always sees
  it, even if other users might briefly see the old value. Cheaper than global strong
  consistency, and covers most UX complaints about "staleness."
- **Quorum reads/writes** (`W + R > N`) — tune how many replicas must ack a write / be
  read from to trade latency for consistency, without going fully synchronous.
- **Conflict-free replicated data types (CRDTs)** — data structures that can be updated
  concurrently on different nodes and always converge to the same value without
  coordination — used for counters, sets, and collaborative editing.

The default advice: **use eventual consistency unless you have a specific reason not
to.** It's cheaper, more available, and scales better — reach for strong consistency
only for the subset of data where staleness is actually harmful.
