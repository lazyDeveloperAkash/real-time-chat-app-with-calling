import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { requestId } from '@/middlewares/request-id.middleware';
import { apiRateLimiter } from '@/middlewares/rate-limit.middleware';
import { notFoundHandler, errorHandler } from '@/middlewares/error.middleware';
import { setupSwagger } from '@/lib/swagger';
import apiRoutes from '@/routes';

const app: Express = express();

// Trust the first proxy (Render/Railway) so req.ip reflects the real client.
app.set('trust proxy', 1);

// ─── Core middleware ────────────────────────────────────────
app.use(requestId);
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', async (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: 'unknown',
    redis: 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = 'connected';
  } catch {
    health.db = 'disconnected';
    health.status = 'degraded';
  }

  try {
    const pong = await redis.ping();
    health.redis = pong === 'PONG' ? 'connected' : 'disconnected';
  } catch {
    health.redis = 'disconnected';
    health.status = 'degraded';
  }

  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

// ─── API docs ───────────────────────────────────────────────
setupSwagger(app);

// ─── API routes ─────────────────────────────────────────────
app.use('/api', apiRateLimiter, apiRoutes);

// ─── 404 + error handling ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
