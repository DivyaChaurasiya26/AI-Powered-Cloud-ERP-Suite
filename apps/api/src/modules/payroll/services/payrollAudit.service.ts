import { PayrollAudit } from "../models/payrollAudit.model";

export const createPayrollAudit =
  async (data: any) => {
    return await PayrollAudit.create(
      data
    );
  };