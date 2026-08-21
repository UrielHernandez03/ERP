"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const prisma_1 = require("../prisma");
const getProducts = async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { isActive: true },
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const { name, sku, categoryId, price, stock, minStock, description, barcode } = req.body;
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
        const existingSku = await prisma_1.prisma.product.findFirst({
            where: { sku: sku.trim().toUpperCase(), isActive: true }
        });
        if (existingSku) {
            res.status(400).json({ message: 'Ya existe un producto activo con este SKU.' });
            return;
        }
        if (barcode && barcode.trim() !== '') {
            const existingBarcode = await prisma_1.prisma.product.findFirst({
                where: { barcode: barcode.trim(), isActive: true }
            });
            if (existingBarcode) {
                res.status(400).json({ message: 'Ya existe un producto activo con este código de barras.' });
                return;
            }
        }
        const product = await prisma_1.prisma.product.create({
            data: {
                name: name.trim(),
                sku: sku.trim().toUpperCase(),
                barcode: barcode && barcode.trim() !== '' ? barcode.trim() : null,
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
    }
    catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sku, categoryId, price, stock, minStock, description, barcode } = req.body;
        if (!name || !sku || !categoryId) {
            res.status(400).json({ message: 'Nombre, SKU y Categoría son requeridos.' });
            return;
        }
        const regexEspecial = /[^a-zA-Z0-9\s]/;
        if (regexEspecial.test(name) || (description && regexEspecial.test(description))) {
            res.status(400).json({ message: 'No se permiten caracteres especiales.' });
            return;
        }
        const existingSku = await prisma_1.prisma.product.findFirst({
            where: {
                sku: sku.trim().toUpperCase(),
                isActive: true,
                NOT: { id: parseInt(id) }
            }
        });
        if (existingSku) {
            res.status(400).json({ message: 'Ya existe otro producto activo con este SKU.' });
            return;
        }
        if (barcode && barcode.trim() !== '') {
            const existingBarcode = await prisma_1.prisma.product.findFirst({
                where: {
                    barcode: barcode.trim(),
                    isActive: true,
                    NOT: { id: parseInt(id) }
                }
            });
            if (existingBarcode) {
                res.status(400).json({ message: 'Ya existe otro producto activo con este código de barras.' });
                return;
            }
        }
        const product = await prisma_1.prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: name.trim(),
                sku: sku.trim().toUpperCase(),
                barcode: barcode && barcode.trim() !== '' ? barcode.trim() : null,
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
        res.json(product);
    }
    catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Eliminación lógica
        await prisma_1.prisma.product.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        res.json({ message: 'Producto eliminado correctamente.' });
    }
    catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map