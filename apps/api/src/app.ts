import express from "express";
import cors from "cors";
import { authMiddleware } from "./modules/auth/middleware/auth.middleware";
import authRoutes from "./modules/auth/routes/auth.routes";
import { roleMiddleware } from "./modules/auth/middleware/role.middleware";
import tenantRoutes from "./modules/auth/routes/tenant.routes";
import employeeRoutes from "./modules/auth/routes/employee.routes";
import attendanceRoutes from "./modules/auth/routes/attendance.routes";
import leaveRoutes from "./modules/auth/routes/leave.routes";
import payrollRoutes from "./modules/payroll/routes/payroll.routes";

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

export default app;