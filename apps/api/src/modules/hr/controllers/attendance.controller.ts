import { Request, Response } from "express";

import { Attendance } from "../models/attendance.model";

export const clockIn = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const attendance =
      await Attendance.create({
        tenantId: user.tenantId,
        employeeId: user.id,
        clockIn: new Date(),
      });

    res.status(201).json({
      message: "Clock in successful",
      attendance,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const clockOut = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const attendance =
      await Attendance.findOne({
        employeeId: user.id,
      }).sort({ createdAt: -1 });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        message:
          "Employee already clocked out",
      });
    }

    const clockOutTime = new Date();

    attendance.clockOut =
      clockOutTime;

    // calculate total working hours
    const diffMs =
      clockOutTime.getTime() -
      attendance.clockIn.getTime();

    const totalHours =
      diffMs / (1000 * 60 * 60);

    attendance.totalHours =
      Number(totalHours.toFixed(2));

    // overtime calculation
    const overtimeHours =
      totalHours > 8
        ? totalHours - 8
        : 0;

    attendance.overtimeHours =
      Number(overtimeHours.toFixed(2));

    await attendance.save();

    res.json({
      message:
        "Clock out successful",
      attendance,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const attendance =
      await Attendance.find({
        tenantId: user.tenantId,
      }).sort({
        createdAt: -1,
      });

    res.json(attendance);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};