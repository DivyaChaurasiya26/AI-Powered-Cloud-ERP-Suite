import { Worker } from "bullmq";

import { redis } from "../../../config/redis";

import { sendEmail } from "../services/email.service";

export const emailWorker =
  new Worker(
    "email-queue",
    async (job) => {
      const {
        to,
        subject,
        text,
      } = job.data;

      await sendEmail(
        to,
        subject,
        text
      );
    },
    {
      connection: redis,
    }
  );