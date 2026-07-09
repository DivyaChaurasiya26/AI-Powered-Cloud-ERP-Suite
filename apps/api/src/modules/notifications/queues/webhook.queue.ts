import { Queue } from "bullmq";

import { redis } from "../../../config/redis";

export const webhookQueue = new Queue(
  "webhookQueue",
  {
    // redis may be typed as Redis | null — cast to any to satisfy Queue connection typing
    connection: redis as any,
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