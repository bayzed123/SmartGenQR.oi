# High Availability System Design
Availability is usually expressed in "nines" — the percentage of time a system is up
and serving correctly.

| Availability | Downtime / year |
|---|---|
| 99% ("two nines") | ~3.65 days |
| 99.9% ("three nines") | ~8.76 hours |
| 99.99% ("four nines") | ~52.6 minutes |
| 99.999% ("five nines") | ~5.26 minutes |

Each additional nine is roughly an order of magnitude more expensive to achieve.

## The core techniques

- **Eliminate single points of failure.** Every component — load balancer, database,
  cache, DNS — needs a redundant counterpart, or it caps your entire system's
  availability at its own.
- **Redundancy across failure domains.** Multiple instances on the same rack, host, or
  availability zone don't protect you from a rack, host, or AZ failure. Spread replicas
  across AZs, and for critical systems, across regions.
- **Health checks + automatic failover.** Detect a failed node quickly and route
  around it — the speed of detection usually matters more than the sophistication of
  the failover mechanism.
- **Load shedding & graceful degradation.** When overloaded, deliberately serve a
  cheaper/partial response (or reject low-priority traffic) rather than let everything
  fail.

## Availability math for combined components

Components in **series** multiply their availabilities (99.9% × 99.9% ≈ 99.8% — worse
than either alone). Components in **parallel** (redundant) combine as
`1 − (downtime₁ × downtime₂)` — dramatically better. This is *why* redundancy works:
it turns multiplication (bad) into a near-additive improvement (good).
