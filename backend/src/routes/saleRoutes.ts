import { Router } from 'express';
import { getSales, createSale } from '../controllers/saleController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getSales);
router.post('/', authenticate, createSale);
// Nota: Por seguridad financiera, normalmente las ventas no se editan ni eliminan directamente.
// En un sistema real se hacen "Devoluciones" o "Notas de Crédito".

export default router;
