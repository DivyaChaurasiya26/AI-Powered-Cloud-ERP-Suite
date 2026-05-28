import { Router } from "express";

import { downloadPayslip } from "../controllers/payslip.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.get(
  "/download",
  authMiddleware,
  downloadPayslip
);

export default router;