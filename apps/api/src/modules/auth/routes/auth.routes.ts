import { Router } from "express";
import {
  register,
  login,
  verifyMfaLogin,
  setupMfa,
  confirmMfaSetup,
  disableMfa,
  getMfaStatus,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../../../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/mfa/verify-login", verifyMfaLogin);

router.get("/mfa/status", authMiddleware, getMfaStatus);
router.post("/mfa/setup", authMiddleware, setupMfa);
router.post("/mfa/confirm", authMiddleware, confirmMfaSetup);
router.post("/mfa/disable", authMiddleware, disableMfa);

export default router;