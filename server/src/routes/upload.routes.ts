import { Router } from 'express';
import { UploadController } from '@/controllers/upload.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/upload/auth:
 *   get:
 *     tags: [Upload]
 *     summary: Get ImageKit client-side upload credentials
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: token, expire, signature, publicKey and urlEndpoint }
 */
router.get('/auth', UploadController.getAuth);

export default router;
