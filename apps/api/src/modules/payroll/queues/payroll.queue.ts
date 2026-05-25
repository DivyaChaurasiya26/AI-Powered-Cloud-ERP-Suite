import { Queue } from "bullmq";

import { redisConnection } from "../../../config/redis";

export const payrollQueue = new Queue(
  "payrollQueue",
  {
    connection: redisConnection,
  }
);