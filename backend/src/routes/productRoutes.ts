import { Router } from 'express';
import { getProducts, createProduct, deleteProduct } from '../controllers/productController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, createProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
