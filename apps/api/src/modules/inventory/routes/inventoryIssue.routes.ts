import { Router } from "express";

import { issueInventory } from "../controllers/inventoryIssue.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  issueInventory
);

export default router;