import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Attaches a unique correlation id to every request (honouring an incoming
 * X-Request-Id if present) and echoes it back in the response header so it can
 * be surfaced in logs and error responses for tracing/support.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  const id = (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
