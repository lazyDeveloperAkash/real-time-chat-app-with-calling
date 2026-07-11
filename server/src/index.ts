import http from 'http';
import app from '@/app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';
import { disconnectRedis } from '@/lib/redis';
import { initSocket, closeSocket } from '@/socket';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    initSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📚 API docs at http://localhost:${env.PORT}/api/docs`);
    });
  } catch (error) {
    logger.error({ err: (error as Error).message }, '❌ Failed to start server');
    process.exit(1);
  }
};

startServer();

// ─── Graceful shutdown ──────────────────────────────────────
let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`🛑 ${signal} received — shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error('⏱️  Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);

  try {
    await closeSocket();
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    await prisma.$disconnect();
    await disconnectRedis();
    clearTimeout(forceExit);
    logger.info('✅ Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err: (err as Error).message }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
