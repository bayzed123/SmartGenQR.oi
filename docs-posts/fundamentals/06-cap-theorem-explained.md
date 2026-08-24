# CAP Theorem Explained
Building on [CAP Theorem in System Design](05-cap-theorem-in-system-design.md), here's
how the trade-off plays out in real systems.

## CP systems (favor consistency during a partition)

- **ZooKeeper / etcd** — used for leader election and config storage precisely *because*
  they refuse to serve possibly-stale reads. A coordination service that lies about who
  the leader is would be worse than one that's briefly unavailable.
- **Relational databases in a single-leader setup** — a follower that's cut off from the
  leader stops serving fresh writes rather than risk divergence.

## AP systems (favor availability during a partition)

- **Cassandra / DynamoDB** — tunable consistency, but the default posture is "always
  accept a write, resolve conflicts later" (e.g. via last-write-wins or vector clocks).
- **DNS** — a resolver that can't reach the authoritative server serves its cached
  answer rather than failing every lookup.

## PACELC: the theorem's more useful sequel

PACELC extends CAP: *if there's a Partition (P), choose between Availability and
Consistency (A/C); Else (E, i.e. normal operation), choose between Latency and
Consistency (L/C).* This captures a trade-off CAP ignores entirely — that even with no
partition, strongly consistent systems (e.g. synchronous replication) pay a latency
cost that eventually-consistent systems don't.

In practice: pick CP for anything where a stale read is *wrong* (inventory counts,
bank balances, leader election); pick AP for anything where a stale read is merely
*imperfect* (like counts, feed content, presence indicators).
