import { Worker } from "bullmq";

import { redisConnection } from "../../../config/redis";

new Worker(
  "payrollQueue",

  async (job) => {
    console.log("Processing payroll:", job.data);

    // simulate processing
    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );

    console.log("Payroll completed");
  },

  {
    connection: redisConnection,
  }
);