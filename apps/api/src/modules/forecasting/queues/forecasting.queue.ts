import { Queue } from "bullmq";

import { redisConnection } from "../../../config/redis";

export const forecastingQueue = new Queue(
  "forecastingQueue",
  {
    connection: redisConnection,
  }
);