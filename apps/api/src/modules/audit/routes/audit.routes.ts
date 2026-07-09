import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { roleMiddleware } from "../../auth/middleware/role.middleware";
import {
  listAuditLogs,
  getAuditChainStatus,
  exportMyData,
  eraseMyData,
} from "../controllers/audit.controller";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), listAuditLogs);
router.get("/chain-status", authMiddleware, roleMiddleware(["ADMIN"]), getAuditChainStatus);

// GDPR self-service — any authenticated user, for their own data only.
router.get("/gdpr/export", authMiddleware, exportMyData);
router.post("/gdpr/erase", authMiddleware, eraseMyData);

export default router;
