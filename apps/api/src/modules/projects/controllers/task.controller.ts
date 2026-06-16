import { Request, Response } from "express";

import { Task } from "../models/task.model";
import { wouldCreateCycle } from "../services/dag.service";

// POST /api/tasks
export const createTask = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const task = await Task.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Task created",
      task,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/tasks?projectId=
export const getTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { projectId } = req.query;

    const filter: any = {
      tenantId: user.tenantId,
    };

    if (projectId) {
      filter.projectId = projectId;
    }

    const tasks = await Task.find(filter);

    res.json(tasks);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/tasks/:id
export const updateTask = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: user.tenantId,
      },
      { $set: req.body },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated",
      task,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted",
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/tasks/:id/assign
// Body: { assigneeId }
export const assignEmployee = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { assigneeId } = req.body;

    if (!assigneeId) {
      return res.status(400).json({
        message: "assigneeId is required",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: user.tenantId,
      },
      { $set: { assigneeId } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Employee assigned",
      task,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/tasks/:id/dependency
// Body: { dependsOnTaskId }
// Validates DAG before adding dependency
export const addDependency = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { dependsOnTaskId } = req.body;

    if (!dependsOnTaskId) {
      return res.status(400).json({
        message: "dependsOnTaskId is required",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const alreadyExists = (
      task.dependsOn as any[]
    ).some(
      (id: any) =>
        id.toString() === dependsOnTaskId
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: "Dependency already exists",
      });
    }

    const cycleDetected = await wouldCreateCycle(
      req.params.id,
      dependsOnTaskId
    );

    if (cycleDetected) {
      return res.status(400).json({
        message:
          "Cannot add dependency: circular dependency detected",
      });
    }

    task.dependsOn.push(dependsOnTaskId as any);

    await task.save();

    res.json({
      message: "Dependency added",
      task,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};