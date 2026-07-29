import { z } from 'zod';

export const startCallSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
    type: z.enum(['AUDIO', 'VIDEO']),
  }),
});

export const callIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid call ID'),
  }),
});

export const callHistorySchema = z.object({
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
});
