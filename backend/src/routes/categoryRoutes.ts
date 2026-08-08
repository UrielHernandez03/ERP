import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getCategories);
router.post('/', authenticate, createCategory);

export default router;
