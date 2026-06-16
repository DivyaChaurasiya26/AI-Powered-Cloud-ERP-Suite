import { Request, Response } from "express";

import { Leave } from "../models/leave.model";

export const applyLeave = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const leave = await Leave.create({
      ...req.body,
      tenantId: user.tenantId,
      employeeId: user.id,
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const approveLeave = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { leaveId, status } = req.body;

    const leave = await Leave.findOne({
      _id: leaveId,
      tenantId: user.tenantId,
    });

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    leave.status = status;
    leave.approvedBy = user.id;
    await leave.save();

    res.json({
      message: "Leave updated",
      leave,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLeaves = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const leaves = await Leave.find({
      tenantId: user.tenantId,
    });

    res.json(leaves);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};