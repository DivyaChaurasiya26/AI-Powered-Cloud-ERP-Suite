import { Router } from "express";

import { receiveGoods, getGoodsReceipts } from "../controllers/goodsReceipt.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  receiveGoods
);

router.get(
  "/",
  authMiddleware,
  getGoodsReceipts
);

export default router;