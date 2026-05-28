import { Router } from "express";

import { closePeriod } from "../controllers/period.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/close",
  authMiddleware,
  closePeriod
);

export default router;