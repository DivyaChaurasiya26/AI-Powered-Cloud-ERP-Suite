# Architecture Decision Records

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-mongodb-over-postgres.md) | MongoDB + Mongoose over PostgreSQL + Prisma | Accepted |
| [0002](0002-jwt-over-oidc-sso.md) | Stateless JWT auth over Keycloak/OIDC SSO | Accepted; MFA added, SSO gap remains |
| [0003](0003-vite-react-spa-over-nextjs.md) | Vite + React SPA over Next.js | Accepted, documented gap |
| [0004](0004-bullmq-redis-for-async-work.md) | BullMQ + Redis for async work | Accepted |
| [0005](0005-hash-chained-audit-log.md) | Hash-chained mutation log for F-09 | Accepted |

Each ADR follows the same shape: **Status**, **Context** (the forces at
play), **Decision**, **Rationale**, and **Consequences** — including
the honest cost of the choice, not just its benefits.
