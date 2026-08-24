# Back of the Envelope Calculation
Before designing anything, estimate the scale you're actually designing for. It's easy
to over-engineer for scale you'll never hit, or under-engineer for scale you will.

## The basic recipe

1. Estimate **daily active users (DAU)** and their usage pattern (requests/user/day).
2. Convert to **average QPS**: `DAU × requests/user/day ÷ 86,400`.
3. Estimate **peak QPS** — usually 2–5× average, depending on how spiky traffic is.
4. Estimate **storage**: `records/day × size/record × retention period`.
5. Estimate **bandwidth**: `QPS × average payload size`.

## Example: a URL shortener

- 100M new short URLs created per month → ~40 writes/sec average.
- 100:1 read:write ratio (people click far more than they create) → ~4,000 reads/sec average.
- Each record ~500 bytes → 100M × 500B ≈ 50 GB/month, or ~600 GB/year before any
  cleanup — cheap to store, but tells you an index needs to fit comfortably in memory
  for low-latency redirects.

## Numbers worth memorizing

- L1 cache reference: ~1 ns · Main memory reference: ~100 ns
- Round trip within same datacenter: ~0.5 ms · Cross-region round trip: ~50–150 ms
- Reading 1 MB sequentially from SSD: ~1 ms · From spinning disk: ~20 ms

These orders of magnitude matter more than the exact figures — they tell you *where*
your latency budget is going to be spent.
