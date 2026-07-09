# ADR-0003: Vite + React SPA over Next.js

## Status
Accepted, with a documented gap

## Context
The API is a stateless JSON REST service behind JWT auth — there is no
SEO surface to render server-side, and every page requires
authentication before it can render anything meaningful. Next.js's
core value proposition (SSR/SSG for fast first paint and crawlable
pages) doesn't apply to an authenticated internal business app in the
same way it would to a marketing site or public storefront.

## Decision
`apps/web` is a plain Vite 6 + React 18 single-page app, talking to the
API over `/api` (proxied to `http://localhost:5000` in dev via
`vite.config.ts`, same-origin in the Docker/K8s builds).

## Rationale
- **Faster iteration loop.** Vite's dev server and HMR are near-instant
  for a project this size; Next.js's App Router adds a build/runtime
  layer (server components, route handlers, middleware) that buys
  nothing here since every route is client-rendered post-auth anyway.
- **Simpler deployment shape.** The Vite build is static output served
  by a plain nginx container (see `apps/web/Dockerfile` and the `web`
  service in `docker-compose.yml` / Helm chart) — no Node runtime
  needed in production for the frontend at all.
- **Matches the actual auth model.** `ProtectedRoute` in `App.tsx`
  redirects to `/login` client-side when there's no user in context;
  there is no page that needs to render before auth resolves, so SSR
  would mostly be rendering a loading state.

## Consequences
- **This is the largest functional gap in the whole system.** The
  backend ships ten-plus modules (HR, Payroll, Finance, Inventory,
  Projects, Notifications, Anomaly, Approvals, Dashboard, Audit) but,
  as of this ADR, the SPA only had screens for four of them
  (Login, Dashboard, Anomalies, Approvals) — the rest had a fully
  working API with zero UI. HR, Payroll, Finance, Inventory, Projects,
  Notifications, and Audit screens were added afterward to close that
  gap; any *future* backend module should ship its frontend screen in
  the same change, not as a follow-up.
- **No offline/installable behavior out of the box** — unlike a
  Next.js app with `next-pwa`, a bare Vite SPA needs its own manifest
  and service worker (see `apps/web/public/sw.js` and
  `manifest.webmanifest`, added specifically to close this gap).
- **No built-in image optimization, streaming, or edge rendering** —
  none of which this app currently needs, but worth naming as the
  actual cost of not being on Next.js if the product direction changes
  toward public-facing pages.
