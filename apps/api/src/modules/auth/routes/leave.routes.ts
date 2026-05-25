import { Router } from "express";

import {
  applyLeave,
  updateLeaveStatus,
  getLeaves,
} from "../controllers/leave.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, applyLeave);

router.patch(
  "/status",
  authMiddleware,
  updateLeaveStatus
);

router.get("/", authMiddleware, getLeaves);

export default router;