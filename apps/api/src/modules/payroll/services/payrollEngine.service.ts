
import { createAutoJournalEntry } from "../../finance/services/autoLedger.service";

export const calculatePayroll = async (
  grossSalary: number,
  config: any
) => {
  const tax =
    (grossSalary *
      config.taxPercentage) /
    100;

  const pf =
    (grossSalary *
      config.pfPercentage) /
    100;

  const bonus =
    (grossSalary *
      config.bonusPercentage) /
    100;

  const totalDeductions =
    tax + pf;

  const netSalary =
    grossSalary -
    totalDeductions +
    bonus;

  return {
    grossSalary,
    tax,
    pf,
    bonus,
    totalDeductions,
    netSalary,
  };
};
