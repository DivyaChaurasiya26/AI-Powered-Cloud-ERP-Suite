# ADR-0004: BullMQ + Redis for async work, not a separate broker

## Status
Accepted

## Context
Several operations shouldn't block the HTTP request/response cycle:
payroll runs (gross-to-net calculation across a batch of employees),
email/webhook delivery, low-stock reorder alerts, weekly forecast
retraining, anomaly-triggered notifications, and scheduled BI report
generation. These need retries, backoff, and (ideally) visibility into
failures.

## Decision
Every async workflow is a BullMQ queue backed by the same Redis
instance already used for the rate limiter and KPI cache:
`payroll.queue`, `email.queue`, `webhook.queue`, `reorder.queue`,
`forecasting.queue`, `report.queue`. Each has a dedicated worker
process (`worker:payroll`, `worker:reorder`, `worker:forecasting`,
`worker:reports`, `worker:anomaly` in `apps/api/package.json`), run as
separate containers/processes from the API server itself.

## Rationale
- **One piece of infrastructure, not two.** Redis is already required
  for the rate limiter (`RateLimiterMemory` today, but the
  `ioredis`-backed client in `config/redis.ts` is there for this
  purpose) and KPI caching — reusing it for queues avoids introducing
  Kafka/RabbitMQ for a workload that's genuinely low-throughput
  (payroll runs for hundreds of employees, not millions of events/sec).
- **Retry semantics come for free.** `attempts: 3` with exponential
  backoff is a two-line option object in BullMQ, versus hand-rolled
  retry logic against a raw Redis list.
- **Workers scale independently of the API.** A payroll run for a
  large tenant shouldn't compete for the same process's event loop as
  incoming HTTP requests — splitting workers into their own processes
  (and, in the Helm chart, their own deployments) means a slow queue
  job never adds latency to `/api/dashboard/kpis`.

## Consequences
- **No dead-letter visibility in production today.** Bull Board (the
  queue-inspection UI) is wired up in `app.ts` but commented out
  pending an admin-auth decision — re-enabling it behind
  `roleMiddleware(["ADMIN"])` is a small, contained follow-up.
- ~~`config/redis.ts` returns `null` when `NODE_ENV=production`~~ —
  **fixed.** It previously disabled Redis entirely in production ("
  Disable Redis on Render" — a deployment-target-specific workaround
  that would have silently no-op'd every BullMQ queue on any real
  deploy). It now prefers a single `REDIS_URL` connection string (what
  Render/Upstash/Railway hand out) and falls back to `REDIS_HOST`/
  `REDIS_PORT` for local docker-compose — Redis is only unavailable if
  neither is configured, which no longer happens in this repo's own
  deploy targets. See `render.yaml` and `docs/deploy/render.md`.
- **Redis is a single point of failure for every async workflow**,
  not just caching. Losing Redis stops payroll runs, notifications,
  and reorder alerts simultaneously. A managed Redis with persistence
  (AOF) is a prerequisite before this goes further than a demo.
