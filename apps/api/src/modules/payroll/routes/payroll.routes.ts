import { Router } from "express";

import { runPayroll, getPayrollRecords } from "../controllers/payroll.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/run",
  authMiddleware,
  runPayroll
);

router.get(
  "/",
  authMiddleware,
  getPayrollRecords
);

export default router;