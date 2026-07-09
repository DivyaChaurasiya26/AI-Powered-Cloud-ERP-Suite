import { Router } from "express";

import {
  createAPInvoice,
  getAPInvoices,
  payInvoice,
} from "../controllers/ap.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createAPInvoiceSchema,
  payInvoiceSchema,
} from "../../../schemas/finance.schema";

const router = Router();

router.post(
  "/invoice",
  authMiddleware,
  validate(createAPInvoiceSchema),
  createAPInvoice
);

router.patch(
  "/pay",
  authMiddleware,
  validate(payInvoiceSchema),
  payInvoice
);

router.get(
  "/invoice",
  authMiddleware,
  getAPInvoices
);

export default router;