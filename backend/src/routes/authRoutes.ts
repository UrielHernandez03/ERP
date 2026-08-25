import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getMe } from '../controllers/authController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

// Solo el Administrador puede crear (registrar) nuevos usuarios en el sistema
router.post('/register', authenticate, authorizeRole(['ADMINISTRADOR']), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

export default router;
