import { Router } from "express";

import {
  createAPInvoice,
  payInvoice,
} from "../controllers/ap.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/invoice",
  authMiddleware,
  createAPInvoice
);

router.patch(
  "/pay",
  authMiddleware,
  payInvoice
);

export default router;