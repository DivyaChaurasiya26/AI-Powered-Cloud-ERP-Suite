# ADR-0002: Stateless JWT auth over Keycloak/OIDC SSO

## Status
Accepted, with a documented gap

## Context
Enterprise ERP buyers expect SAML/OIDC SSO against their existing
identity provider (Azure AD, Okta, Google Workspace) plus enforced MFA.
Standing up Keycloak (or an equivalent IdP) means running and
maintaining an additional stateful service, configuring a realm per
tenant, and building the OIDC redirect/callback flow on both the API
and the SPA.

## Decision
Auth is a self-contained `jsonwebtoken` + `bcryptjs` implementation:
`POST /api/auth/register` creates a user under a tenant, `POST
/api/auth/login` returns an HS256 JWT (`{ id, role, tenantId }`,
1-day expiry) that the SPA stores in `localStorage` and attaches as
`Authorization: Bearer <token>`.

## Rationale
- **No IdP dependency for local dev or the demo environment.** A
  grader or new contributor can register a tenant and log in with zero
  external accounts or realm configuration.
- **Tenant isolation is enforced at the data layer regardless of the
  auth front door** — every controller scopes queries by
  `tenantId` from the decoded token, so swapping the token issuer later
  (JWT → OIDC-issued JWT) would not require touching the authorization
  logic, only the login/callback endpoints.
- **CSRF is structurally not a concern** with bearer-token auth (see
  `SECURITY.md`), which removes an entire class of middleware
  (`csurf`, double-submit cookies) that a cookie-session-based OIDC
  flow would need.

## Update — TOTP-based MFA added
A second factor was added without touching this decision: `POST
/api/auth/login` now returns `{ mfaRequired: true, mfaToken }` (a
5-minute, purpose-scoped JWT) instead of a session token when the user
has MFA enabled, and `POST /api/auth/mfa/verify-login` exchanges a
TOTP code plus that token for the real session JWT. `authMiddleware`
explicitly rejects any token carrying `purpose: "mfa_pending"`, so a
captured pre-auth token can't be used against a real route even if the
attacker never has the second factor. TOTP itself (RFC 6238) is
implemented directly against Node's `crypto` module
(`modules/auth/services/totp.service.ts`) — no external dependency —
so it works with any standard authenticator app (Google Authenticator,
Authy, 1Password, …). This closes the "no MFA" half of the gap below
without requiring an IdP; SSO/federation is still open.

## Consequences — the gap this creates
- **No SSO.** A tenant still cannot federate identity to their own
  IdP (Azure AD, Okta, Google Workspace) — that half of the original
  gap stands; only the "no MFA" half has been closed (see the update
  above).
- **No first-user bootstrap flow.** Creating a tenant requires an
  `ADMIN`, but creating a user (including the first one) requires an
  existing tenant, and `POST /api/tenant` is itself gated behind
  `roleMiddleware(["ADMIN"])`. In practice the first tenant + admin
  user for a fresh database has to be seeded directly (see the
  onboarding note in the main README) rather than through the API —
  this should be resolved with either an open "bootstrap" endpoint
  guarded by an environment flag, or an invite-token flow.
- **Token revocation is time-based only.** There is no server-side
  session to invalidate — a compromised token is valid until its
  1-day expiry regardless of password rotation. Adding a Redis-backed
  denylist (already have Redis in the stack) is the natural next step
  if this becomes a real requirement before an OIDC migration.
