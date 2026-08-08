import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
      return;
    }

    // Validar regla estricta: cero caracteres especiales en el nombre
    if (/[^a-zA-Z0-9\s]/.test(name)) {
      res.status(400).json({ message: 'El nombre de la categoría no puede contener caracteres especiales.' });
      return;
    }

    const existing = await prisma.category.findUnique({
      where: { name }
    });

    if (existing) {
      res.status(400).json({ message: 'Ya existe una categoría con ese nombre.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
