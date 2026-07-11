import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Group name must be at least 2 characters").max(100),
    avatarUrl: z.string().url().optional(),
    avatarFileId: z.string().optional(),
    memberIds: z.array(z.string().uuid()).min(1, "Group must have at least one other member"),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid group ID"),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().optional(),
    avatarFileId: z.string().optional(),
  }),
});

export const addMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid group ID"),
  }),
  body: z.object({
    memberIds: z.array(z.string().uuid()).min(1, "Must add at least one member"),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid group ID"),
    userId: z.string().uuid("Invalid user ID"),
  }),
});
