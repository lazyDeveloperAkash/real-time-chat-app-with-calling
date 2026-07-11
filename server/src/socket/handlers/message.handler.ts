import { ChatService } from '@/services/chat.service';
import { logger } from '@/utils/logger';
import { deliverMessage } from '../delivery';
import { userRoom } from '../presence';
import type { TypedServer, TypedSocket } from '../types';

export function registerMessageHandlers(io: TypedServer, socket: TypedSocket): void {
  const userId = socket.data.userId;

  // Client sends a new message.
  socket.on('send-message', async (payload, ack) => {
    try {
      const { receiverId, content, type } = payload;
      const result = await ChatService.sendMessage(
        userId,
        receiverId,
        content,
        type ?? 'TEXT',
      );

      await deliverMessage(io, result as any);

      ack?.({ success: true, message: result.message });
    } catch (err) {
      logger.error({ err: (err as Error).message, userId }, 'send-message failed');
      ack?.({ success: false, error: (err as Error).message });
    }
  });

  // Client opened a conversation → mark unread messages as read.
  socket.on('message-read', async (payload) => {
    try {
      const { conversationId } = payload;
      const { senderIds } = await ChatService.markConversationRead(userId, conversationId);
      for (const senderId of senderIds) {
        io.to(userRoom(senderId)).emit('message-read', { conversationId, readBy: userId });
      }
    } catch (err) {
      logger.error({ err: (err as Error).message, userId }, 'message-read failed');
    }
  });
}
