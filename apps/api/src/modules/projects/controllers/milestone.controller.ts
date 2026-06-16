import { Request, Response } from "express";

import { Milestone } from "../models/milestone.model";

// POST /api/milestones
export const createMilestone = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const milestone = await Milestone.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Milestone created",
      milestone,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/milestones?projectId=
// Includes isOverdue flag: dueDate passed and status still PENDING
export const getMilestones = async (
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

    const milestones = await Milestone.find(
      filter
    ).lean();

    const now = new Date();

    const result = milestones.map(
      (m: any) => ({
        ...m,
        isOverdue:
          m.status === "PENDING" &&
          new Date(m.dueDate) < now,
      })
    );

    res.json(result);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/milestones/:id
export const getMilestoneById = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const milestone = await Milestone.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    }).lean();

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found",
      });
    }

    const now = new Date();

    res.json({
      ...milestone,
      isOverdue:
        (milestone as any).status === "PENDING" &&
        new Date((milestone as any).dueDate) < now,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/milestones/:id
export const updateMilestone = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const milestone =
      await Milestone.findOneAndUpdate(
        {
          _id: req.params.id,
          tenantId: user.tenantId,
        },
        { $set: req.body },
        { new: true }
      );

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found",
      });
    }

    res.json({
      message: "Milestone updated",
      milestone,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE /api/milestones/:id
export const deleteMilestone = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const milestone =
      await Milestone.findOneAndDelete({
        _id: req.params.id,
        tenantId: user.tenantId,
      });

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found",
      });
    }

    res.json({
      message: "Milestone deleted",
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};