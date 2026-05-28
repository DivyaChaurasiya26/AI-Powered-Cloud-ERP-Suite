import { Router } from "express";

import {
  createARInvoice,
  receivePayment,
   downloadInvoicePDF,
} from "../controllers/ar.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";


const router = Router();

router.post(
  "/invoice",
  authMiddleware,
  createARInvoice
);

router.patch(
  "/receive-payment",
  authMiddleware,
  receivePayment
);

router.get(
  "/invoice/:id/pdf",
  authMiddleware,
  downloadInvoicePDF
);
export default router;