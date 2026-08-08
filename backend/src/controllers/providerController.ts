import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(providers);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, contactName, phone, email, address } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
      return;
    }

    if (/[^a-zA-Z0-9\s]/.test(name)) {
      res.status(400).json({ message: 'El nombre no puede contener caracteres especiales.' });
      return;
    }

    const existing = await prisma.provider.findUnique({
      where: { name }
    });

    if (existing) {
      res.status(400).json({ message: 'Ya existe un proveedor con ese nombre.' });
      return;
    }

    const provider = await prisma.provider.create({
      data: {
        name: name.trim(),
        contactName: contactName ? contactName.trim() : null,
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null
      }
    });

    res.status(201).json(provider);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
