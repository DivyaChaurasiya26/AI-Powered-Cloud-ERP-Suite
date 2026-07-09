import { Queue } from "bullmq";

import { redisConnection } from "../../../config/redis";

export const anomalyScanQueue = new Queue("anomalyScanQueue", {
  connection: redisConnection,
});

export const scheduleRecurringScan = async () => {
  await anomalyScanQueue.add(
    "scan-all-tenants",
    {},
    {
      repeat: { every: 24 * 60 * 60 * 1000 },
      jobId: "anomaly-scan-daily",
    }
  );
};
