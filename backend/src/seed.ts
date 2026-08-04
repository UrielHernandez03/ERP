import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeder...');

  const adminEmail = 'admin@inventorypro.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('El usuario administrador ya existe.');
    return;
  }

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
