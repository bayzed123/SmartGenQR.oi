# CAP Theorem in System Design
The CAP theorem states that a distributed data store can only guarantee two of the
following three properties at the same time:

- **Consistency (C)** — every read receives the most recent write or an error.
- **Availability (A)** — every request receives a (non-error) response, without the
  guarantee it contains the most recent write.
- **Partition tolerance (P)** — the system continues to operate despite network
  partitions between nodes.

## The part people get wrong

In any real distributed system, network partitions *will* happen — so P isn't really
optional. The actual choice CAP forces on you is: **when a partition happens, do you
sacrifice consistency (stay available, might serve stale data) or availability (refuse
requests until the partition heals, to keep data consistent)?**

That's why you'll more often hear systems described as **CP** (e.g. ZooKeeper, etcd,
HBase) or **AP** (e.g. Cassandra, DynamoDB, Riak) rather than as satisfying all three.

See [CAP Theorem Explained](06-cap-theorem-explained.md) for concrete examples, and
[Availability vs Consistency In System
Design](07-availability-vs-consistency-in-system-design.md) for how to actually decide
between them for a given feature.
