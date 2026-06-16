import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} from "../controllers/milestone.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createMilestone
);

router.get(
  "/",
  authMiddleware,
  getMilestones
);

router.get(
  "/:id",
  authMiddleware,
  getMilestoneById
);

router.patch(
  "/:id",
  authMiddleware,
  updateMilestone
);

router.delete(
  "/:id",
  authMiddleware,
  deleteMilestone
);

export default router;