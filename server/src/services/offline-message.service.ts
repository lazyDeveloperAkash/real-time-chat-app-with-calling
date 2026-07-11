import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

const OFFLINE_TTL_SECONDS = 7 * 24 * 60 * 60; // keep undelivered pointers for 7 days
const key = (userId: string) => `offline:${userId}`;

/** Queues a message id for a currently-offline recipient. */
export async function queueOfflineMessage(userId: string, messageId: string): Promise<void> {
  await redis.rpush(key(userId), messageId);
  await redis.expire(key(userId), OFFLINE_TTL_SECONDS);
}

/**
 * Fetches and removes all queued messages for a user (called on reconnect),
 * hydrated from the DB and returned in original FIFO order.
 */
export async function drainOfflineMessages(userId: string) {
  const ids = await redis.lrange(key(userId), 0, -1);
  if (ids.length === 0) return [];

  const messages = await prisma.message.findMany({
    where: { id: { in: ids } },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await redis.del(key(userId));

  const order = new Map(ids.map((id, i) => [id, i]));
  return messages.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
