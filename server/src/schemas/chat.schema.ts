import { z } from 'zod';

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation/user ID"),
  }),
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
  }),
});

export const getGroupMessagesSchema = z.object({
  params: z.object({
    groupId: z.string().uuid('Invalid group ID'),
  }),
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation/user ID"),
  }),
  body: z.object({
    content: z.string().min(1, "Message content is required").max(5000),
    type: z.enum(["TEXT", "IMAGE", "FILE", "AUDIO_MSG", "VIDEO_MSG"]).default("TEXT"),
  }),
});
