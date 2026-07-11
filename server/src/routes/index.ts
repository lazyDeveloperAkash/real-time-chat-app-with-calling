import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import groupRoutes from './group.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/groups', groupRoutes);
router.use('/upload', uploadRoutes);

export default router;
