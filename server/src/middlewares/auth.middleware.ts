import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/token';
import { ApiError } from '@/utils/api-error';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const payload = verifyAccessToken(token);
    (req as any).user = { id: payload.id };
    
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
};
