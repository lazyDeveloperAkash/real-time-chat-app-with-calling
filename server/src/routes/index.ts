import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import groupRoutes from './group.routes';
import uploadRoutes from './upload.routes';
import callRoutes from './call.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/groups', groupRoutes);
router.use('/upload', uploadRoutes);
router.use('/calls', callRoutes);

export default router;
