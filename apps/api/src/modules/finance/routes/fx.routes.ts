import { Router } from "express";

import { convertFX } from "../controllers/fx.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post(
  "/convert",
  authMiddleware,
  convertFX
);

export default router;