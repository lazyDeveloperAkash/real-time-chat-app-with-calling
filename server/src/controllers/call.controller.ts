import { Request, Response, NextFunction } from 'express';
import { CallService } from '@/services/call.service';
import { ApiResponse } from '@/utils/api-response';
import { getWebhookReceiver } from '@/lib/livekit';
import { logger } from '@/utils/logger';
import type { CallType } from '@prisma/client';

export class CallController {
  static async start(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { conversationId, type } = req.body as { conversationId: string; type: CallType };
      const result = await CallService.start(userId, conversationId, type);
      res.status(201).json(new ApiResponse(201, result, 'Call started'));
    } catch (error) {
      next(error);
    }
  }

  static async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await CallService.accept(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, result, 'Call accepted'));
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await CallService.reject(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, null, 'Call rejected'));
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await CallService.cancel(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, null, 'Call canceled'));
    } catch (error) {
      next(error);
    }
  }

  static async end(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await CallService.leave(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, null, 'Left call'));
    } catch (error) {
      next(error);
    }
  }

  static async history(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await CallService.history(userId, cursor, limit);
      res.status(200).json(new ApiResponse(200, result));
    } catch (error) {
      next(error);
    }
  }

  /** LiveKit webhook — verified via the API key/secret (no user auth). */
  static async webhook(req: Request, res: Response) {
    try {
      const receiver = getWebhookReceiver();
      const raw = Buffer.isBuffer(req.body)
        ? req.body.toString('utf8')
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);
      const event = await receiver.receive(raw, req.get('Authorization'));
      await CallService.handleWebhookEvent(event as never);
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'LiveKit webhook processing failed');
    }
    // Always ack so LiveKit doesn't retry-storm.
    res.status(200).send('ok');
  }
}
