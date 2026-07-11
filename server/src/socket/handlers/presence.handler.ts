import { conversationRoom } from '../presence';
import type { TypedServer, TypedSocket } from '../types';

export function registerPresenceHandlers(_io: TypedServer, socket: TypedSocket): void {
  const userId = socket.data.userId;

  // Join conversation rooms (from the client's chat list) to receive typing events.
  socket.on('join-rooms', (payload) => {
    const roomIds = Array.isArray(payload?.roomIds) ? payload.roomIds : [];
    for (const id of roomIds) {
      socket.join(conversationRoom(id));
    }
  });

  // Broadcast typing state to the other participants of the conversation.
  socket.on('typing', (payload) => {
    const { conversationId, isTyping } = payload;
    socket
      .to(conversationRoom(conversationId))
      .emit('user-typing', { userId, conversationId, isTyping });
  });
}
