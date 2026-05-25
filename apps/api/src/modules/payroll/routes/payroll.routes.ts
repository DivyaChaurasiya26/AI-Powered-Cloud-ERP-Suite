import { Router } from "express";

import { runPayroll } from "../controllers/payroll.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/run",
  authMiddleware,
  runPayroll
);

export default router;