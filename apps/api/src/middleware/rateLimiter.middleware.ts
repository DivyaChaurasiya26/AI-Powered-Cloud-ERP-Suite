import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../config/redis";

// ── General limiter: 100 requests / 60 seconds per IP ─────────────────────
const generalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_general",
  points: 100,
  duration: 60,
});

// ── Auth limiter: 10 requests / 15 minutes per IP ─────────────────────────
// Protects /api/auth/login and /api/auth/register from brute force
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl_auth",
  points: 10,
  duration: 900, // 15 minutes
});

const limitHandler = (
  limiter: RateLimiterRedis,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const key = req.ip ?? "unknown";

  limiter
    .consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    });
};

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => limitHandler(generalLimiter, req, res, next);

export const authRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => limitHandler(authLimiter, req, res, next);