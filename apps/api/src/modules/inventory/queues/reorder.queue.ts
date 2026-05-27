import { Queue } from "bullmq";

import { redisConnection } from "../../../config/redis";

export const reorderQueue = new Queue(
  "reorderQueue",
  {
    connection: redisConnection,
  }
);