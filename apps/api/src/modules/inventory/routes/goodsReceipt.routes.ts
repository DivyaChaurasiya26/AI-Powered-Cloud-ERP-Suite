import { Router } from "express";

import { receiveGoods } from "../controllers/goodsReceipt.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  receiveGoods
);

export default router;