import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/api-error';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        avatarUrl: true,
        lastSeen: true,
        isOnline: true,
      },
    });

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  static async updateProfile(userId: string, data: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        avatarUrl: true,
      },
    });
    return user;
  }

  static async updateAvatar(userId: string, avatarUrl: string, avatarFileId?: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl, avatarFileId },
      select: { id: true, avatarUrl: true },
    });
    return user;
  }

  static async searchUsers(userId: string, query: string) {
    // Search by name, email or contact (excluding the searcher themselves)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { contact: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        avatarUrl: true,
      },
      take: 20, // Limit results
    });
    return users;
  }

  static async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
            avatarUrl: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });
    return friendships.map(f => f.friend);
  }

  static async addFriend(userId: string, friendId: string) {
    if (userId === friendId) throw new ApiError(400, "Cannot add yourself as friend");
    
    // Check if friend exists
    const friend = await prisma.user.findUnique({ where: { id: friendId } });
    if (!friend) throw new ApiError(404, "User not found");

    // Add friend bidirectionally
    await prisma.$transaction([
      prisma.friendship.upsert({
        where: { userId_friendId: { userId, friendId } },
        update: {},
        create: { userId, friendId },
      }),
      prisma.friendship.upsert({
        where: { userId_friendId: { userId: friendId, friendId: userId } },
        update: {},
        create: { userId: friendId, friendId: userId },
      }),
    ]);
  }

  static async removeFriend(userId: string, friendId: string) {
    await prisma.$transaction([
      prisma.friendship.deleteMany({
        where: { userId, friendId },
      }),
      prisma.friendship.deleteMany({
        where: { userId: friendId, friendId: userId },
      }),
    ]);
  }
}
