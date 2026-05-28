import { Request, Response } from "express";

import { generatePayslip } from "../services/payslip.service";

export const downloadPayslip =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      // dummy payroll data
      const payroll = {
        employeeName: "Divya",
        month: "May 2026",
        grossSalary: 100000,
        tax: 10000,
        pf: 12000,
        bonus: 5000,
        netSalary: 83000,
      };

      const pdfBuffer =
        await generatePayslip(
          payroll
        );

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="payslip.pdf"'
      );

      res.send(pdfBuffer);

    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };