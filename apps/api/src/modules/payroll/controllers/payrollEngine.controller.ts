import { Request, Response } from "express";

import { PayrollConfig } from "../models/payrollConfig.model";

import { calculatePayroll } from "../services/payrollEngine.service";
import { createPayrollAudit } from "../services/payrollAudit.service";
export const runPayrollCalculation =
  async (
    req: Request,
    res: Response
  ) => {
    try {
        
      const user = (req as any).user;

      const { grossSalary } =
        req.body;

      const config =
        await PayrollConfig.findOne({
          tenantId: user.tenantId,
        });

      if (!config) {
        return res.status(404).json({
          message:
            "Payroll config not found",
        });
      }

      const payroll =
        calculatePayroll(
          grossSalary,
          config
        );
await createPayrollAudit({
  tenantId: user.tenantId,
  employeeId: user.id,
  action: "CREATED",
  changedBy: user.id,

  changes: payroll,
});
      res.json({
        message:
          "Payroll calculated",
        payroll,
      });

    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  
 