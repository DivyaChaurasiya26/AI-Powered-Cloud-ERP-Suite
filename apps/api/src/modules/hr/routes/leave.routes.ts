import { Router } from "express";

import {
  applyLeave,
  approveLeave,
  getLeaves,
} from "../controllers/leave.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/apply",
  authMiddleware,
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