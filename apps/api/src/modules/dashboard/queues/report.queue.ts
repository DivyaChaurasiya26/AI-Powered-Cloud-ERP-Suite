import { Queue } from "bullmq";

import { redisConnection } from "../../../config/redis";

export const reportQueue = new Queue(
  "reportQueue",
  {
    connection: redisConnection,
  }
);