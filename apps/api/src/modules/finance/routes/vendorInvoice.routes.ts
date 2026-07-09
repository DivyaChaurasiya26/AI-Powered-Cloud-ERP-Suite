import { Router } from "express";

import { createVendorInvoice, getVendorInvoices } from "../controllers/vendorInvoice.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createVendorInvoice
);

router.get(
  "/",
  authMiddleware,
  getVendorInvoices
);

export default router;