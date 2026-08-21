import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Nota: El modelo Provider en schema.prisma no tiene campo isActive, por lo que listamos todos
    const providers = await prisma.provider.findMany({
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
    const { name, contact, phone, email, address } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
      return;
    }

    if (/[^a-zA-Z0-9\s]/.test(name)) {
      res.status(400).json({ message: 'El nombre no puede contener caracteres especiales.' });
      return;
    }

    const existing = await prisma.provider.findFirst({
      where: { name }
    });

    if (existing) {
      res.status(400).json({ message: 'Ya existe un proveedor con ese nombre.' });
      return;
    }

    const provider = await prisma.provider.create({
      data: {
        name: name.trim(),
        contact: contact ? contact.trim() : null,
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

export const updateProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, contact, phone, email, address } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
      return;
    }

    if (/[^a-zA-Z0-9\s]/.test(name)) {
      res.status(400).json({ message: 'El nombre no puede contener caracteres especiales.' });
      return;
    }

    const existing = await prisma.provider.findFirst({
      where: {
        name,
        NOT: { id: parseInt(id as string) }
      }
    });

    if (existing) {
      res.status(400).json({ message: 'Ya existe otro proveedor con ese nombre.' });
      return;
    }

    const provider = await prisma.provider.update({
      where: { id: parseInt(id as string) },
      data: {
        name: name.trim(),
        contact: contact ? contact.trim() : null,
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null
      }
    });

    res.json(provider);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Eliminación física debido a que el modelo Provider no tiene campo isActive.
    // Manejamos si tiene dependencias en InventoryTransaction.
    await prisma.provider.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Proveedor eliminado correctamente.' });
  } catch (error: any) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ 
      message: 'No se puede eliminar el proveedor. Es posible que tenga transacciones de inventario asociadas.' 
    });
  }
};
