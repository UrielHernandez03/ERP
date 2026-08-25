import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, authorizeRole(['ADMINISTRADOR']), deleteProduct);

export default router;
