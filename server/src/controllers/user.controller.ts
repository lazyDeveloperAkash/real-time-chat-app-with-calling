import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { ApiResponse } from '@/utils/api-response';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await UserService.getProfile(userId);
      res.status(200).json(new ApiResponse(200, profile));
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await UserService.updateProfile(userId, req.body);
      res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { avatarUrl, avatarFileId } = req.body;
      const profile = await UserService.updateAvatar(userId, avatarUrl, avatarFileId);
      res.status(200).json(new ApiResponse(200, profile, "Avatar updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const query = req.query.q as string;
      const users = await UserService.searchUsers(userId, query);
      res.status(200).json(new ApiResponse(200, users));
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const friends = await UserService.getFriends(userId);
      res.status(200).json(new ApiResponse(200, friends));
    } catch (error) {
      next(error);
    }
  }

  static async addFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const friendId = String(req.params.id);
      await UserService.addFriend(userId, friendId);
      res.status(200).json(new ApiResponse(200, null, "Friend added successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const friendId = String(req.params.id);
      await UserService.removeFriend(userId, friendId);
      res.status(200).json(new ApiResponse(200, null, "Friend removed successfully"));
    } catch (error) {
      next(error);
    }
  }
}
