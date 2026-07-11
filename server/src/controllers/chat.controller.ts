import { Request, Response, NextFunction } from 'express';
import { ChatService } from '@/services/chat.service';
import { ApiResponse } from '@/utils/api-response';
import { getIO } from '@/socket';
import { deliverMessage } from '@/socket/delivery';
import { logger } from '@/utils/logger';

export class ChatController {
  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const conversations = await ChatService.getConversations(userId);
      res.status(200).json(new ApiResponse(200, conversations));
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const targetId = String(req.params.id); // Conversation ID or User ID
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await ChatService.getMessages(userId, targetId, cursor, limit);
      res.status(200).json(new ApiResponse(200, result));
    } catch (error) {
      next(error);
    }
  }

  static async getGroupMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const groupId = String(req.params.groupId);
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await ChatService.getGroupMessages(userId, groupId, cursor, limit);
      res.status(200).json(new ApiResponse(200, result));
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = (req as any).user.id;
      const targetId = String(req.params.id);
      const { content, type } = req.body;
      
      const result = await ChatService.sendMessage(senderId, targetId, content, type);

      // Fire real-time delivery (REST fallback path). Never fail the HTTP
      // response if the socket layer is unavailable.
      try {
        await deliverMessage(getIO(), result as any);
      } catch (err) {
        logger.warn({ err: (err as Error).message }, 'Real-time delivery skipped');
      }

      res.status(201).json(new ApiResponse(201, result.message, 'Message sent'));
    } catch (error) {
      next(error);
    }
  }
}
