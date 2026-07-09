import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import { payVendorInvoice, getVendorPayments } from "../controllers/vendorPayment.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  payVendorInvoice
);

router.get(
  "/",
  authMiddleware,
  getVendorPayments
);

export default router;