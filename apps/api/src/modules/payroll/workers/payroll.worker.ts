import { Worker } from "bullmq";

import { redisConnection } from "../../../config/redis";

import { createLedgerEntry } from "../../finance/services/ledger.service";

new Worker(
  "payrollQueue",

  async (job) => {
    console.log(
      "Processing payroll:",
      job.data
    );

    // simulate processing
    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );

    // create finance ledger entry
    await createLedgerEntry({
      tenantId: job.data.tenantId,
      referenceType: "PAYROLL",
      referenceId: job.data.employeeId,
      description: "Salary processed via payroll",
      debit: job.data.deductions || 0,
      credit: job.data.bonus || 0,
    });

    console.log("Payroll completed");
  },

  {
    connection: redisConnection,
  }
);