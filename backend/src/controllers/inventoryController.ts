import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        provider: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error obteniendo transacciones de inventario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, quantity, notes, productId, providerId } = req.body;

    if (!type || !quantity || !productId) {
      res.status(400).json({ message: 'El tipo, cantidad y producto son obligatorios.' });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      res.status(400).json({ message: 'La cantidad debe ser un número válido.' });
      return;
    }

    if (qty <= 0 && type !== 'ADJUSTMENT') {
      res.status(400).json({ message: 'La cantidad debe ser mayor a cero para entradas y salidas.' });
      return;
    }

    if (notes && /[^a-zA-Z0-9\s]/.test(notes)) {
      res.status(400).json({ message: 'Las notas no pueden contener caracteres especiales.' });
      return;
    }

    // Ejecutar ambas operaciones (crear registro y actualizar stock) como una transacción atómica
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener producto actual
      const product = await tx.product.findUnique({ where: { id: parseInt(productId) } });
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // 2. Calcular nuevo stock
      let newStock = product.stock;
      if (type === 'IN') {
        newStock += qty;
      } else if (type === 'OUT') {
        if (product.stock < qty) {
          throw new Error('Stock insuficiente para realizar esta salida');
        }
        newStock -= qty;
      } else if (type === 'ADJUSTMENT') {
        newStock += qty;
        if (newStock < 0) {
           throw new Error('El ajuste resultaría en un stock negativo');
        }
      } else {
        throw new Error('Tipo de transacción inválido');
      }

      // 3. Crear registro de historial
      const transaction = await tx.inventoryTransaction.create({
        data: {
          type,
          quantity: qty,
          notes: notes ? notes.trim() : null,
          productId: parseInt(productId),
          providerId: providerId ? parseInt(providerId) : null
        }
      });

      // 4. Actualizar stock del producto
      await tx.product.update({
        where: { id: parseInt(productId) },
        data: { stock: newStock }
      });

      return transaction;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error al crear transacción de inventario:', error);
    res.status(400).json({ message: error.message || 'Error al procesar el movimiento de inventario.' });
  }
};
