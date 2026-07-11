import { Request, Response, NextFunction } from 'express';
import { getImageKitAuthParams } from '@/lib/imagekit';
import { env } from '@/config/env';
import { ApiResponse } from '@/utils/api-response';

export class UploadController {
  /** Returns ImageKit client-side upload auth params (signature/token/expire). */
  static getAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      const authParams = getImageKitAuthParams();
      res.status(200).json(
        new ApiResponse(200, {
          ...authParams,
          publicKey: env.IMAGEKIT_PUBLIC_KEY,
          urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
