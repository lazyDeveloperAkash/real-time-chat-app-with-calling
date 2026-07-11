import { Router } from 'express';
import { GroupController } from '@/controllers/group.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { createGroupSchema, updateGroupSchema, addMembersSchema, removeMemberSchema } from '@/schemas/group.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createGroupSchema), GroupController.createGroup);
router.get('/:id', GroupController.getGroup);
router.patch('/:id', validate(updateGroupSchema), GroupController.updateGroup);
router.delete('/:id', GroupController.deleteGroup);

router.post('/:id/members', validate(addMembersSchema), GroupController.addMembers);
router.delete('/:id/members/:userId', validate(removeMemberSchema), GroupController.removeMember);

export default router;
