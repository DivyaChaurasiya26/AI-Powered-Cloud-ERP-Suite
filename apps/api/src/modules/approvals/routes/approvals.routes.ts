import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { roleMiddleware } from "../../auth/middleware/role.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  submitApprovalSchema,
  decideApprovalSchema,
} from "../../../schemas/approvals.schema";

import {
  createApprovalRequest,
  listApprovalRequests,
  getApprovalRequest,
  decideApprovalRequest,
} from "../controllers/approval.controller";

const router = Router();

router.post("/", authMiddleware, validate(submitApprovalSchema), createApprovalRequest);
router.get("/", authMiddleware, listApprovalRequests);
router.get("/:id", authMiddleware, getApprovalRequest);
router.post(
  "/:id/decide",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validate(decideApprovalSchema),
  decideApprovalRequest
);

export default router;
