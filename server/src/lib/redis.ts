import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Primary Redis connection — used for presence, offline queues, OTP storage,
 * rate limiting, and application-level pub/sub.
 *
 * `maxRetriesPerRequest: null` keeps commands queued during brief reconnects
 * instead of throwing, and is also required by the Socket.IO Redis adapter.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error({ err: err.message }, '❌ Redis error'));

/**
 * Creates an isolated Redis connection. The Socket.IO Redis adapter needs two
 * dedicated clients (pub + sub) that are separate from the primary client.
 */
export const createRedisClient = (): Redis =>
  new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
};
