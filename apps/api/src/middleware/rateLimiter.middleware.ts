import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

// General limiter: 100 requests / minute
const generalLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

// Auth limiter: 10 requests / 15 minutes
const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 900,
});

const limitHandler = (
  limiter: RateLimiterMemory,
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