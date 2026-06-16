import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import {
  getNotifications,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
  streamNotifications,
} from "../controllers/notification.controller";

const router = Router();

// Static routes before /:id
router.get(
  "/live",
  authMiddleware,
  streamNotifications
);

router.get(
  "/preferences",
  authMiddleware,
  getPreferences
);

router.put(
  "/preferences",
  authMiddleware,
  updatePreferences
);

router.get(
  "/",
  authMiddleware,
  getNotifications
);

router.post(
  "/read-all",
  authMiddleware,
  markAllRead
);

router.patch(
  "/:id/read",
  authMiddleware,
  markRead
);

export default router;