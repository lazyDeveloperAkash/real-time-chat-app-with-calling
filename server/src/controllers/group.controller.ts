import { Request, Response, NextFunction } from 'express';
import { GroupService } from '@/services/group.service';
import { ApiResponse } from '@/utils/api-response';

export class GroupController {
  static async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const group = await GroupService.createGroup(userId, req.body);
      res.status(201).json(new ApiResponse(201, group, "Group created successfully"));
    } catch (error) {
      next(error);
    }
  }

  static async getGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const group = await GroupService.getGroup(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, group));
    } catch (error) {
      next(error);
    }
  }

  static async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const group = await GroupService.updateGroup(userId, String(req.params.id), req.body);
      res.status(200).json(new ApiResponse(200, group, "Group updated"));
    } catch (error) {
      next(error);
    }
  }

  static async addMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const group = await GroupService.addMembers(userId, String(req.params.id), req.body.memberIds);
      res.status(200).json(new ApiResponse(200, group, "Members added"));
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await GroupService.removeMember(userId, String(req.params.id), String(req.params.userId));
      res.status(200).json(new ApiResponse(200, null, "Member removed"));
    } catch (error) {
      next(error);
    }
  }

  static async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await GroupService.deleteGroup(userId, String(req.params.id));
      res.status(200).json(new ApiResponse(200, null, "Group deleted"));
    } catch (error) {
      next(error);
    }
  }
}
