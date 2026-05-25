import { Router } from "express";
import {
  createEmployee,
  getEmployees,
} from "../controllers/employee.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createEmployee);

router.get("/", authMiddleware, getEmployees);

export default router;