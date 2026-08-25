import { Router } from 'express';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../controllers/providerController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getProviders);
router.post('/', authenticate, createProvider);
router.put('/:id', authenticate, updateProvider);
router.delete('/:id', authenticate, authorizeRole(['ADMINISTRADOR']), deleteProvider);

export default router;
