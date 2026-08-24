# Scalability in System Design
Scalability is a system's ability to handle growing load by adding resources, ideally
without a redesign.

## Vertical vs. horizontal

- **Vertical scaling** — bigger machine (more CPU/RAM/disk). Simple, but has a hard
  ceiling and a single point of failure.
- **Horizontal scaling** — more machines. No practical ceiling, but requires the
  workload to be splittable, and the software to tolerate running as many instances.

Most systems that need to scale significantly end up horizontal — which is why
statelessness (see [System Design Principles](02-system-design-principles.md)) matters
so much: stateless services can be scaled by just adding boxes behind a load balancer.

## Scaling the pieces that hold state

State is the hard part, because you can't just add copies without deciding how they
stay consistent with each other.

- **Read replicas** — scale read throughput by copying data to followers; writes still
  go to one primary.
- **Sharding / partitioning** — split data across nodes by a key (user ID, region,
  hash range) so both reads *and* writes scale, at the cost of cross-shard queries
  becoming harder.
- **Caching** — absorb read traffic before it reaches the database at all (see
  [Caching In System Design Explained](../building-blocks/01-caching-in-system-design-explained.md)).

## Signs you're scaling the wrong thing

- Adding servers doesn't help because the bottleneck is a single database, not compute.
- You're sharding before you've exhausted simpler options like caching, indexing, or
  read replicas — sharding adds real operational complexity.

Scale the layer that's actually saturated, in the order: **cache → read replica →
shard**, and only take each step once the previous one is genuinely maxed out.
