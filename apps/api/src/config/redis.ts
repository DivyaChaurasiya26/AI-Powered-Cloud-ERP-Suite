import { Redis } from "ioredis";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const redis =
  process.env.NODE_ENV === "production"
    ? null as any
    : new Redis(redisConnection);