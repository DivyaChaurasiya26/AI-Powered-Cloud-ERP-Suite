import { Request, Response } from "express";
import { Attendance } from "../models/attendance.model";

export const clockIn = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { employeeId } = req.body;

    const attendance = await Attendance.create({
      employeeId,
      clockIn: new Date(),
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Clock-in successful",
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
    const { attendanceId } = req.body;

    const attendance = await Attendance.findById(
      attendanceId
    );

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    attendance.clockOut = new Date();

    // calculate total hours
    const diffMs =
      attendance.clockOut.getTime() -
      attendance.clockIn.getTime();

    attendance.totalHours =
      diffMs / (1000 * 60 * 60);

    await attendance.save();

    res.json({
      message: "Clock-out successful",
      attendance,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};