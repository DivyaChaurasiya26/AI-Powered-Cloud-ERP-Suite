import { Router } from "express";

import { runPayrollCalculation } from "../controllers/payrollEngine.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/calculate",
  authMiddleware,
  runPayrollCalculation
);

export default router;