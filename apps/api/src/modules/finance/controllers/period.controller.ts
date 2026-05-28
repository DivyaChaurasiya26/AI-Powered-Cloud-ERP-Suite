import { Request, Response } from "express";

import { AccountingPeriod } from "../models/accountingPeriod.model";

export const closePeriod = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { month, year } = req.body;

    const period =
      await AccountingPeriod.findOneAndUpdate(
        {
          tenantId: user.tenantId,
          month,
          year,
        },
        {
          isClosed: true,
          closedBy: user.id,
        },
        {
          upsert: true,
          new: true,
        }
      );

    res.json({
      message:
        "Accounting period closed",
      period,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};