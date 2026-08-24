# LLM System Design
Serving large language models is a specific, demanding flavor of [ML System
Design](02-ml-system-design.md), driven by how transformer inference actually works.

## Why LLM serving is expensive

Generating each output token requires a full forward pass through the model, and
depends on all previous tokens (via a growing **KV cache** — the cached key/value
attention state for every prior token). This makes inference cost roughly proportional
to both model size *and* sequence length, and makes it fundamentally sequential per
request.

## The core levers

- **Batching.** Grouping multiple requests' forward passes together dramatically
  improves GPU utilization/throughput — but requests inevitably finish at different
  lengths, so **continuous/dynamic batching** (adding new requests into a batch as
  others complete, rather than waiting for a fixed batch to finish entirely) is what
  modern serving systems actually use.
- **KV-cache management.** The KV cache grows with sequence length and must be kept in
  GPU memory for the duration of a request — memory, not compute, is often the binding
  constraint on how many concurrent requests a GPU can serve. Techniques like paged
  attention manage this cache more like virtual memory, reducing fragmentation.
- **Quantization.** Running the model at lower numerical precision (e.g. 8-bit or
  4-bit instead of 16/32-bit) trades a small amount of quality for significantly less
  memory and often faster inference — a common lever for fitting bigger models on
  fixed hardware.
- **Streaming responses.** Returning tokens to the client as they're generated (rather
  than waiting for the full response) dramatically improves *perceived* latency, even
  though total generation time is unchanged.

## Cost and latency are the same design axis

Almost every LLM serving decision is a point on a cost/latency/throughput trade-off
curve — bigger batches improve throughput but increase per-request latency; a smaller/
quantized model is cheaper and faster but lower quality. Being explicit about which of
these you're optimizing for (and why) is the core of this design space.
