import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
  console.log('Iniciando seeder...');

  // 1. Usuario Administrador
  const adminEmail = 'admin@inventorypro.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador del Sistema',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMINISTRADOR,
      }
    });
    console.log('Usuario administrador creado con éxito:', adminUser.email);
  } else {
    console.log('El usuario administrador ya existe.');
  }

  // 2. Categorías por defecto
  const defaultCategories = ['Electrónica', 'Ropa', 'Abarrotes', 'Ferretería', 'Limpieza'];
  
  for (const catName of defaultCategories) {
    const existingCat = await prisma.category.findUnique({
      where: { name: catName }
    });

    if (!existingCat) {
      await prisma.category.create({
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
    await prisma.$disconnect();
  });
