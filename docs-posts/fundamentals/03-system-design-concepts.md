# System Design Concepts
A working glossary of terms you'll see throughout this handbook.

| Term | Meaning |
|---|---|
| **Latency** | Time to complete a single operation (e.g. p50/p99 response time). |
| **Throughput** | Operations completed per unit time (e.g. requests/sec). |
| **Load balancing** | Distributing traffic across multiple servers. |
| **Horizontal scaling** | Adding more machines. |
| **Vertical scaling** | Adding more resources (CPU/RAM) to one machine. |
| **Sharding / partitioning** | Splitting a dataset across multiple stores by key. |
| **Replication** | Keeping copies of data on multiple nodes for durability/availability. |
| **Consistency** | Whether all readers see the same value at the same time. |
| **Availability** | Whether the system responds successfully to requests. |
| **Caching** | Storing a copy of data closer to where it's used, to reduce latency/load. |
| **Queueing** | Buffering work between a producer and a consumer to smooth load. |
| **Rate limiting** | Capping how much traffic a client can send in a window. |
| **Consistent hashing** | A hashing scheme that minimizes redistribution when nodes join/leave. |
| **SPOF** | Single point of failure — any one component whose failure takes the system down. |

Most system design discussions are really about which of these levers you pull, and
what you give up when you pull them. The rest of this handbook goes deep on each one.
