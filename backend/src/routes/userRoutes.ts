import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, authorizeRole(['ADMINISTRADOR']), getUsers);
router.put('/:id/role', authenticate, authorizeRole(['ADMINISTRADOR']), updateUserRole);
router.delete('/:id', authenticate, authorizeRole(['ADMINISTRADOR']), deleteUser);

export default router;
