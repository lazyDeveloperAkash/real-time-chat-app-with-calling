import { Request, Response, NextFunction } from 'express';
import { redis } from '@/lib/redis';
import { ApiError } from '@/utils/api-error';
import { logger } from '@/utils/logger';

interface RateLimitOptions {
  /** Window length in seconds. */
  windowSec: number;
  /** Max requests allowed per identifier within the window. */
  max: number;
  /** Namespace so different limiters don't share counters. */
  keyPrefix: string;
}

/**
 * Redis-backed fixed-window rate limiter. Keyed by authenticated user id when
 * available, otherwise by client IP. Fails **open** if Redis is unavailable so
 * a Redis outage never takes down the API.
 */
export const rateLimit = ({ windowSec, max, keyPrefix }: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.user?.id || req.ip || 'unknown';
    const key = `ratelimit:${keyPrefix}:${identifier}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));

      if (count > max) {
        res.setHeader('Retry-After', String(ttl > 0 ? ttl : windowSec));
        throw new ApiError(429, 'Too many requests, please try again later');
      }

      next();
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      logger.warn({ err: (err as Error).message }, 'Rate limiter unavailable — failing open');
      next();
    }
  };
};

/** 10 requests / minute — protects auth endpoints from brute force. */
export const authRateLimiter = rateLimit({ windowSec: 60, max: 10, keyPrefix: 'auth' });

/** 100 requests / minute — general API protection. */
export const apiRateLimiter = rateLimit({ windowSec: 60, max: 100, keyPrefix: 'api' });
