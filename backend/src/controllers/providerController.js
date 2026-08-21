"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProviders = void 0;
const prisma_1 = require("../prisma");
const getProviders = async (req, res) => {
    try {
        // Nota: El modelo Provider en schema.prisma no tiene campo isActive, por lo que listamos todos
        const providers = await prisma_1.prisma.provider.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(providers);
    }
    catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.getProviders = getProviders;
const createProvider = async (req, res) => {
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
        const existing = await prisma_1.prisma.provider.findFirst({
            where: { name }
        });
        if (existing) {
            res.status(400).json({ message: 'Ya existe un proveedor con ese nombre.' });
            return;
        }
        const provider = await prisma_1.prisma.provider.create({
            data: {
                name: name.trim(),
                contact: contact ? contact.trim() : null,
                phone: phone ? phone.trim() : null,
                email: email ? email.trim() : null,
                address: address ? address.trim() : null
            }
        });
        res.status(201).json(provider);
    }
    catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.createProvider = createProvider;
const updateProvider = async (req, res) => {
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
        const existing = await prisma_1.prisma.provider.findFirst({
            where: {
                name,
                NOT: { id: parseInt(id) }
            }
        });
        if (existing) {
            res.status(400).json({ message: 'Ya existe otro proveedor con ese nombre.' });
            return;
        }
        const provider = await prisma_1.prisma.provider.update({
            where: { id: parseInt(id) },
            data: {
                name: name.trim(),
                contact: contact ? contact.trim() : null,
                phone: phone ? phone.trim() : null,
                email: email ? email.trim() : null,
                address: address ? address.trim() : null
            }
        });
        res.json(provider);
    }
    catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.updateProvider = updateProvider;
const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        // Eliminación física debido a que el modelo Provider no tiene campo isActive.
        // Manejamos si tiene dependencias en InventoryTransaction.
        await prisma_1.prisma.provider.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Proveedor eliminado correctamente.' });
    }
    catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({
            message: 'No se puede eliminar el proveedor. Es posible que tenga transacciones de inventario asociadas.'
        });
    }
};
exports.deleteProvider = deleteProvider;
//# sourceMappingURL=providerController.js.map