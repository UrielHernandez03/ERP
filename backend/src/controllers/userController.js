"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUsers = void 0;
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
// Obtener todos los usuarios (solo Admin)
const getUsers = async (req, res) => {
    try {
        if (req.user?.role !== client_1.Role.ADMINISTRADOR) {
            res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
            return;
        }
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
};
exports.getUsers = getUsers;
// Actualizar rol de un usuario (solo Admin)
const updateUserRole = async (req, res) => {
    try {
        if (req.user?.role !== client_1.Role.ADMINISTRADOR) {
            res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
            return;
        }
        const { id } = req.params;
        const { role } = req.body;
        if (!role || !Object.values(client_1.Role).includes(role)) {
            res.status(400).json({ message: 'Rol inválido o no especificado.' });
            return;
        }
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'ID de usuario inválido.' });
            return;
        }
        // Evitar que el administrador se cambie el rol a sí mismo para no perder acceso
        if (userId === req.user.id) {
            res.status(400).json({ message: 'No puedes cambiar tu propio rol.' });
            return;
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { role: role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        res.json({ message: 'Rol de usuario actualizado con éxito.', user: updatedUser });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar rol.' });
    }
};
exports.updateUserRole = updateUserRole;
// Eliminar un usuario (solo Admin)
const deleteUser = async (req, res) => {
    try {
        if (req.user?.role !== client_1.Role.ADMINISTRADOR) {
            res.status(403).json({ message: 'Acceso denegado. Se requiere ser ADMINISTRADOR.' });
            return;
        }
        const { id } = req.params;
        const userId = parseInt(id, 10);
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
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userExists) {
            res.status(404).json({ message: 'Usuario no encontrado.' });
            return;
        }
        await prisma_1.prisma.user.delete({
            where: { id: userId },
        });
        res.json({ message: 'Usuario eliminado con éxito.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map