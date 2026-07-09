# Deploying to Render

`render.yaml` at the repo root defines three services — `erp-api`,
`erp-redis`, and `erp-web` — as a single Render Blueprint. This is the
closest thing to a "one-command deploy" without giving up control over
secrets: Render can't know your MongoDB URI or a JWT signing secret in
advance, so those two steps stay manual.

**Honesty check on this guide:** it was written against Render's
documented Blueprint format, but wasn't test-deployed against a live
Render account in this session — that would need account credentials
this environment doesn't have. If a field name has changed since, Render's
UI will tell you when it parses the blueprint; the fix is almost always a
one-line rename, not a redesign.

## Prerequisites

- A GitHub (or GitLab) remote for this repo — Render deploys from a connected repo, not a local zip.
- A MongoDB Atlas cluster (or any reachable MongoDB) with its connection string, and Network Access set to allow `0.0.0.0/0` — Render's free-tier egress IPs aren't static, so a fixed IP allowlist entry won't work.
- A Render account (free to create, no credit card required for the web-service tiers used here as of writing — verify current pricing before assuming).

## Steps

1. **Push this branch** to GitHub if you haven't already.

2. **Render dashboard → New → Blueprint** → select this repo → Render reads `render.yaml` and shows all three services it's about to create. Click **Apply**.

3. Render assigns `erp-api` a URL like `https://erp-api-ab12.onrender.com`. Once it's deployed:
   - Go to `erp-web` → **Environment** → set `VITE_API_BASE_URL` to `https://erp-api-ab12.onrender.com/api` (note the `/api` suffix) → save, which triggers a rebuild (this is a build-time variable, not read at runtime).

4. Render assigns `erp-web` a URL like `https://erp-web-cd34.onrender.com`. Once you have it:
   - Go to `erp-api` → **Environment** → set `ALLOWED_ORIGINS` to `https://erp-web-cd34.onrender.com` (no path, no trailing slash — this is matched against the browser's `Origin` header) → save.

5. Go to `erp-api` → **Environment** → set `MONGO_URI` to your Atlas connection string → save. `JWT_SECRET` and `REDIS_URL` are already filled in automatically (generated, and linked from the `erp-redis` service).

6. Once `erp-api` redeploys, seed the first tenant + admin user — there is currently no bootstrap endpoint for this (see `docs/adr/0002-jwt-over-oidc-sso.md`), so it has to be done directly against the database. From your own machine, with `MONGO_URI` pointed at the same Atlas cluster:
   ```bash
   cd apps/api
   MONGO_URI="<your atlas uri>" node -e "
     require('dotenv').config();
     const mongoose = require('mongoose');
     const bcrypt = require('bcryptjs');
     const { Tenant } = require('./dist/modules/auth/models/tenant.model');
     const { User } = require('./dist/modules/auth/models/user.model');
     (async () => {
       await mongoose.connect(process.env.MONGO_URI);
       const tenant = await Tenant.create({ companyName: 'Acme Corp', email: 'acme@erp.local' });
       const hashed = await bcrypt.hash('ChangeMe123!', 10);
       await User.create({ tenantId: tenant._id, name: 'Admin', email: 'admin@erp.local', password: hashed, role: 'ADMIN' });
       console.log('Seeded. Log in with admin@erp.local / ChangeMe123!');
       await mongoose.disconnect();
     })();
   "
   ```
   (Run `npm run build` first so `dist/` exists.) Change the password immediately after first login.

7. Open the `erp-web` URL and log in.

## What isn't included here

- **`apps/ml-service`** (Prophet/LSTM forecasting) isn't in this blueprint — the current frontend doesn't call it yet (F-06 is backend-only, see the deliverables audit), so it wasn't worth the extra service + Python buildpack complexity until there's a UI driving it. Add it as a fourth `env: docker` service pointed at `apps/ml-service/Dockerfile` when that UI exists.
- **A custom domain + TLS** — Render provisions a free subdomain and TLS certificate automatically; adding your own domain is a DNS step in Render's dashboard, not something this blueprint needs to handle.
- **Kubernetes/Helm** — `k8s/` and `helm/` already describe a cluster deployment for when you outgrow a single Render region; this guide is the fast path, not a replacement for those.
