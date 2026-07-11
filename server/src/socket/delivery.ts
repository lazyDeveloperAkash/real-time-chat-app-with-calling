import { prisma } from '@/lib/prisma';
import { queueOfflineMessage } from '@/services/offline-message.service';
import { isUserOnline, userRoom } from './presence';
import type { TypedServer } from './types';

interface DeliverableMessage {
  message: { id: string; senderId: string } & Record<string, unknown>;
  conversationId: string;
  receiverIds: string[];
  isGroup: boolean;
}

/**
 * Delivers a persisted message to its recipients: online recipients receive it
 * over their socket room immediately; offline recipients get the message id
 * queued in Redis for delivery on reconnect. For DMs, a `message-delivered`
 * receipt is sent back to the sender once the peer has it.
 */
export async function deliverMessage(io: TypedServer, payload: DeliverableMessage): Promise<void> {
  const { message, receiverIds, isGroup } = payload;
  const deliveredTo: string[] = [];

  for (const receiverId of receiverIds) {
    if (await isUserOnline(receiverId)) {
      io.to(userRoom(receiverId)).emit('new-message', { message });
      deliveredTo.push(receiverId);
    } else {
      await queueOfflineMessage(receiverId, message.id);
    }
  }

  // DM: if the single peer received it, promote status to DELIVERED + notify sender.
  if (!isGroup && deliveredTo.length > 0) {
    await prisma.message
      .update({ where: { id: message.id }, data: { status: 'DELIVERED' } })
      .catch(() => undefined);
    io.to(userRoom(message.senderId)).emit('message-delivered', { messageId: message.id });
  }
}
