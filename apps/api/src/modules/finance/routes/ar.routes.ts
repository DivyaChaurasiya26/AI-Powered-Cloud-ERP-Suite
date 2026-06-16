import { Router } from "express";

import {
  createARInvoice,
  receivePayment,
  downloadInvoicePDF,
} from "../controllers/ar.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createARInvoiceSchema,
  receivePaymentSchema,
} from "../../../schemas/finance.schema";

const router = Router();

router.post(
  "/invoice",
  authMiddleware,
  validate(createARInvoiceSchema),
  createARInvoice
);

router.patch(
  "/receive-payment",
  authMiddleware,
  validate(receivePaymentSchema),
  receivePayment
);

router.get(
  "/invoice/:id/pdf",
  authMiddleware,
  downloadInvoicePDF
);

export default router;