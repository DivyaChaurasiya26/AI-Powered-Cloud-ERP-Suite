import { Redis } from "ioredis";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Disable Redis on Render
export const redis =
  process.env.NODE_ENV === "production"
    ? null
    : new Redis(redisConnection);