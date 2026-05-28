import { Router } from "express";

import {
  clockIn,
  clockOut,
  getAttendance,
} from "../controllers/attendance.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/clock-in",
  authMiddleware,
  clockIn
);

router.post(
  "/clock-out",
  authMiddleware,
  clockOut
);

router.get(
  "/",
  authMiddleware,
  getAttendance
);

export default router;