import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Protegemos todas las rutas de este router con el middleware
router.use(authenticate);

router.get('/stats', getDashboardStats);

export default router;
