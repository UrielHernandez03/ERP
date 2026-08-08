import { Router } from 'express';
import { getProviders, createProvider } from '../controllers/providerController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getProviders);
router.post('/', authenticate, createProvider);

export default router;
