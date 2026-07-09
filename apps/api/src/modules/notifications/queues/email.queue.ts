import { Queue } from "bullmq";
import { redis } from "../../../config/redis";

export const emailQueue =
  new Queue("email-queue", {
    // redis may be typed as Redis | null — cast to any to satisfy Queue connection typing
    connection: redis as any,
  });