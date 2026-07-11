import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/api-error';
// We'll import socket functions later when we build Phase 1G
// import { queueOfflineMessage, emitNewMessage } from '@/socket/handlers/message.handler';

export class ChatService {
  static async getConversations(userId: string) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            group: {
              select: { id: true, name: true, avatarUrl: true },
            },
            participants: {
              where: { userId: { not: userId } },
              select: {
                user: {
                  select: { id: true, name: true, avatarUrl: true, isOnline: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { content: true, type: true, createdAt: true, status: true, senderId: true },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    // Map to a cleaner format for the frontend
    return participants.map(p => {
      const conv = p.conversation;
      const isGroup = conv.isGroup;
      const otherUser = !isGroup && conv.participants[0] ? conv.participants[0].user : null;
      
      return {
        id: conv.id,
        isGroup,
        unreadCount: p.unreadCount,
        lastMessage: conv.messages[0] || null,
        chatEntity: isGroup ? conv.group : otherUser,
      };
    });
  }

  static async getOrCreateDirectConversation(userId1: string, userId2: string) {
    // Look for existing direct conversation between these two users
    const existingConv = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
      include: {
        participants: {
          where: { userId: { not: userId1 } },
          select: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true } } },
        }
      }
    });

    if (existingConv) return existingConv;

    // Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
      include: {
        participants: {
          where: { userId: { not: userId1 } },
          select: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true } } },
        }
      }
    });

    return newConv;
  }

  static async getMessages(userId: string, targetId: string, cursor?: string, limit: number = 50) {
    // Assume targetId is a conversation ID first, if not found, treat as User ID
    let convId = targetId;
    const existingConv = await prisma.conversation.findUnique({
      where: { id: targetId },
      include: { participants: { where: { userId } } }
    });

    if (!existingConv || existingConv.participants.length === 0) {
      // Might be a direct user ID
      const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!targetUser) throw new ApiError(404, "Conversation or User not found");
      
      const conv = await this.getOrCreateDirectConversation(userId, targetId);
      convId = conv.id;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    // Reset unread count
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: convId, userId } },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    // Return in chronological order
    return {
      messages: messages.reverse(),
      nextCursor,
      conversationId: convId,
    };
  }

  static async getGroupMessages(userId: string, groupId: string, cursor?: string, limit: number = 50) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        conversationId: true,
        members: { where: { userId }, select: { id: true } },
      },
    });

    if (!group) throw new ApiError(404, 'Group not found');
    if (group.members.length === 0) {
      throw new ApiError(403, 'You are not a member of this group');
    }

    return this.getMessages(userId, group.conversationId, cursor, limit);
  }

  static async sendMessage(senderId: string, targetId: string, content: string, type: any) {
    // Ensure conversation exists
    let convId = targetId;
    let conversation = await prisma.conversation.findUnique({
      where: { id: targetId },
      include: { participants: true }
    });

    if (!conversation) {
      const conv = await this.getOrCreateDirectConversation(senderId, targetId);
      convId = conv.id;
      conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: { participants: true }
      });
    }

    if (!conversation?.participants.some(p => p.userId === senderId)) {
      throw new ApiError(403, "Not a participant of this conversation");
    }

    const receiverIds = conversation.participants
      .filter(p => p.userId !== senderId)
      .map(p => p.userId);

    // Save message
    const message = await prisma.message.create({
      data: {
        senderId,
        conversationId: convId,
        content,
        type,
        status: 'SENT',
        receiverIdDirect: conversation.isGroup ? null : receiverIds[0],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: convId },
      data: { lastMessageId: message.id, lastMessageAt: message.createdAt },
    });

    // Increment unread count for receivers
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: convId, userId: { not: senderId } },
      data: { unreadCount: { increment: 1 } },
    });

    // Real-time delivery / offline queueing is handled by the caller (socket
    // handler or REST controller) using the returned recipient metadata.
    return {
      message,
      conversationId: convId,
      receiverIds,
      isGroup: conversation.isGroup,
    };
  }

  /**
   * Marks all messages in a conversation that were NOT sent by `userId` as READ,
   * resets the user's unread counter, and returns the distinct sender ids so the
   * socket layer can emit read receipts back to them.
   */
  static async markConversationRead(userId: string, conversationId: string) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ApiError(403, 'Not a participant of this conversation');

    const unread = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      data: { status: 'READ' },
    });

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    return { senderIds: unread.map((m) => m.senderId) };
  }
}
