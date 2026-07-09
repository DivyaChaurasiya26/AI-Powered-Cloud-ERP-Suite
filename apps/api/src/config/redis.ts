import { Redis } from "ioredis";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Most managed Redis add-ons (Render, Upstash, Railway) hand out a single
// connection string rather than separate host/port — prefer REDIS_URL when
// present, and fall back to host/port for the local docker-compose setup.
// Previously this was gated on `NODE_ENV === "production"` (returning null,
// silently disabling every BullMQ queue in any real deployment) — see
// docs/adr/0004. Redis is now only unavailable if nothing is configured at
// all, which no longer happens in the deploy targets this repo ships for.
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis(redisConnection);