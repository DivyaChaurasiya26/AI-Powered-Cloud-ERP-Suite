import { Worker } from "bullmq";

import { redis } from "../../../config/redis";

import { deliverWebhook } from "../services/webhook.service";

if (!redis) {
  throw new Error("[webhook-worker] Redis connection not available");
}

new Worker(
  "webhookQueue",

  async (job) => {
    const { url, payload } = job.data;

    console.log(
      `[webhook-worker] Delivering to ${url}`
    );

    await deliverWebhook(url, payload);

    console.log(
      `[webhook-worker] Delivered to ${url}`
    );
  },

  {
    connection: redis,
  }
);