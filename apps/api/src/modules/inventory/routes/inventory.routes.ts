import { Router } from "express";

import {
  createInventoryItem,
  getInventoryItems,
} from "../controllers/inventory.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createInventoryItem
);

router.get(
  "/",
  authMiddleware,
  getInventoryItems
);

export default router;