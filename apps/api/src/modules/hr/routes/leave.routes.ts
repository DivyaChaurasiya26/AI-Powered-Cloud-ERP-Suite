import { Router } from "express";

import {
  applyLeave,
  approveLeave,
  getLeaves,
} from "../controllers/leave.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { applyLeaveSchema } from "../../../schemas/hr.schema";

const router = Router();

router.post(
  "/apply",
  authMiddleware,
  validate(applyLeaveSchema),
  applyLeave
);

router.patch(
  "/approve",
  authMiddleware,
  approveLeave
);

router.get(
  "/",
  authMiddleware,
  getLeaves
);

export default router;