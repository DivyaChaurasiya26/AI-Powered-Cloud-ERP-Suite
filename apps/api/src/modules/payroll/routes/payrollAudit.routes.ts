import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import { PayrollAudit } from "../models/payrollAudit.model";

const router = Router();

router.get(
  "/",
  authMiddleware,

  async (req, res) => {
    const user = (req as any).user;

    const audits =
      await PayrollAudit.find({
        tenantId: user.tenantId,
      });

    res.json(audits);
  }
);

export default router;