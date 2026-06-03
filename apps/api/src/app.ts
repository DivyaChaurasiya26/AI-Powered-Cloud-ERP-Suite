import express from "express";
import cors from "cors";
import { authMiddleware } from "./modules/auth/middleware/auth.middleware";
import authRoutes from "./modules/auth/routes/auth.routes";
import { roleMiddleware } from "./modules/auth/middleware/role.middleware";
import tenantRoutes from "./modules/auth/routes/tenant.routes";
//import employeeRoutes from "./modules/auth/routes/employee.routes";
//import attendanceRoutes from "./modules/auth/routes/attendance.routes";
//import leaveRoutes from "./modules/auth/routes/leave.routes";
import payrollRoutes from "./modules/payroll/routes/payroll.routes";
import inventoryRoutes from "./modules/inventory/routes/inventory.routes";
import purchaseOrderRoutes from "./modules/inventory/routes/purchaseOrder.routes";
import goodsReceiptRoutes from "./modules/inventory/routes/goodsReceipt.routes";
import apRoutes from "./modules/finance/routes/ap.routes";
import arRoutes from "./modules/finance/routes/ar.routes";
import periodRoutes from "./modules/finance/routes/period.routes";
import payrollEngineRoutes from "./modules/payroll/routes/payrollEngine.routes";
import payrollAuditRoutes from "./modules/payroll/routes/payrollAudit.routes";
import employeeRoutes from "./modules/hr/routes/employee.routes";
import attendanceRoutes from "./modules/hr/routes/attendance.routes";
import leaveRoutes from "./modules/hr/routes/leave.routes";
import inventoryIssueRoutes from "./modules/inventory/routes/inventoryIssue.routes";
import fxRoutes from "./modules/finance/routes/fx.routes";
import payslipRoutes from "./modules/payroll/routes/payslip.routes";
import journalRoutes from "./modules/finance/routes/journal.routes";
import vendorRoutes from "./modules/procurement/routes/vendor.routes";
import vendorInvoiceRoutes from "./modules/finance/routes/vendorInvoice.routes";
import vendorPaymentRoutes from "./modules/finance/routes/vendorPayment.routes";



const app = express();
app.use(express.json());
app.use("/api/tenant", tenantRoutes);

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);  
app.use("/api/payroll", payrollRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/ap", apRoutes);
app.use("/api/ar", arRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/fx", fxRoutes);
app.use(
  "/api/payroll-engine",
  payrollEngineRoutes
);
app.use("/api/vendors", vendorRoutes);
app.use(
  "/api/journal",
  journalRoutes
);
app.use(
  "/api/payroll-audits",
  payrollAuditRoutes
);
app.use("/api/employees", employeeRoutes);

app.use(
  "/api/inventory-issue",
  inventoryIssueRoutes
);
app.use(
  "/api/payslips",
  payslipRoutes
);
app.use(
  "/api/vendor-invoices",
  vendorInvoiceRoutes
);
app.use(
  "/api/vendor-payments",
  vendorPaymentRoutes
);





app.get("/", (_req, res) => {
  res.send("ERP API Running");
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
  (req, res) => {
    res.json({
      message: "Welcome Admin 👑",
    });
  }
);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: (req as any).user,
  });
});

app.use("/api/leaves", leaveRoutes);
export default app;