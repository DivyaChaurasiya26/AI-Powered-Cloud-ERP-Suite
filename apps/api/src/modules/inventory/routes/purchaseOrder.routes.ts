import { Router } from "express";

import {
  createPurchaseOrder,
  getPurchaseOrders,
} from "../controllers/purchaseOrder.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createPurchaseOrder
);

router.get(
  "/",
  authMiddleware,
  getPurchaseOrders
);

export default router;