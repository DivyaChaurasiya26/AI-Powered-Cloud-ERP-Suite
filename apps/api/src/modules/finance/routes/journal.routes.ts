import { Router } from "express";

import { createJournalEntry } from "../controllers/journal.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createJournalEntry
);

export default router;