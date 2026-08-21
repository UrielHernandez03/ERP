import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

// Obtener todos los usuarios (solo Admin)
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMINISTRADOR) {
      res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
      return;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// Actualizar rol de un usuario (solo Admin)
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMINISTRADOR) {
      res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
      return;
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(Role).includes(role as Role)) {
      res.status(400).json({ message: 'Rol inválido o no especificado.' });
      return;
    }

    const userId = parseInt(id as string, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: 'ID de usuario inválido.' });
      return;
    }

    // Evitar que el administrador se cambie el rol a sí mismo para no perder acceso
    if (userId === req.user.id) {
      res.status(400).json({ message: 'No puedes cambiar tu propio rol.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({ message: 'Rol de usuario actualizado con éxito.', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar rol.' });
  }
};

// Eliminar un usuario (solo Admin)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== Role.ADMINISTRADOR) {
      res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
      return;
    }

    const { id } = req.params;
    const userId = parseInt(id as string, 10);

    if (isNaN(userId)) {
      res.status(400).json({ message: 'ID de usuario inválido.' });
      return;
    }

    // Evitar auto-eliminación
    if (userId === req.user.id) {
      res.status(400).json({ message: 'No puedes eliminarte a ti mismo.' });
      return;
    }

    // Verificar si el usuario existe antes de intentar borrar
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
  }
};
