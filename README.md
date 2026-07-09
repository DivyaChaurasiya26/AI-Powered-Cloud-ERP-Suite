# 🚀 AI-Powered Cloud ERP Suite

Enterprise Resource Planning (ERP) platform built with modern cloud-native architecture, DevOps practices, and AI-powered demand forecasting.

---

## 📌 Project Overview

AI-Powered Cloud ERP Suite is a scalable ERP platform designed to manage core business operations through integrated modules including:

* Human Resource Management
* Payroll Management
* Inventory & Procurement
* Finance Management
* Project Management
* Notifications & Event Processing
* AI Demand Forecasting
* AI Anomaly Detection
* Intelligent Approval Workflows
* Business Intelligence Dashboard (API + React frontend)

The system combines enterprise software engineering practices with machine learning capabilities to improve operational efficiency and business decision-making.

---

# 🏗 System Architecture

```text
┌─────────────────────────────┐
│         Frontend UI         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Node.js API Layer     │
│       Express + TS          │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
 MongoDB Atlas      AI Service
                     Prophet
                     LSTM
       ▼
 Notifications
 Redis / BullMQ
       ▼
 Monitoring
 Prometheus
```

---

# 🛠 Technology Stack

## Backend

* Node.js
* Express.js
* TypeScript

## Frontend

* React
* Vite
* React Router

## Database

* MongoDB Atlas
* Mongoose

## Machine Learning

* Python
* Prophet
* LSTM
* NumPy
* Pandas

## DevOps

* Docker
* Docker Compose
* GitHub Actions
* Kubernetes
* Helm

## Monitoring

* Prometheus

---

# 📂 Project Structure

```text
AI-Powered-Cloud-ERP-Suite
│
├── apps
│   ├── api
│   ├── ml-service
│   └── web
│
├── docs
│   └── adr          # Architecture Decision Records
│
├── helm
│
├── k8s
│
├── monitoring
│
├── .github
│   └── workflows
│
├── docker-compose.yml
│
├── README.md
│
└── SECURITY.md
```

---

# 🗂 Architecture Decision Records

Key architecture trade-offs (MongoDB vs. Postgres, JWT vs. OIDC SSO,
Vite SPA vs. Next.js, BullMQ/Redis for async work, the hash-chained
audit log) are written up as ADRs in [`docs/adr/`](docs/adr/README.md)
— each one states the decision, the reasoning, and the honest
consequences/gaps it creates, not just the upside.

---

# 📖 API Documentation

An OpenAPI 3.1 spec covering every route is served at `/api-docs`
(interactive Redoc UI) and `/api/openapi.json` (raw spec) once the API
is running.

---

# ✨ Features

## 🔐 Authentication & Authorization

* JWT Authentication
* TOTP-based two-factor authentication (any authenticator app — Google Authenticator, Authy, 1Password…), self-service setup/disable under Audit & Compliance → Security
* Role-Based Access Control (RBAC)
* Multi-Tenant Support

---

## 👨‍💼 Human Resource Management

* Employee Management
* Attendance Tracking
* Leave Management

---

## 💰 Payroll Management

* Payroll Processing
* Payslip Generation
* Payroll Auditing

---

## 📦 Inventory & Procurement

* Inventory Tracking
* Goods Receipt
* Purchase Orders
* Vendor Management

---

## 💳 Finance Module

* Accounts Payable
* Accounts Receivable
* Journal Entries
* Vendor Payments
* Vendor Invoices

---

## 📋 Project Management

* Projects
* Tasks
* Milestones

---

## 🔔 Notification System

* Email Notifications
* Webhook Notifications
* Event Driven Architecture

---

## 🤖 AI Forecasting Engine

### Prophet Forecasting

* Demand Forecasting
* Trend Analysis
* Inventory Planning

### LSTM Forecasting

* Deep Learning Predictions
* Time Series Forecasting
* Future Demand Estimation

---

## 🚨 AI Anomaly Detection

* Statistical outlier detection (z-score + IQR) on vendor payments and inventory movements
* Severity scoring (LOW / MEDIUM / HIGH) with tenant-scoped review workflow
* Real-time detection on transaction creation, plus a scheduled daily scan job
* High-severity flags trigger notifications to tenant admins

---

## ✅ Intelligent Approvals

* Rule + risk-score engine (transaction amount, linked anomaly flags) for vendor payments
* Low-risk transactions auto-approve and process immediately
* High-risk transactions route to a pending queue for admin approval/rejection
* Full audit trail (risk score, risk factors, decision, decided-by, timestamps)

---

## 🛡 Audit & Compliance

* Tenant-wide, append-only audit trail for every mutation (`POST`/`PUT`/`PATCH`/`DELETE`) across every module
* Hash-chained log entries — `GET /api/audit-log/chain-status` recomputes and verifies the chain to detect tampering
* GDPR self-service: `GET /api/audit-log/gdpr/export` (Art. 15/20 data export) and `POST /api/audit-log/gdpr/erase` (Art. 17 right to erasure)

---

## 📲 Progressive Web App

* Installable (`manifest.webmanifest`) with an offline-capable app shell
* Service worker (`apps/web/public/sw.js`) caches the shell and the last-seen response for GET API reads, so the dashboard still renders (with stale data) when offline

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/Raghava005/AI-Powered-Cloud-ERP-Suite.git
cd AI-Powered-Cloud-ERP-Suite
```

---

## Install Dependencies

```bash
pnpm install
```

---

## Backend Setup

```bash
cd apps/api
pnpm install
pnpm build
```

---

## ML Service Setup

```bash
cd apps/ml-service

pip install -r requirements.txt
```

---

## Frontend Setup

```bash
cd apps/web
pnpm install
pnpm dev
```

---

# 🧪 Testing

```bash
# API — Jest + Supertest + mongodb-memory-server
pnpm --filter api test

# ML service — pytest
cd apps/ml-service
pip install -r requirements-dev.txt
pytest
```

---

# 🔧 Environment Variables

```env
PORT=5000

MONGO_URI=<mongodb_atlas_connection_string>

JWT_SECRET=<jwt_secret>

REDIS_HOST=localhost

REDIS_PORT=6379

NODE_ENV=production
```

---

# 🚀 Fastest Path to a Live URL

`render.yaml` at the repo root is a Render Blueprint — it provisions the
API, Redis, and the web frontend as one deploy. See
[`docs/deploy/render.md`](docs/deploy/render.md) for the full walkthrough
(two manual steps: your MongoDB URI, and wiring the two services'
generated URLs together after the first deploy).

---

# 🐳 Docker Deployment

Build Containers

```bash
docker-compose build
```

Start Containers

```bash
docker-compose up
```

---

# ☸ Kubernetes Deployment

Manifests target a local-images setup (no external registry, no ingress controller assumed) — build the three app images and load them into your cluster first:

```bash
docker build -t erp-api:local apps/api
docker build -t erp-ml:local apps/ml-service
docker build -t erp-web:local apps/web

# e.g. on kind:
kind load docker-image erp-api:local erp-ml:local erp-web:local
```

Copy the secret template and fill in real values (`k8s/secret.yaml` is gitignored — never commit real secrets):

```bash
cp k8s/secret.example.yaml k8s/secret.yaml
# edit k8s/secret.yaml: set MONGO_URI and JWT_SECRET
```

Apply:

```bash
kubectl apply -f k8s/configmap.yaml -f k8s/secret.yaml -f k8s/deployment.yaml -f k8s/service.yaml
```

Check Pods

```bash
kubectl get pods
```

Reach the dashboard — it's a `NodePort` Service (no Ingress configured yet):

```bash
kubectl port-forward svc/web 8080:8080
```

---

# ⎈ Helm Deployment

Install Helm Chart — pass secrets at install time rather than committing them to `values.yaml`:

```bash
helm install erp-suite ./helm \
  --set secrets.mongoUri="<your MONGO_URI>" \
  --set secrets.jwtSecret="$(openssl rand -hex 64)"
```

Upgrade Deployment

```bash
helm upgrade erp-suite ./helm
```

---

# 📊 Monitoring

Prometheus configuration is available in:

```text
monitoring/prometheus.yml
```

It scrapes the API's `GET /metrics` endpoint (Node.js process/runtime metrics via `prom-client`). `GET /health` is also exposed, unauthenticated, for Kubernetes liveness/readiness probes.

Used for:

* Metrics Collection
* Service Monitoring
* Observability

Grafana, Loki, and OpenTelemetry are not yet wired up — Prometheus scraping is the current extent of the observability stack.

---

# 🔄 CI/CD Pipeline

GitHub Actions workflow automates:

* Build Validation
* Dependency Checks
* Docker Verification
* CI Pipeline Execution

Workflow Location:

```text
.github/workflows
```

---

# 🌐 Live Demo

GitHub Pages:

https://raghava005.github.io/AI-Powered-Cloud-ERP-Suite/

---

# 📁 Repository

GitHub Repository:

https://github.com/Raghava005/AI-Powered-Cloud-ERP-Suite

---

# 🎯 Key Learning Outcomes

* Enterprise Application Development
* Cloud-Native Architecture
* Microservice Design Principles
* Machine Learning Integration
* Docker Containerization
* Kubernetes Orchestration
* Helm Packaging
* Monitoring & Observability
* CI/CD Automation

---

# 👨‍💻 Author

Raghava

AI-Powered Cloud ERP Suite

Internship Project Submission
