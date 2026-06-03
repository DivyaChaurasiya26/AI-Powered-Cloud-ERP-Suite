import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import { payVendorInvoice } from "../controllers/vendorPayment.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  payVendorInvoice
);

export default router;