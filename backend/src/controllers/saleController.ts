import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, items, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'La venta debe incluir al menos un artículo.' });
      return;
    }

    // Procesar la venta dentro de una transacción de BD
    const sale = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      
      for (const item of items) {
         subtotal += parseFloat(item.price) * parseInt(item.quantity);
      }
      const tax = subtotal * 0.16; // 16% IVA por defecto
      const total = subtotal + tax;

      // Crear la Venta
      const newSale = await tx.sale.create({
        data: {
          customerId: customerId ? parseInt(customerId) : null,
          subtotal,
          tax,
          total,
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: items.map((i: any) => ({
              productId: parseInt(i.productId),
              quantity: parseInt(i.quantity),
              price: parseFloat(i.price),
              subtotal: parseFloat(i.price) * parseInt(i.quantity)
            }))
          }
        },
        include: { items: true, customer: true }
      });

      // Descontar inventario y registrar en Kárdex
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: parseInt(item.productId) } });
        if (!product) {
          throw new Error(`El producto con ID ${item.productId} no existe.`);
        }
        if (product.stock < parseInt(item.quantity)) {
          throw new Error(`Stock insuficiente para el producto: ${product.name} (Disponible: ${product.stock})`);
        }

        // Restar Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - parseInt(item.quantity) }
        });

        // Registrar en el Kárdex (Bitácora de Movimientos)
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: 'OUT',
            quantity: parseInt(item.quantity),
            notes: `Venta POS #${newSale.id.toString().padStart(6, '0')} - ${paymentMethod || 'CASH'}`
          }
        });
      }
      return newSale;
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('Error al procesar venta:', error);
    res.status(400).json({ message: error.message || 'Error interno al procesar la venta.' });
  }
};
