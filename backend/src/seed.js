"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("./prisma");
async function main() {
    console.log('Iniciando seeder...');
    // 1. Usuario Administrador
    const adminEmail = 'admin@inventorypro.com';
    const existingAdmin = await prisma_1.prisma.user.findUnique({
        where: { email: adminEmail }
    });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        const adminUser = await prisma_1.prisma.user.create({
            data: {
                name: 'Administrador del Sistema',
                email: adminEmail,
                password: hashedPassword,
                role: client_1.Role.ADMINISTRADOR,
            }
        });
        console.log('Usuario administrador creado con éxito:', adminUser.email);
    }
    else {
        console.log('El usuario administrador ya existe.');
    }
    // 2. Categorías por defecto
    const defaultCategories = ['Electrónica', 'Ropa', 'Abarrotes', 'Ferretería', 'Limpieza'];
    for (const catName of defaultCategories) {
        const existingCat = await prisma_1.prisma.category.findUnique({
            where: { name: catName }
        });
        if (!existingCat) {
            await prisma_1.prisma.category.create({
                data: { name: catName, description: `Categoría principal de ${catName}` }
            });
            console.log(`Categoría '${catName}' creada.`);
        }
    }
    console.log('Seeding completado con éxito.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map