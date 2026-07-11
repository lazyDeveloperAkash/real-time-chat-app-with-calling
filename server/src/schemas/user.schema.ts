import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    contact: z.string().length(10).regex(/^\d+$/).optional(),
  }),
});

export const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url(),
    avatarFileId: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(128),
  }),
});

export const searchUserSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});
