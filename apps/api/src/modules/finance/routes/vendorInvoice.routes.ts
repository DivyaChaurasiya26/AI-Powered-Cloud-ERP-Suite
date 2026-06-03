import { Router } from "express";

import { createVendorInvoice } from "../controllers/vendorInvoice.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createVendorInvoice
);

export default router;