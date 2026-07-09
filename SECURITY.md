# Security Policy

## Secrets Rotation Plan

| Secret | Location | Rotation Frequency | Rotation Procedure |
|---|---|---|---|
| `JWT_SECRET` | `.env` / hosting env vars | Every 90 days | Generate new secret with `openssl rand -hex 64`, update env, redeploy, existing tokens expire within 1 day (JWT `expiresIn: "1d"`) |
| `MONGO_URI` | `.env` / hosting env vars | On personnel change | Rotate MongoDB Atlas password, update env, redeploy |
| `EMAIL_PASS` | `.env` / hosting env vars | Every 180 days | Revoke Gmail app password, generate new one, update env |
| `REDIS_URL` | `.env` / hosting env vars | On personnel change | Rotate Redis `AUTH` password, update env |
| `WEBHOOK_SECRET` | `.env` / hosting env vars | Every 90 days | Generate new secret with `openssl rand -hex 32`, update env, notify webhook consumers |
| `SNYK_TOKEN` | GitHub Secrets | Every 180 days | Revoke in Snyk dashboard, generate new service account token |

## No Committed Secrets Audit

TruffleHog runs on every push and pull request via `.github/workflows/security.yml`.

To run locally before committing:
```bash
docker run --rm -v "$(pwd):/pwd" trufflesecurity/trufflehog:latest \
  git file:///pwd --only-verified
```

`.env` is listed in `.gitignore` and must never be committed. `.env.example` contains only placeholder values.

## CSRF Assessment

**CSRF protection is not required for this API.**

This API uses stateless JWT authentication via the `Authorization: Bearer <token>` HTTP header. Browsers never automatically attach `Authorization` headers to cross-origin requests — this is browser-enforced behavior that cannot be bypassed by an attacker. CSRF attacks exploit automatic credential attachment (cookies, Basic Auth), which this API does not use.

Mitigation in place: `cors()` is configured with an origin allowlist via `ALLOWED_ORIGINS` environment variable, preventing cross-origin requests from unauthorized domains entirely.

Reference: OWASP CSRF Prevention Cheat Sheet — "Verifying Same Origin with Standard Headers" and "Using Custom Request Headers".

## XSS Strategy

This API returns JSON only. No HTML is rendered server-side. XSS risk is mitigated by:

1. **Content-Security-Policy header** set by Helmet: `default-src 'none'` prevents any script execution in contexts where the response might be rendered.
2. **X-Content-Type-Options: nosniff** prevents MIME-type sniffing from treating JSON as HTML.
3. No user-supplied content is reflected into HTML responses.

DOMPurify is a browser-side sanitizer not applicable to a backend API. If a frontend is added, DOMPurify should be applied to all user-supplied content rendered as HTML.

## Mass Assignment Accepted Risk

Controllers use `{ ...req.body, tenantId: user.tenantId }` on create operations. The `tenantId` override is always placed **after** the spread, ensuring the authenticated user's tenant cannot be overridden. This pattern is consistent across all create operations and matches the project's established convention.

On update operations using `findOneAndUpdate`, the WHERE clause always includes `tenantId: user.tenantId`, ensuring cross-tenant mutation is impossible regardless of what fields are in `req.body`.

This risk is accepted and documented. A future enhancement could add an explicit field allowlist per endpoint.

## Dependency Scanning

Snyk runs on every push to `main` via `.github/workflows/security.yml`, once a `SNYK_TOKEN` repository secret is configured — it requires an account token that isn't provisioned by default, so the job skips cleanly (rather than failing CI) until one is added. To run locally:
```bash
npx snyk test --severity-threshold=high
```

## Container Scanning

Trivy scans the built Docker image on every push via `.github/workflows/security.yml`. To run locally:
```bash
docker build -t erp-api:local apps/api/
trivy image --severity HIGH,CRITICAL erp-api:local
```