import { Router } from "express";

import { authMiddleware } from "../../auth/middleware/auth.middleware";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignEmployee,
  addDependency,
} from "../controllers/task.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createTask
);

router.get(
  "/",
  authMiddleware,
  getTasks
);

router.get(
  "/:id",
  authMiddleware,
  getTaskById
);

router.patch(
  "/:id",
  authMiddleware,
  updateTask
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);

router.patch(
  "/:id/assign",
  authMiddleware,
  assignEmployee
);

router.post(
  "/:id/dependency",
  authMiddleware,
  addDependency
);

export default router;