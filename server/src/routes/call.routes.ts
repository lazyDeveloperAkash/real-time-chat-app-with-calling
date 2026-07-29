import { Router } from 'express';
import express from 'express';
import { CallController } from '@/controllers/call.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import {
  startCallSchema,
  callIdParamSchema,
  callHistorySchema,
} from '@/schemas/call.schema';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Calls
 *     description: Audio/video call lifecycle (LiveKit-backed)
 */

// LiveKit webhook — no user auth; verified by API key/secret. Needs the raw body.
router.post('/webhook', express.raw({ type: '*/*' }), CallController.webhook);

// All remaining call routes require an authenticated user.
router.use(authMiddleware);

/**
 * @openapi
 * /api/calls:
 *   post:
 *     tags: [Calls]
 *     summary: Start a call in a conversation (rings online participants)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, type]
 *             properties:
 *               conversationId: { type: string, format: uuid }
 *               type: { type: string, enum: [AUDIO, VIDEO] }
 *     responses:
 *       201: { description: Call started; returns callId, roomName, LiveKit token & url }
 *       503: { description: Calling not configured }
 *   get:
 *     tags: [Calls]
 *     summary: Paginated call history
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Call log list }
 */
router.post('/', validate(startCallSchema), CallController.start);
router.get('/', validate(callHistorySchema), CallController.history);

/**
 * @openapi
 * /api/calls/{id}/accept:
 *   post:
 *     tags: [Calls]
 *     summary: Accept an incoming call (returns a LiveKit token)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Accepted; returns token & url }
 */
router.post('/:id/accept', validate(callIdParamSchema), CallController.accept);
router.post('/:id/reject', validate(callIdParamSchema), CallController.reject);
router.post('/:id/cancel', validate(callIdParamSchema), CallController.cancel);
router.post('/:id/end', validate(callIdParamSchema), CallController.end);

export default router;
