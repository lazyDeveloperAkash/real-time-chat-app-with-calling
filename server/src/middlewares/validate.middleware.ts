import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '@/utils/api-error';

export const validate = (schema: z.ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, "Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
