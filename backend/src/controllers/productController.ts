import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sku, categoryId, price, stock, minStock, description } = req.body;

    if (!name || !sku || !categoryId) {
      res.status(400).json({ message: 'Nombre, SKU y Categoría son requeridos.' });
      return;
    }

    // Validar regla estricta: cero caracteres especiales en campos de texto
    const regexEspecial = /[^a-zA-Z0-9\s]/;
    if (regexEspecial.test(name) || (description && regexEspecial.test(description))) {
      res.status(400).json({ message: 'No se permiten caracteres especiales.' });
      return;
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingSku) {
      res.status(400).json({ message: 'Ya existe un producto con este SKU.' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId: parseInt(categoryId),
        price: price ? parseFloat(price) : 0.0,
        stock: stock ? parseInt(stock) : 0,
        minStock: minStock ? parseInt(minStock) : 5,
        description: description ? description.trim() : null
      },
      include: {
        category: { select: { name: true } }
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Eliminación lógica
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
