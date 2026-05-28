import { AccountingPeriod } from "../models/accountingPeriod.model";

export const isPeriodClosed = async (
  tenantId: string,
  date: Date
) => {
  const month = date.getMonth() + 1;

  const year = date.getFullYear();

  const period =
    await AccountingPeriod.findOne({
      tenantId,
      month,
      year,
    });

  return period?.isClosed;
};