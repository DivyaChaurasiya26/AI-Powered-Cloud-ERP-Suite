import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import {
  mlHealth,
  trainModel,
  predict,
  getModels,
  scheduleRetrain,
} from "../controllers/forecasting.controller";

const router = Router();

router.get(
  "/health",
  mlHealth
);

router.post(
  "/train",
  authMiddleware,
  trainModel
);

router.post(
  "/predict",
  authMiddleware,
  predict
);

router.get(
  "/models",
  authMiddleware,
  getModels
);

router.post(
  "/retrain",
  authMiddleware,
  scheduleRetrain
);

export default router;