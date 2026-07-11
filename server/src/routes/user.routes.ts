import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { updateProfileSchema, updateAvatarSchema, searchUserSchema } from '@/schemas/user.schema';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/me', UserController.getProfile);
router.patch('/me', validate(updateProfileSchema), UserController.updateProfile);
router.patch('/me/avatar', validate(updateAvatarSchema), UserController.updateAvatar);

router.get('/search', validate(searchUserSchema), UserController.searchUsers);

// Friend routes
router.get('/friends', UserController.getFriends);
router.post('/friends/:id', UserController.addFriend);
router.delete('/friends/:id', UserController.removeFriend);

export default router;
