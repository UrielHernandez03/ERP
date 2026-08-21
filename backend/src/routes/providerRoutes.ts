import { Router } from 'express';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../controllers/providerController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getProviders);
router.post('/', authenticate, createProvider);
router.put('/:id', authenticate, updateProvider);
router.delete('/:id', authenticate, deleteProvider);

export default router;
