import { JournalEntry } from "../models/journalEntry.model";

export const createAutoJournalEntry = async ({
  tenantId,
  description,
  debitAccountId,
  creditAccountId,
  amount,
}: any) => {
  await JournalEntry.create({
    tenantId,
    description,
    lines: [
      {
        accountId: debitAccountId,
        debit: amount,
        credit: 0,
      },
      {
        accountId: creditAccountId,
        debit: 0,
        credit: amount,
      },
    ],
  });
};