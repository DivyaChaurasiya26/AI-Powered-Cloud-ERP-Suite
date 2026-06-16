import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { createProjectSchema } from "../../../schemas/project.schema";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectBudget,
  getGanttData,
  getUtilisation,
} from "../controllers/project.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createProjectSchema),
  createProject
);

router.get(
  "/",
  authMiddleware,
  getProjects
);

// /utilisation must be before /:id to avoid being caught as an id param
router.get(
  "/utilisation",
  authMiddleware,
  getUtilisation
);

router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

router.patch(
  "/:id",
  authMiddleware,
  updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

router.get(
  "/:id/budget",
  authMiddleware,
  getProjectBudget
);

router.get(
  "/:id/gantt",
  authMiddleware,
  getGanttData
);

export default router;