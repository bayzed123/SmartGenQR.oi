# Reliability in System Design
Reliability is a system's ability to keep working *correctly* — not just to keep
responding (that's availability), but to do the right thing even as parts of it fail.

## Building blocks of reliability

- **Retries with backoff and jitter.** Transient failures (a dropped packet, a
  momentarily overloaded node) often succeed on retry. Exponential backoff with jitter
  prevents retries from synchronizing into a thundering herd.
- **Timeouts.** Every network call needs one — without a timeout, a single slow
  dependency can exhaust your caller's threads/connections and cascade the failure
  upstream.
- **Circuit breakers.** After enough failures to a dependency, stop calling it for a
  cooldown period instead of piling up failing requests — protects both the caller and
  the struggling callee.
- **Bulkheads.** Isolate resource pools (thread pools, connection pools) per
  dependency, so one slow dependency can't starve requests to a healthy one.
- **Idempotent operations + at-least-once delivery.** Combine retries safely with
  operations that can be applied more than once without side effects.

## SLIs, SLOs, and SLAs

- **SLI** (Service Level *Indicator*) — a measured metric, e.g. "p99 latency" or
  "error rate."
- **SLO** (Service Level *Objective*) — your internal target for that metric, e.g.
  "p99 latency < 200ms."
- **SLA** (Service Level *Agreement*) — an external, often contractual, commitment —
  usually looser than your SLO, to leave margin for error.

Design reliability *in*, rather than bolting it on: assume every dependency will fail,
decide up front what "correct but degraded" looks like, and test failure paths (chaos
engineering, game days) as deliberately as you test the happy path.
