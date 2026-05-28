export const validateJournal =
  (lines: any[]) => {

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {

      totalDebit +=
        line.debit || 0;

      totalCredit +=
        line.credit || 0;
    }

    return (
      totalDebit ===
      totalCredit
    );
  };