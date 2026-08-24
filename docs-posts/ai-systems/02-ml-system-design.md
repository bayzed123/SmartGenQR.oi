# ML System Design
Designing a production ML system is really designing *two* connected systems: the
**training pipeline** that produces a model, and the **serving pipeline** that uses it.

## Training pipeline

- **Data ingestion & feature engineering** — raw data → cleaned, joined, transformed
  features. Increasingly centralized in a **feature store**, so training and serving
  compute features the same way (avoiding "training/serving skew," a classic source of
  silent production bugs).
- **Training infrastructure** — often distributed across many machines/GPUs; needs
  checkpointing so a multi-hour (or multi-week) job can resume after a failure rather
  than restart from scratch.
- **Evaluation** — offline metrics against a held-out dataset, *before* a model is
  considered for deployment.

## Serving pipeline

- **Online vs. batch inference** — online serves individual requests in real time
  (needs low latency); batch scores a large dataset periodically (optimizes for
  throughput/cost, not per-request latency). Many products need both — e.g. batch-
  precompute recommendations nightly, with a lightweight online model for real-time
  re-ranking.
- **Feature freshness** — the serving path needs the *same* features the model was
  trained on, computed consistently — often the single biggest source of "it worked in
  training but not production" bugs.
- **Model versioning & rollback** — treat model deployments like code deployments:
  canary a new model on a small percentage of traffic, monitor, and be able to roll
  back quickly.

## Monitoring: the part that's genuinely different from normal systems

Beyond the usual latency/error-rate monitoring, ML systems need to watch for:

- **Data drift** — the distribution of incoming requests diverging from training data.
- **Model/quality drift** — output quality degrading over time even with no code
  change, because the world the model was trained on has shifted.

Without this, an ML system can fail silently — serving confidently wrong predictions
with no error or exception to alert on.
