import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getCustomers);
router.post('/', authenticate, createCustomer);
router.put('/:id', authenticate, updateCustomer);
router.delete('/:id', authenticate, authorizeRole(['ADMINISTRADOR']), deleteCustomer);

export default router;
