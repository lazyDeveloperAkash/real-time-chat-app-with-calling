import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Populated by authMiddleware after a valid access token is verified. */
      user?: { id: string };
      /** Correlation id populated by requestId middleware. */
      id?: string;
    }
  }
}

export {};
