"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = require("../prisma");
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
            return;
        }
        if (/[^a-zA-Z0-9\s]/.test(name)) {
            res.status(400).json({ message: 'El nombre de la categoría no puede contener caracteres especiales.' });
            return;
        }
        const existing = await prisma_1.prisma.category.findFirst({
            where: { name, isActive: true }
        });
        if (existing) {
            res.status(400).json({ message: 'Ya existe una categoría activa con ese nombre.' });
            return;
        }
        const category = await prisma_1.prisma.category.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null
            }
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
            return;
        }
        if (/[^a-zA-Z0-9\s]/.test(name)) {
            res.status(400).json({ message: 'El nombre de la categoría no puede contener caracteres especiales.' });
            return;
        }
        // Verificar si existe otra categoría con el mismo nombre y que esté activa
        const existing = await prisma_1.prisma.category.findFirst({
            where: {
                name,
                isActive: true,
                NOT: { id: parseInt(id) }
            }
        });
        if (existing) {
            res.status(400).json({ message: 'Ya existe otra categoría activa con ese nombre.' });
            return;
        }
        const category = await prisma_1.prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name: name.trim(),
                description: description ? description.trim() : null
            }
        });
        res.json(category);
    }
    catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Eliminación lógica
        await prisma_1.prisma.category.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        res.json({ message: 'Categoría eliminada correctamente.' });
    }
    catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map