import { Queue } from "bullmq";

import { redis } from "../../../config/redis";

export const webhookQueue = new Queue(
  "webhookQueue",
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  }
);