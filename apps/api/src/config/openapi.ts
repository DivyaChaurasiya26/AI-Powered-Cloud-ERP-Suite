import type { Express, Request, Response } from "express";

// Hand-authored OpenAPI 3.1 document. Covers every resource group exposed
// under /api with real paths/methods/tags pulled from the route files —
// request/response schemas are representative (the shape actually
// returned), not exhaustively generated field-by-field.
const tag = (name: string, description: string) => ({ name, description });

const bearerAuth = { bearerAuth: [] as string[] };

const idParam = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" },
};

const jsonResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { type: "object" } } },
});

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "AI-Powered Cloud ERP Suite API",
    version: "1.0.0",
    description:
      "REST API for the ERP suite: multi-tenant auth, HR & payroll, finance (AP/AR), " +
      "inventory & procurement, AI forecasting, anomaly detection, intelligent approvals, " +
      "BI dashboards, notifications, projects, and the audit log.",
  },
  servers: [{ url: "/api", description: "Same-origin API root" }],
  tags: [
    tag("Auth", "Registration, login, tenant provisioning"),
    tag("HR", "Employees, attendance, leave"),
    tag("Payroll", "Payroll runs, records, payslips"),
    tag("Finance", "AP/AR invoices, ledger, FX, period close"),
    tag("Procurement", "Vendors, vendor invoices & payments"),
    tag("Inventory", "Stock items, purchase orders, goods receipts"),
    tag("Projects", "Projects, tasks, milestones"),
    tag("Forecasting", "AI demand forecasting (Prophet/LSTM)"),
    tag("Anomaly", "Statistical anomaly detection"),
    tag("Approvals", "Risk-scored approval workflow"),
    tag("Dashboard", "KPIs, widgets, live SSE feed, reports"),
    tag("Notifications", "In-app/email/webhook notifications"),
    tag("Audit", "Tenant audit trail + GDPR self-service"),
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
  security: [bearerAuth],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user under a tenant",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  tenantId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": jsonResponse("User created"), "400": jsonResponse("User already exists") },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Exchange credentials for a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": jsonResponse("token + user, OR { mfaRequired: true, mfaToken } if MFA is enabled"),
          "400": jsonResponse("Invalid credentials"),
        },
      },
    },
    "/auth/mfa/verify-login": {
      post: {
        tags: ["Auth"],
        summary: "Complete login with a TOTP code after mfaRequired",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mfaToken", "code"],
                properties: { mfaToken: { type: "string" }, code: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": jsonResponse("token + user"), "400": jsonResponse("Invalid or expired code") },
      },
    },
    "/auth/mfa/status": {
      get: { tags: ["Auth"], summary: "Whether MFA is enabled for the caller", responses: { "200": jsonResponse("{ mfaEnabled }") } },
    },
    "/auth/mfa/setup": {
      post: { tags: ["Auth"], summary: "Generate a TOTP secret (not yet enabled)", responses: { "200": jsonResponse("{ secret, otpauthUrl }") } },
    },
    "/auth/mfa/confirm": {
      post: { tags: ["Auth"], summary: "Confirm setup with a code from the authenticator app — enables MFA", responses: { "200": jsonResponse("MFA enabled") } },
    },
    "/auth/mfa/disable": {
      post: { tags: ["Auth"], summary: "Disable MFA (requires a current code)", responses: { "200": jsonResponse("MFA disabled") } },
    },
    "/employees": {
      get: { tags: ["HR"], summary: "List employees", responses: { "200": jsonResponse("Employee list") } },
      post: { tags: ["HR"], summary: "Create employee", responses: { "201": jsonResponse("Employee created") } },
    },
    "/employees/org-chart": {
      get: { tags: ["HR"], summary: "Recursive reporting-hierarchy tree", responses: { "200": jsonResponse("Org chart") } },
    },
    "/attendance": {
      get: { tags: ["HR"], summary: "List attendance records", responses: { "200": jsonResponse("Attendance list") } },
    },
    "/attendance/clock-in": {
      post: { tags: ["HR"], summary: "Clock in", responses: { "201": jsonResponse("Clocked in") } },
    },
    "/attendance/clock-out": {
      post: { tags: ["HR"], summary: "Clock out", responses: { "200": jsonResponse("Clocked out") } },
    },
    "/leaves": {
      get: { tags: ["HR"], summary: "List leave requests", responses: { "200": jsonResponse("Leave list") } },
    },
    "/leaves/apply": {
      post: { tags: ["HR"], summary: "Apply for leave", responses: { "201": jsonResponse("Leave requested") } },
    },
    "/leaves/approve": {
      patch: { tags: ["HR"], summary: "Approve/reject a leave request", responses: { "200": jsonResponse("Leave decided") } },
    },
    "/payroll": {
      get: { tags: ["Payroll"], summary: "List payroll records", responses: { "200": jsonResponse("Payroll list") } },
    },
    "/payroll/run": {
      post: { tags: ["Payroll"], summary: "Queue a payroll run for an employee", responses: { "201": jsonResponse("Job queued") } },
    },
    "/payroll-engine/calculate": {
      post: { tags: ["Payroll"], summary: "Run gross-to-net calculation", responses: { "200": jsonResponse("Calculation result") } },
    },
    "/payroll-audits": {
      get: { tags: ["Payroll"], summary: "List payroll audit entries", responses: { "200": jsonResponse("Audit list") } },
    },
    "/payslips/download": {
      get: { tags: ["Payroll"], summary: "Download a payslip PDF", responses: { "200": { description: "PDF stream" } } },
    },
    "/ap/invoice": {
      get: { tags: ["Finance"], summary: "List AP invoices", responses: { "200": jsonResponse("AP invoice list") } },
      post: { tags: ["Finance"], summary: "Create AP invoice", responses: { "201": jsonResponse("Invoice created") } },
    },
    "/ap/pay": {
      patch: { tags: ["Finance"], summary: "Mark AP invoice paid", responses: { "200": jsonResponse("Invoice paid") } },
    },
    "/ar/invoice": {
      get: { tags: ["Finance"], summary: "List AR invoices", responses: { "200": jsonResponse("AR invoice list") } },
      post: { tags: ["Finance"], summary: "Create AR invoice", responses: { "201": jsonResponse("Invoice created") } },
    },
    "/ar/invoice/{id}/pdf": {
      get: {
        tags: ["Finance"],
        summary: "Download AR invoice PDF",
        parameters: [idParam],
        responses: { "200": { description: "PDF stream" } },
      },
    },
    "/ar/receive-payment": {
      patch: { tags: ["Finance"], summary: "Record customer payment", responses: { "200": jsonResponse("Payment recorded") } },
    },
    "/fx": {
      get: { tags: ["Finance"], summary: "FX rates", responses: { "200": jsonResponse("FX rate data") } },
    },
    "/journal": {
      get: { tags: ["Finance"], summary: "General ledger journal entries", responses: { "200": jsonResponse("Journal entries") } },
    },
    "/periods": {
      get: { tags: ["Finance"], summary: "Accounting period status", responses: { "200": jsonResponse("Period list") } },
    },
    "/vendors": {
      get: { tags: ["Procurement"], summary: "List vendors", responses: { "200": jsonResponse("Vendor list") } },
      post: { tags: ["Procurement"], summary: "Create vendor", responses: { "201": jsonResponse("Vendor created") } },
    },
    "/vendor-invoices": {
      get: { tags: ["Procurement"], summary: "List vendor invoices", responses: { "200": jsonResponse("Vendor invoice list") } },
      post: {
        tags: ["Procurement"],
        summary: "Create vendor invoice (runs 3-way match against PO + goods receipt)",
        responses: { "201": jsonResponse("Invoice matched or rejected") },
      },
    },
    "/vendor-payments": {
      get: { tags: ["Procurement"], summary: "List vendor payments", responses: { "200": jsonResponse("Vendor payment list") } },
      post: {
        tags: ["Procurement"],
        summary: "Pay a matched vendor invoice (risk-scored — may require manual approval)",
        responses: { "201": jsonResponse("Paid or pending approval") },
      },
    },
    "/inventory": {
      get: { tags: ["Inventory"], summary: "List stock items", responses: { "200": jsonResponse("Inventory list") } },
      post: { tags: ["Inventory"], summary: "Create stock item", responses: { "201": jsonResponse("Item created") } },
    },
    "/purchase-orders": {
      get: { tags: ["Inventory"], summary: "List purchase orders", responses: { "200": jsonResponse("PO list") } },
      post: { tags: ["Inventory"], summary: "Create purchase order", responses: { "201": jsonResponse("PO created") } },
    },
    "/goods-receipts": {
      get: { tags: ["Inventory"], summary: "List goods receipts", responses: { "200": jsonResponse("Goods receipt list") } },
      post: {
        tags: ["Inventory"],
        summary: "Record goods receipt (updates stock, triggers reorder + anomaly check)",
        responses: { "201": jsonResponse("Goods received") },
      },
    },
    "/inventory-issue": {
      post: { tags: ["Inventory"], summary: "Issue stock out of inventory", responses: { "201": jsonResponse("Stock issued") } },
    },
    "/projects": {
      get: { tags: ["Projects"], summary: "List projects", responses: { "200": jsonResponse("Project list") } },
      post: { tags: ["Projects"], summary: "Create project", responses: { "201": jsonResponse("Project created") } },
    },
    "/projects/{id}": {
      get: { tags: ["Projects"], summary: "Get project", parameters: [idParam], responses: { "200": jsonResponse("Project") } },
      patch: { tags: ["Projects"], summary: "Update project", parameters: [idParam], responses: { "200": jsonResponse("Project updated") } },
      delete: { tags: ["Projects"], summary: "Delete project", parameters: [idParam], responses: { "200": jsonResponse("Project deleted") } },
    },
    "/projects/{id}/budget": {
      get: { tags: ["Projects"], summary: "Planned vs actual budget", parameters: [idParam], responses: { "200": jsonResponse("Budget variance") } },
    },
    "/projects/{id}/gantt": {
      get: { tags: ["Projects"], summary: "Gantt chart data", parameters: [idParam], responses: { "200": jsonResponse("Gantt series") } },
    },
    "/projects/utilisation": {
      get: { tags: ["Projects"], summary: "Resource utilisation heatmap data", responses: { "200": jsonResponse("Utilisation data") } },
    },
    "/tasks": {
      get: { tags: ["Projects"], summary: "List tasks", responses: { "200": jsonResponse("Task list") } },
      post: { tags: ["Projects"], summary: "Create task", responses: { "201": jsonResponse("Task created") } },
    },
    "/tasks/{id}": {
      get: { tags: ["Projects"], summary: "Get task", parameters: [idParam], responses: { "200": jsonResponse("Task") } },
      patch: { tags: ["Projects"], summary: "Update task", parameters: [idParam], responses: { "200": jsonResponse("Task updated") } },
      delete: { tags: ["Projects"], summary: "Delete task", parameters: [idParam], responses: { "200": jsonResponse("Task deleted") } },
    },
    "/tasks/{id}/assign": {
      patch: { tags: ["Projects"], summary: "Assign employee to task", parameters: [idParam], responses: { "200": jsonResponse("Task assigned") } },
    },
    "/milestones": {
      get: { tags: ["Projects"], summary: "List milestones", responses: { "200": jsonResponse("Milestone list") } },
      post: { tags: ["Projects"], summary: "Create milestone", responses: { "201": jsonResponse("Milestone created") } },
    },
    "/forecasting/{sku}": {
      get: {
        tags: ["Forecasting"],
        summary: "Get demand forecast for a SKU",
        parameters: [{ name: "sku", in: "path" as const, required: true, schema: { type: "string" } }],
        responses: { "200": jsonResponse("Forecast series") },
      },
    },
    "/anomaly": {
      get: { tags: ["Anomaly"], summary: "List anomaly flags", responses: { "200": jsonResponse("Anomaly list") } },
    },
    "/anomaly/scan": {
      post: { tags: ["Anomaly"], summary: "Run a tenant-wide anomaly scan", responses: { "200": jsonResponse("Scan complete") } },
    },
    "/anomaly/{id}": {
      patch: { tags: ["Anomaly"], summary: "Update anomaly status", parameters: [idParam], responses: { "200": jsonResponse("Anomaly updated") } },
    },
    "/approvals": {
      get: { tags: ["Approvals"], summary: "List approval requests", responses: { "200": jsonResponse("Approval list") } },
    },
    "/approvals/{id}/decide": {
      post: { tags: ["Approvals"], summary: "Approve or reject a request", parameters: [idParam], responses: { "200": jsonResponse("Decision recorded") } },
    },
    "/dashboard/kpis": {
      get: { tags: ["Dashboard"], summary: "Revenue/expense/inventory/payroll KPIs", responses: { "200": jsonResponse("KPI snapshot") } },
    },
    "/dashboard/widgets": {
      get: { tags: ["Dashboard"], summary: "List configured widgets", responses: { "200": jsonResponse("Widget list") } },
      post: { tags: ["Dashboard"], summary: "Create a widget", responses: { "201": jsonResponse("Widget created") } },
    },
    "/dashboard/live": {
      get: { tags: ["Dashboard"], summary: "Server-Sent Events KPI stream", responses: { "200": { description: "text/event-stream" } } },
    },
    "/dashboard/analytics/{dataSource}": {
      get: {
        tags: ["Dashboard"],
        summary: "Monthly time series for revenue/expenses/ledger",
        parameters: [{ name: "dataSource", in: "path" as const, required: true, schema: { type: "string", enum: ["revenue", "expenses", "ledger"] } }],
        responses: { "200": jsonResponse("Series data") },
      },
    },
    "/dashboard/reports/download": {
      get: { tags: ["Dashboard"], summary: "Download a PDF/CSV report", responses: { "200": { description: "File stream" } } },
    },
    "/notifications": {
      get: { tags: ["Notifications"], summary: "List notifications", responses: { "200": jsonResponse("Notification list") } },
    },
    "/notifications/preferences": {
      get: { tags: ["Notifications"], summary: "Get channel preferences", responses: { "200": jsonResponse("Preferences") } },
      put: { tags: ["Notifications"], summary: "Update channel preferences", responses: { "200": jsonResponse("Preferences updated") } },
    },
    "/notifications/read-all": {
      post: { tags: ["Notifications"], summary: "Mark all notifications read", responses: { "200": jsonResponse("Marked read") } },
    },
    "/notifications/{id}/read": {
      patch: { tags: ["Notifications"], summary: "Mark one notification read", parameters: [idParam], responses: { "200": jsonResponse("Marked read") } },
    },
    "/audit-log": {
      get: {
        tags: ["Audit"],
        summary: "List tenant audit trail entries (ADMIN)",
        responses: { "200": jsonResponse("Paginated audit log") },
      },
    },
    "/audit-log/chain-status": {
      get: { tags: ["Audit"], summary: "Verify audit-log hash chain integrity (ADMIN)", responses: { "200": jsonResponse("Chain verification result") } },
    },
    "/audit-log/gdpr/export": {
      get: { tags: ["Audit"], summary: "Export the caller's own data (GDPR Art. 15/20)", responses: { "200": { description: "JSON file download" } } },
    },
    "/audit-log/gdpr/erase": {
      post: { tags: ["Audit"], summary: "Erase the caller's own PII (GDPR Art. 17)", responses: { "200": jsonResponse("Erasure confirmed") } },
    },
  },
};

const docsPage = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>ERP API Docs</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>body{margin:0;}</style>
</head>
<body>
<redoc spec-url="/api/openapi.json"></redoc>
<script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>`;

export const serveApiDocs = (app: Express) => {
  app.get("/api/openapi.json", (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  app.get("/api-docs", (_req: Request, res: Response) => {
    // The global helmet CSP (default-src/script-src 'none') is correct for
    // the JSON API but blocks Redoc's CDN bundle — relax it only here.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://cdn.redoc.ly; style-src 'self' 'unsafe-inline'; img-src 'self' data:; worker-src blob:; connect-src 'self'"
    );
    res.type("html").send(docsPage);
  });
};
