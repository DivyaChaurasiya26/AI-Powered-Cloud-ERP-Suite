import express from "express";
import cors from "cors";
import helmet from "helmet";

// Security middleware
import { rateLimiter, authRateLimiter } from "./middleware/rateLimiter.middleware";

// Auth middleware (used for Bull Board protection)
import { authMiddleware } from "./modules/auth/middleware/auth.middleware";
import { roleMiddleware } from "./modules/auth/middleware/role.middleware";

// Auth & Tenant
import authRoutes from "./modules/auth/routes/auth.routes";
import tenantRoutes from "./modules/auth/routes/tenant.routes";

// HR
import employeeRoutes from "./modules/hr/routes/employee.routes";
import attendanceRoutes from "./modules/hr/routes/attendance.routes";
import leaveRoutes from "./modules/hr/routes/leave.routes";

// Payroll
import payrollRoutes from "./modules/payroll/routes/payroll.routes";
import payrollEngineRoutes from "./modules/payroll/routes/payrollEngine.routes";
import payrollAuditRoutes from "./modules/payroll/routes/payrollAudit.routes";
import payslipRoutes from "./modules/payroll/routes/payslip.routes";

// Inventory & Procurement
import inventoryRoutes from "./modules/inventory/routes/inventory.routes";
import purchaseOrderRoutes from "./modules/inventory/routes/purchaseOrder.routes";
import goodsReceiptRoutes from "./modules/inventory/routes/goodsReceipt.routes";
import inventoryIssueRoutes from "./modules/inventory/routes/inventoryIssue.routes";
import vendorRoutes from "./modules/procurement/routes/vendor.routes";

// AI Forecasting
import forecastingRoutes from "./modules/forecasting/routes/forecasting.routes";

// Finance
import apRoutes from "./modules/finance/routes/ap.routes";
import arRoutes from "./modules/finance/routes/ar.routes";
import fxRoutes from "./modules/finance/routes/fx.routes";
import journalRoutes from "./modules/finance/routes/journal.routes";
import periodRoutes from "./modules/finance/routes/period.routes";
import vendorInvoiceRoutes from "./modules/finance/routes/vendorInvoice.routes";
import vendorPaymentRoutes from "./modules/finance/routes/vendorPayment.routes";

// Day 17 — BI Dashboard
import dashboardRoutes from "./modules/dashboard/routes/dashboard.routes";

// Day 18 — Project Management
import projectRoutes from "./modules/projects/routes/project.routes";
import taskRoutes from "./modules/projects/routes/task.routes";
import milestoneRoutes from "./modules/projects/routes/milestone.routes";

// Day 19 — Notifications
import notificationRoutes from "./modules/notifications/routes/notification.routes";
import "./modules/notifications/services/notification.service"; // registers eventBus listener

// Anomaly Detection & Intelligent Approvals
import anomalyRoutes from "./modules/anomaly/routes/anomaly.routes";
import approvalsRoutes from "./modules/approvals/routes/approvals.routes";

// Audit Log & GDPR (F-09)
import auditRoutes from "./modules/audit/routes/audit.routes";
import { auditLogger } from "./modules/audit/middleware/auditLogger.middleware";

// Health & Metrics
import { metricsRegistry } from "./config/metrics";

// API docs (F-11)
import { serveApiDocs } from "./config/openapi";

// Bull Board
//import { createBullBoard } from "@bull-board/api";
//iimport { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
//iimport { ExpressAdapter } from "@bull-board/express";
//iimport { emailQueue } from "./modules/notifications/queues/email.queue";
//iimport { webhookQueue } from "./modules/notifications/queues/webhook.queue";
//iimport { payrollQueue } from "./modules/payroll/queues/payroll.queue";
//iimport { reorderQueue } from "./modules/inventory/queues/reorder.queue";
//iimport { reportQueue } from "./modules/dashboard/queues/report.queue";
//iimport { forecastingQueue } from "./modules/forecasting/queues/forecasting.queue";

// ── Bull Board setup ──────────────────────────────────────────────────────
//const serverAdapter = new ExpressAdapter();
//serverAdapter.setBasePath("/admin/queues");
//createBullBoard({
//  queues: [
//    new BullMQAdapter(emailQueue),
//    new BullMQAdapter(webhookQueue),
//    new BullMQAdapter(payrollQueue),
//    new BullMQAdapter(reorderQueue),
//    new BullMQAdapter(reportQueue),
//    new BullMQAdapter(forecastingQueue),
//  ],
//  serverAdapter,
//});

const app = express();

// ── Security headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
        imgSrc: ["'none'"],
        connectSrc: ["'self'"],
        fontSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  })
);

// Permissions-Policy header (not in helmet core — set manually)
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:
      process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);

// ── Core middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Global rate limiter ───────────────────────────────────────────────────
app.use(rateLimiter);

// ── Tenant-wide mutation audit trail (F-09) ──────────────────────────────
app.use(auditLogger);

// ── Auth & Tenant ─────────────────────────────────────────────────────────
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/tenant", tenantRoutes);

// ── HR ────────────────────────────────────────────────────────────────────
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);

// ── Payroll ───────────────────────────────────────────────────────────────
app.use("/api/payroll", payrollRoutes);
app.use("/api/payroll-engine", payrollEngineRoutes);
app.use("/api/payroll-audits", payrollAuditRoutes);
app.use("/api/payslips", payslipRoutes);

// ── Inventory & Procurement ───────────────────────────────────────────────
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/inventory-issue", inventoryIssueRoutes);
app.use("/api/vendors", vendorRoutes);

// ── AI Forecasting ────────────────────────────────────────────────────────
app.use("/api/forecasting", forecastingRoutes);

// ── Finance ───────────────────────────────────────────────────────────────
app.use("/api/ap", apRoutes);
app.use("/api/ar", arRoutes);
app.use("/api/fx", fxRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/vendor-invoices", vendorInvoiceRoutes);
app.use("/api/vendor-payments", vendorPaymentRoutes);

// ── BI Dashboard ──────────────────────────────────────────────────────────
app.use("/api/dashboard", dashboardRoutes);

// ── Project Management ────────────────────────────────────────────────────
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);

// ── Notifications ─────────────────────────────────────────────────────────
app.use("/api/notifications", notificationRoutes);

// ── Anomaly Detection & Intelligent Approvals ────────────────────────────
app.use("/api/anomaly", anomalyRoutes);
app.use("/api/approvals", approvalsRoutes);

// ── Audit Log & GDPR (F-09) ───────────────────────────────────────────────
app.use("/api/audit-log", auditRoutes);

// ── Bull Board UI (ADMIN only) ────────────────────────────────────────────
// app.use(
//   "/admin/queues",
//   authMiddleware,
//   roleMiddleware(["ADMIN"]),
//   serverAdapter.getRouter()
// );

// ── Utility routes ────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("ERP API Running");
});

// ── Health & Metrics (unauthenticated — used by k8s probes & Prometheus) ──
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "erp-api" });
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: (req as any).user,
  });
});

app.get(
  "/api/admin-only",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  (_req, res) => {
    res.json({ message: "Welcome Admin 👑" });
  }
);

// ── OpenAPI docs (F-11) ───────────────────────────────────────────────────
serveApiDocs(app);

export default app;