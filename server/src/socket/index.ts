import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { createRedisClient } from '@/lib/redis';
import { drainOfflineMessages } from '@/services/offline-message.service';
import { socketAuth } from './auth';
import { addUserSocket, removeUserSocket, userRoom } from './presence';
import { registerMessageHandlers } from './handlers/message.handler';
import { registerPresenceHandlers } from './handlers/presence.handler';
import type { TypedServer } from './types';

let io: TypedServer | null = null;

export function initSocket(httpServer: HttpServer): TypedServer {
  io = new Server(httpServer, {
    cors: { origin: env.ALLOWED_ORIGINS, credentials: true },
  });

  // Redis adapter → broadcasts reach clients on every server instance.
  const pubClient = createRedisClient();
  const subClient = createRedisClient();
  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    socket.join(userRoom(userId));

    const count = await addUserSocket(userId);
    if (count === 1) {
      await prisma.user
        .update({ where: { id: userId }, data: { isOnline: true, lastSeen: new Date() } })
        .catch(() => undefined);
      socket.broadcast.emit('user-online', { userId, isOnline: true });
    }

    logger.info({ userId, socketId: socket.id }, '🔌 Socket connected');

    registerMessageHandlers(io!, socket);
    registerPresenceHandlers(io!, socket);

    // Flush any messages that arrived while this user was offline.
    try {
      const queued = await drainOfflineMessages(userId);
      if (queued.length > 0) {
        for (const message of queued) {
          socket.emit('new-message', { message });
        }
        const ids = queued.map((m) => m.id);
        await prisma.message.updateMany({
          where: { id: { in: ids }, status: 'SENT' },
          data: { status: 'DELIVERED' },
        });
        for (const message of queued) {
          io!.to(userRoom(message.senderId)).emit('message-delivered', { messageId: message.id });
        }
      }
    } catch (err) {
      logger.error({ err: (err as Error).message, userId }, 'Offline drain failed');
    }

    socket.on('disconnect', async () => {
      const remaining = await removeUserSocket(userId);
      if (remaining === 0) {
        await prisma.user
          .update({ where: { id: userId }, data: { isOnline: false, lastSeen: new Date() } })
          .catch(() => undefined);
        socket.broadcast.emit('user-online', { userId, isOnline: false });
      }
      logger.info({ userId, socketId: socket.id }, '🔌 Socket disconnected');
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

export function getIO(): TypedServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export async function closeSocket(): Promise<void> {
  if (io) {
    await io.close();
    io = null;
  }
}
