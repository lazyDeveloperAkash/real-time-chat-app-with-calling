import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '@/utils/api-error';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/** Terminal 404 handler for unmatched routes. */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
    requestId: req.id,
  });
};

/** Global error handler — normalizes every thrown error into the ApiResponse shape. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[] | undefined)?.join(', ');
        message = target ? `${target} already exists` : 'Resource already exists';
        break;
      }
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      default:
        statusCode = 400;
        message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  logger.error(
    {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      err: err instanceof Error ? err.message : String(err),
    },
    'Request failed',
  );

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
    requestId: req.id,
    ...(env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
  });
};
