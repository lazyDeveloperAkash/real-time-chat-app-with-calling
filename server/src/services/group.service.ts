import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/api-error';

export class GroupService {
  static async createGroup(creatorId: string, data: any) {
    const { name, avatarUrl, avatarFileId, memberIds } = data;

    // Verify members exist
    const users = await prisma.user.findMany({
      where: { id: { in: memberIds } },
    });
    if (users.length !== memberIds.length) {
      throw new ApiError(400, "One or more member IDs are invalid");
    }

    const allMemberIds = [...new Set([creatorId, ...memberIds])];

    // Create group, conversation, and members in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          isGroup: true,
          participants: {
            create: allMemberIds.map(userId => ({ userId })),
          },
        },
      });

      const group = await tx.group.create({
        data: {
          name,
          avatarUrl,
          avatarFileId,
          creatorId,
          conversationId: conv.id,
          members: {
            create: allMemberIds.map(userId => ({
              userId,
              role: userId === creatorId ? 'ADMIN' : 'MEMBER',
            })),
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true, isOnline: true } }
            }
          },
        }
      });

      return group;
    });

    return result;
  }

  static async getGroup(userId: string, groupId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } }
          }
        }
      }
    });

    if (!group) throw new ApiError(404, "Group not found");

    if (!group.members.some(m => m.userId === userId)) {
      throw new ApiError(403, "You are not a member of this group");
    }

    return group;
  }

  static async updateGroup(userId: string, groupId: string, data: any) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
    if (!group) throw new ApiError(404, "Group not found");

    const member = group.members.find(m => m.userId === userId);
    if (!member || member.role !== 'ADMIN') {
      throw new ApiError(403, "Only admins can update group info");
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data,
    });
    return updatedGroup;
  }

  static async addMembers(userId: string, groupId: string, memberIds: string[]) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
    if (!group) throw new ApiError(404, "Group not found");

    const member = group.members.find(m => m.userId === userId);
    if (!member || member.role !== 'ADMIN') {
      throw new ApiError(403, "Only admins can add members");
    }

    const existingMemberIds = new Set(group.members.map(m => m.userId));
    const newMembers = memberIds.filter(id => !existingMemberIds.has(id));

    if (newMembers.length === 0) return group;

    await prisma.$transaction(async (tx) => {
      // Add to Group members
      await tx.groupMember.createMany({
        data: newMembers.map(id => ({ groupId, userId: id, role: 'MEMBER' })),
      });
      // Add to Conversation participants
      await tx.conversationParticipant.createMany({
        data: newMembers.map(id => ({ conversationId: group.conversationId, userId: id })),
      });
    });

    return this.getGroup(userId, groupId);
  }

  static async removeMember(userId: string, groupId: string, targetId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
    if (!group) throw new ApiError(404, "Group not found");

    const member = group.members.find(m => m.userId === userId);
    if (!member) throw new ApiError(403, "You are not a member of this group");

    if (userId !== targetId && member.role !== 'ADMIN') {
      throw new ApiError(403, "Only admins can remove other members");
    }

    if (userId === targetId && group.creatorId === userId) {
      throw new ApiError(400, "Creator cannot leave the group. Delete the group instead or transfer ownership (not implemented).");
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId: targetId } },
      });
      await tx.conversationParticipant.delete({
        where: { conversationId_userId: { conversationId: group.conversationId, userId: targetId } },
      });
    });
  }

  static async deleteGroup(userId: string, groupId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new ApiError(404, "Group not found");

    if (group.creatorId !== userId) {
      throw new ApiError(403, "Only the creator can delete the group");
    }

    // Since conversation handles cascade deletes for participants and messages, we just delete conversation
    await prisma.conversation.delete({
      where: { id: group.conversationId },
    });
  }
}
