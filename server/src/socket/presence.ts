import { redis } from '@/lib/redis';

/**
 * Presence is tracked as a socket-count per user in a Redis hash so a user is
 * "online" as long as at least one device/tab is connected (works across
 * multiple server instances behind the Redis adapter).
 */
const ONLINE_HASH = 'presence:sockets';

/** @returns the user's socket count after incrementing. */
export async function addUserSocket(userId: string): Promise<number> {
  return redis.hincrby(ONLINE_HASH, userId, 1);
}

/** @returns the user's remaining socket count after decrementing (0 when offline). */
export async function removeUserSocket(userId: string): Promise<number> {
  const remaining = await redis.hincrby(ONLINE_HASH, userId, -1);
  if (remaining <= 0) {
    await redis.hdel(ONLINE_HASH, userId);
    return 0;
  }
  return remaining;
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const count = await redis.hget(ONLINE_HASH, userId);
  return !!count && parseInt(count, 10) > 0;
}

/** Room name a user's sockets join so we can address all their devices at once. */
export const userRoom = (userId: string): string => `user:${userId}`;

/** Room name for a conversation (used for typing indicators). */
export const conversationRoom = (conversationId: string): string => `conv:${conversationId}`;
