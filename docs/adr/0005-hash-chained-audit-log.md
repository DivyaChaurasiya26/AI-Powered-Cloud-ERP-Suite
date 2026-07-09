# ADR-0005: Hash-chained mutation log instead of a general audit framework

## Status
Accepted

## Context
F-09 in the project spec calls for "immutable audit trail for all
mutations" with "tamper-evident logs" and GDPR data-subject-request
support. A full audit framework (e.g. Mongoose change-stream capture,
or a CDC pipeline into a separate audit store) is the "correct" answer
at real scale, but is a lot of new infrastructure for what this system
actually needs right now: a way to answer "who changed what, and can
we prove the log itself wasn't edited after the fact."

## Decision
A single Express middleware (`auditLogger`, registered once in
`app.ts` ahead of all routes) listens for `res.on("finish")` on every
`POST`/`PUT`/`PATCH`/`DELETE` request (excluding `/api/auth/*`), and
writes one `AuditLog` document per request: tenant, user, method,
path, status code, and a redacted copy of the request body. Each
document also stores `hash` = `sha256(entry fields + previousHash)`
and `previousHash` = the prior entry's hash for that tenant — a simple
hash chain, not a general framework.

`GET /api/audit-log/chain-status` recomputes every hash in sequence
and reports the first entry where the recomputed hash doesn't match
what's stored, which would happen if a document were edited or
deleted out of order.

## Rationale
- **Zero per-route changes.** Because it hooks `res.on("finish")`
  globally rather than wrapping individual controllers, every existing
  and future mutation is covered automatically — nobody has to
  remember to call `audit.log(...)` inside a new controller.
- **Tamper-evidence without a blockchain-shaped solution.** The hash
  chain is the same idea Git commits or a Merkle chain use: you don't
  need a distributed ledger to detect that row N was altered — you
  just need row N+1's hash to depend on row N's content.
- **Redaction happens at write time, not read time** — `password`,
  `token`, `secret` fields are stripped from the logged body before
  the hash is even computed, so there's no window where sensitive data
  sits in the audit collection.

## Consequences
- **The chain proves tampering happened, it doesn't prevent it.**
  Anyone with direct database access can still delete or edit rows;
  `verifyChain()` only lets you *detect* that afterward. A genuinely
  tamper-*proof* log would need to ship the hash chain to an
  external, less-privileged system (e.g. append the running hash to a
  separate log service or object storage with object-lock) — noted as
  a follow-up, not implemented.
- **Read access isn't logged**, only mutations — satisfies the letter
  of F-09 ("audit trail for all mutations") but not a "who viewed this
  record" requirement, which some compliance regimes also want.
- **GDPR erasure and the audit log are in tension by design.**
  `POST /api/audit-log/gdpr/erase` anonymizes the `User` document
  (name/email) but deliberately does **not** delete that user's prior
  `AuditLog` entries — doing so would break the hash chain for every
  entry after it. This is the same soft-delete trade-off the rest of
  the schema already makes (see `SECURITY.md`'s mass-assignment note),
  applied consistently rather than special-cased for audit rows.
