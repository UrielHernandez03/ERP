import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma';

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, rfc } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del cliente es requerido.' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        rfc: rfc ? rfc.trim().toUpperCase() : null
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, rfc } = req.body;

    if (!name) {
      res.status(400).json({ message: 'El nombre del cliente es requerido.' });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id: parseInt(id as string) },
      data: {
        name: name.trim(),
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        rfc: rfc ? rfc.trim().toUpperCase() : null
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Eliminación lógica
    await prisma.customer.update({
      where: { id: parseInt(id as string) },
      data: { isActive: false }
    });

    res.json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
