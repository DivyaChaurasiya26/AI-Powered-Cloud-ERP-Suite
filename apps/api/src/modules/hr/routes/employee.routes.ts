import { Router } from "express";

import {
  createEmployee,
  getEmployees,
  getOrgChart,
} from "../controllers/employee.controller";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { createEmployeeSchema } from "../../../schemas/hr.schema";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createEmployeeSchema),
  createEmployee
);

router.get(
  "/",
  authMiddleware,
  getEmployees
);

router.get(
  "/org-chart",
  authMiddleware,
  getOrgChart
);

export default router;