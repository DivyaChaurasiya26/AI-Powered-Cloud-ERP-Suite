import { Request, Response } from "express";

import { payrollQueue } from "../queues/payroll.queue";

export const runPayroll = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      employeeId,
      month,
      year,
      deductions,
      bonus,
    } = req.body;

    await payrollQueue.add(
      "runPayroll",
      {
        employeeId,
        month,
        year,
        deductions,
        bonus,
      },
      {
        attempts: 3,
      }
    );

    res.status(201).json({
      message: "Payroll job added to queue",
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};