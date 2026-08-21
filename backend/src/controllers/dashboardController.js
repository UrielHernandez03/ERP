"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = require("../prisma");
const getDashboardStats = async (req, res) => {
    try {
        // Para no bloquear la BD, ejecutamos todas las consultas de conteo en paralelo
        const [totalProducts, lowStockProducts, totalCategories, totalProviders] = await Promise.all([
            prisma_1.prisma.product.count(),
            // Buscar productos donde el stock actual sea menor o igual al stock mínimo configurado
            // En Prisma podemos obtenerlos e iterar, o usar una consulta estricta. 
            // Por rendimiento, si hay muchos productos lo ideal es una consulta raw, pero para mantenerlo agnóstico:
            prisma_1.prisma.$queryRaw `SELECT count(*) FROM "Product" WHERE stock <= "minStock"`,
            prisma_1.prisma.category.count(),
            prisma_1.prisma.provider.count()
        ]);
        // Prisma queryRaw devuelve bigint para los conteos
        const lowStockCount = Number(lowStockProducts[0]?.count || 0);
        res.json({
            totalProducts,
            lowStockProducts: lowStockCount,
            totalCategories,
            totalProviders
        });
    }
    catch (error) {
        console.error('Error obteniendo stats del dashboard:', error);
        res.status(500).json({ message: 'Error interno del servidor al cargar el dashboard' });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboardController.js.map