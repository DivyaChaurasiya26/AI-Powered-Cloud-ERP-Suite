import { Request, Response } from "express";

import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
import { Milestone } from "../models/milestone.model";

import { emailQueue } from "../../notifications/queues/email.queue";
import { getUtilisationHeatmap } from "../services/utilisation.service";

// POST /api/projects
export const createProject = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const project = await Project.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Project created",
      project,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/projects
export const getProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const projects = await Project.find({
      tenantId: user.tenantId,
    });

    res.json(projects);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/projects/:id
export const getProjectById = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/projects/:id
// Budget variance alert: fires when actualBudget > plannedBudget * 1.10
export const updateProject = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { tenantId: _t, ...safeBody } =
      req.body;

    const project =
      await Project.findOneAndUpdate(
        {
          _id: req.params.id,
          tenantId: user.tenantId,
        },
        { $set: safeBody },
        { new: true }
      );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Budget variance alert
    if (
      project.plannedBudget > 0 &&
      project.actualBudget >
        project.plannedBudget * 1.1
    ) {
      const variancePct = (
        ((project.actualBudget -
          project.plannedBudget) /
          project.plannedBudget) *
        100
      ).toFixed(1);

      await emailQueue.add(
        "budget-overrun-alert",
        {
          to: process.env.EMAIL_USER,
          subject: `Budget Overrun: ${project.name}`,
          text:
            `Project "${project.name}" has exceeded its planned budget by ${variancePct}%. ` +
            `Planned: ₹${project.plannedBudget}, Actual: ₹${project.actualBudget}.`,
        }
      );
    }

    res.json({
      message: "Project updated",
      project,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project deleted",
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/projects/:id/budget
export const getProjectBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const variance =
      project.actualBudget -
      project.plannedBudget;

    const variancePct =
      project.plannedBudget > 0
        ? (
            (variance / project.plannedBudget) *
            100
          ).toFixed(1)
        : "0.0";

    const overrun =
      project.plannedBudget > 0 &&
      project.actualBudget >
        project.plannedBudget * 1.1;

    res.json({
      projectId: project._id,
      name: project.name,
      plannedBudget: project.plannedBudget,
      actualBudget: project.actualBudget,
      variance,
      variancePct: `${variancePct}%`,
      overrun,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/projects/:id/gantt
export const getGanttData = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const project = await Project.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const [tasks, milestones] =
      await Promise.all([
        Task.find({
          projectId: project._id,
          tenantId: user.tenantId,
        }).lean(),
        Milestone.find({
          projectId: project._id,
          tenantId: user.tenantId,
        }).lean(),
      ]);

    const ganttTasks = tasks.map(
      (t: any) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        dependsOn: t.dependsOn,
        plannedHours: t.plannedHours,
        actualHours: t.actualHours,
        progress:
          t.plannedHours > 0
            ? Math.min(
                Math.round(
                  (t.actualHours /
                    t.plannedHours) *
                    100
                ),
                100
              )
            : 0,
      })
    );

    const ganttMilestones = milestones.map(
      (m: any) => ({
        id: m._id,
        title: m.title,
        dueDate: m.dueDate,
        status: m.status,
      })
    );

    res.json({
      project: {
        id: project._id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      },
      tasks: ganttTasks,
      milestones: ganttMilestones,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/projects/utilisation
export const getUtilisation = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const data = await getUtilisationHeatmap(
      user.tenantId
    );

    res.json(data);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};