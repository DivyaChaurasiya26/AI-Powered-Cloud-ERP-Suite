# ADR-0001: MongoDB + Mongoose over PostgreSQL + Prisma

## Status
Accepted

## Context
ERP domains are usually modeled as relational: invoices reference vendors,
payroll references employees, journal entries reference accounts. A
relational store with a schema-enforcing ORM (Postgres + Prisma) is the
conventional choice, and is what larger ERP RFPs typically specify.

## Decision
This project uses MongoDB Atlas with Mongoose instead. The domain is
still modeled relationally at the *application* layer — every document
carries explicit `ObjectId` references (`tenantId`, `employeeId`,
`vendorId`, `invoiceId`, …) and controllers join across collections in
application code rather than relying on foreign keys.

## Rationale
- **Schema evolution speed.** The project added modules weekly (HR →
  Payroll → Inventory → Finance → Projects → Notifications → Anomaly →
  Approvals). Mongoose schemas let each module ship independently
  without a shared migration file blocking the others.
- **Mongoose's built-in validation** (`required`, `enum`, `unique`)
  covers the same constraints a relational schema would enforce at the
  column level, just declared in TypeScript next to the rest of the
  module instead of in SQL migrations.
- **Team familiarity** — the existing codebase (auth, tenant model) was
  already Mongoose-based before this became a multi-module system;
  switching mid-project to Postgres/Prisma would mean rewriting every
  model and every controller's query layer for no functional gain at
  this scale.

## Consequences
- **No enforced referential integrity.** Deleting a `Vendor` does not
  cascade or block if `VendorInvoice` documents still reference it.
  Controllers are responsible for checking existence (most do, via
  `findOne({ _id, tenantId })` before acting).
- **Aggregation pipelines need explicit `ObjectId` casting.** Unlike
  `.find()`, Mongoose's `$match` in an aggregation stage does not
  auto-cast a string `tenantId` (e.g. one pulled straight off a decoded
  JWT) to `ObjectId`. This caused a real bug — every dashboard KPI
  silently matched zero documents until `kpi.service.ts` was fixed to
  cast explicitly. Any new aggregation pipeline must do the same.
- **Multi-document transactions** are possible (Mongo supports them)
  but unused here — cross-collection consistency (e.g. paying an
  invoice + writing a ledger entry) is currently sequential, not
  wrapped in a session/transaction. A future hardening pass should
  address this for the money-movement paths specifically (AP/AR
  payment, payroll runs).
