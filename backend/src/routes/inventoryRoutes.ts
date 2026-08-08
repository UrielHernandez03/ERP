import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/inventoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getTransactions);
router.post('/', authenticate, createTransaction);

export default router;
