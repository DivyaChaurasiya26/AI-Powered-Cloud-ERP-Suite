import { Router } from "express";
import { authMiddleware } from "../../auth/middleware/auth.middleware";
import {
  createVendor,
  getVendors,
} from "../controllers/vendor.controller";

const router = Router();

router.post("/", authMiddleware, createVendor);
router.get("/", authMiddleware, getVendors);

export default router;