import { Router } from 'express';
import { ChatController } from '@/controllers/chat.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import {
  getMessagesSchema,
  getGroupMessagesSchema,
  sendMessageSchema,
} from '@/schemas/chat.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/chats:
 *   get:
 *     tags: [Chats]
 *     summary: List all conversations for the current user
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Conversation list ordered by last activity }
 */
router.get('/', ChatController.getConversations);

/**
 * @openapi
 * /api/chats/groups/{groupId}/messages:
 *   get:
 *     tags: [Chats]
 *     summary: Get paginated group message history
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: cursor
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Messages in chronological order + nextCursor }
 */
router.get(
  '/groups/:groupId/messages',
  validate(getGroupMessagesSchema),
  ChatController.getGroupMessages,
);

/**
 * @openapi
 * /api/chats/{id}/messages:
 *   get:
 *     tags: [Chats]
 *     summary: Get paginated DM history (by conversation id or user id)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: cursor
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: Messages in chronological order + nextCursor }
 *   post:
 *     tags: [Chats]
 *     summary: Send a message (REST fallback when offline)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               type: { type: string, enum: [TEXT, IMAGE, FILE, AUDIO_MSG, VIDEO_MSG], default: TEXT }
 *     responses:
 *       201: { description: Message persisted }
 */
router.get('/:id/messages', validate(getMessagesSchema), ChatController.getMessages);
router.post('/:id/messages', validate(sendMessageSchema), ChatController.sendMessage);

export default router;
