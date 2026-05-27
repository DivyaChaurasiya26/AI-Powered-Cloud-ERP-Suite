import { Worker } from "bullmq";

import { redisConnection } from "../../../config/redis";

new Worker(
  "reorderQueue",

  async (job) => {
    console.log(
      "⚠️ Low stock detected:",
      job.data
    );

    // future:
    // auto-create PO
    // send email
    // notify admin
  },

  {
    connection: redisConnection,
  }
);