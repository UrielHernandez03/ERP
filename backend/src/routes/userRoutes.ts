import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getUsers);
router.put('/:id/role', authenticate, updateUserRole);
router.delete('/:id', authenticate, deleteUser);

export default router;
