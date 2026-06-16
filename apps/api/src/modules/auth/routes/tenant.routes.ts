import { Router } from "express";
import { createTenant } from "../controllers/tenant.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, roleMiddleware(["ADMIN"]), createTenant);

export default router;