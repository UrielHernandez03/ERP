import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
  console.log('Iniciando carga masiva de datos (Usuarios, Categorías, 30 Productos y 10 Proveedores)...');

  // 1. Crear Usuario Administrador
  const adminEmail = 'admin@inventorypro.com';
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        name: 'Administrador del Sistema',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMINISTRADOR,
      }
    });
    console.log('Usuario administrador creado:', adminUser.email);
  } else {
    console.log('El usuario administrador ya existe.');
  }

  // 2. Crear Categorías
  const categoriesData = [
    { name: 'Electrónica', description: 'Dispositivos, gadgets y accesorios tecnológicos' },
    { name: 'Ropa', description: 'Prendas de vestir, calzado y accesorios de moda' },
    { name: 'Abarrotes', description: 'Alimentos secos, aceites y víveres para el hogar' },
    { name: 'Ferretería', description: 'Herramientas manuales, eléctricas y consumibles de construcción' },
    { name: 'Limpieza', description: 'Productos químicos e insumos de aseo doméstico o industrial' }
  ];

  const categoriesMap: Record<string, number> = {};

  for (const cat of categoriesData) {
    let dbCat = await prisma.category.findUnique({
      where: { name: cat.name }
    });

    if (!dbCat) {
      dbCat = await prisma.category.create({
        data: cat
      });
      console.log(`Categoría '${cat.name}' creada.`);
    } else {
      console.log(`Categoría '${cat.name}' ya existía.`);
    }
    categoriesMap[cat.name] = dbCat.id;
  }

  // 3. Crear 10 Proveedores
  const providersData = [
    { name: 'Intelco Mayorista S.A.', contact: 'Ing. Carlos Ruiz', email: 'ventas@intelcomayorista.com', phone: '+525512345678', address: 'Av. de la Reforma 115, CDMX' },
    { name: 'Suministros TecnoGlobal', contact: 'Lic. Sofía Ramos', email: 'contacto@tecnoglobal.mx', phone: '+525598765432', address: 'Parque Industrial Vallejo, Edificio B, CDMX' },
    { name: 'Textiles del Centro', contact: 'Roberto Gómez', email: 'rgomez@textilescentro.com', phone: '+524773456789', address: 'Boulevard Aeropuerto 450, León, Gto' },
    { name: 'Moda y Estilo Mayorista', contact: 'Patricia Fernández', email: 'p.fernandez@modaestilomayorista.com', phone: '+523344556677', address: 'Calle Álvaro Obregón 89, Guadalajara, Jal' },
    { name: 'Distribuidora Nacional de Víveres', contact: 'Manuel Castro', email: 'abastos@viveresnacionales.com', phone: '+525533221100', address: 'Central de Abastos, Bodega J-42, CDMX' },
    { name: 'Alimentos y Semillas del Sur', contact: 'Laura Martínez', email: 'ventas@alimentossur.mx', phone: '+529517890123', address: 'Calzada de la República 102, Oaxaca, Oax' },
    { name: 'Herramientas y Tornillos Truper S.A.', contact: 'Ing. Alejandro Silva', email: 'asilva@herramientastruper.com', phone: '+525555443322', address: 'Zona Industrial Jilotepec, Edo. de México' },
    { name: 'Ferretería y Metales del Norte', contact: 'Ricardo Hinojosa', email: 'ricardo@ferremetalesnorte.com', phone: '+528183456789', address: 'Av. Universidad 1200, Monterrey, NL' },
    { name: 'Químicos y Limpieza Sanitaria', contact: 'Dra. Elena Torres', email: 'etorres@quimicoslimpieza.com', phone: '+525587654321', address: 'Av. Insurgentes Sur 2400, CDMX' },
    { name: 'Insumos Ecológicos Clean', contact: 'Fernando Ortiz', email: 'fortiz@cleaninsumos.com', phone: '+523399887766', address: 'Zona Industrial Zapopan, Jal' }
  ];

  console.log(`Cargando ${providersData.length} proveedores en la base de datos...`);

  for (const prov of providersData) {
    const existingProv = await prisma.provider.findFirst({
      where: { name: prov.name }
    });

    if (!existingProv) {
      await prisma.provider.create({
        data: prov
      });
      console.log(`Proveedor '${prov.name}' creado.`);
    } else {
      console.log(`Proveedor '${prov.name}' ya existía.`);
    }
  }

  // 4. Crear 30 Productos de Prueba (6 por categoría)
  const electronicaId = categoriesMap['Electrónica'];
  const ropaId = categoriesMap['Ropa'];
  const abarrotesId = categoriesMap['Abarrotes'];
  const ferreteriaId = categoriesMap['Ferretería'];
  const limpiezaId = categoriesMap['Limpieza'];

  const productsData = [
    // Electrónica (6 productos)
    { sku: 'ELEC-001', barcode: '7501234560012', name: 'Monitor Dell UltraSharp 27', description: 'Monitor profesional 4K IPS ideal para diseño y oficina', price: 349.99, stock: 15, minStock: 5, categoryId: electronicaId },
    { sku: 'ELEC-002', barcode: '7501234560029', name: 'Teclado Mecánico Logitech MX', description: 'Teclado inalámbrico retroiluminado con teclas silenciosas', price: 119.50, stock: 4, minStock: 5, categoryId: electronicaId },
    { sku: 'ELEC-003', barcode: '7501234560036', name: 'Ratón Ergonómico Microsoft', description: 'Ratón inalámbrico con reposapulgares para evitar fatiga', price: 44.99, stock: 25, minStock: 8, categoryId: electronicaId },
    { sku: 'ELEC-004', barcode: '7501234560043', name: 'Auriculares Sony WH-1000XM4', description: 'Auriculares circumaurales con cancelación de ruido inteligente', price: 299.00, stock: 12, minStock: 4, categoryId: electronicaId },
    { sku: 'ELEC-005', barcode: '7501234560050', name: 'Cable de Carga USB-C 2 Metros', description: 'Cable reforzado de nylon con soporte de carga rápida de 100W', price: 14.99, stock: 120, minStock: 20, categoryId: electronicaId },
    { sku: 'ELEC-006', barcode: '7501234560067', name: 'Cargador Rápido Baseus 65W GaN', description: 'Cargador de pared compacto con 3 puertos (2x USB-C, 1x USB-A)', price: 39.90, stock: 18, minStock: 6, categoryId: electronicaId },

    // Ropa (6 productos)
    { sku: 'ROPA-001', barcode: '7501234560074', name: 'Camiseta Básica Algodón Blanca', description: 'Camiseta de cuello redondo 100% algodón orgánico, talla M', price: 15.00, stock: 65, minStock: 15, categoryId: ropaId },
    { sku: 'ROPA-002', barcode: '7501234560081', name: 'Jeans Corte Recto Levi 501', description: 'Pantalones de mezclilla azul clásicos, talla 32x32', price: 59.99, stock: 22, minStock: 8, categoryId: ropaId },
    { sku: 'ROPA-003', barcode: '7501234560098', name: 'Chaqueta Cortavientos Nike Run', description: 'Chaqueta ligera e impermeable con detalles reflectantes', price: 74.50, stock: 3, minStock: 5, categoryId: ropaId },
    { sku: 'ROPA-004', barcode: '7501234560104', name: 'Calcetines Deportivos Pack de 3', description: 'Calcetines transpirables con amortiguación en talón y punta', price: 9.99, stock: 95, minStock: 25, categoryId: ropaId },
    { sku: 'ROPA-005', barcode: '7501234560111', name: 'Gorra Deportiva Ajustable Adidas', description: 'Gorra clásica con visera curva y banda que absorbe sudor', price: 22.00, stock: 35, minStock: 10, categoryId: ropaId },
    { sku: 'ROPA-006', barcode: '7501234560128', name: 'Tenis Deportivos Puma Smash', description: 'Zapatillas casuales de cuero con suela de goma antideslizante', price: 65.00, stock: 14, minStock: 5, categoryId: ropaId },

    // Abarrotes (6 productos)
    { sku: 'ABAR-001', barcode: '7501234560135', name: 'Arroz Súper Extra Verde 1KG', description: 'Arroz blanco de grano largo seleccionado de alta calidad', price: 1.85, stock: 240, minStock: 50, categoryId: abarrotesId },
    { sku: 'ABAR-002', barcode: '7501234560142', name: 'Aceite Puro de Girasol 1 Litro', description: 'Aceite vegetal ideal para cocinar y freír alimentos', price: 3.40, stock: 140, minStock: 30, categoryId: abarrotesId },
    { sku: 'ABAR-003', barcode: '7501234560159', name: 'Frijoles Negros Refritos 1KG', description: 'Frijoles negros listos para calentar y servir, marca clásica', price: 2.20, stock: 160, minStock: 40, categoryId: abarrotesId },
    { sku: 'ABAR-004', barcode: '7501234560166', name: 'Atún en Agua Dolores 140g', description: 'Lata de atún de aleta amarilla en agua desmenuzado', price: 1.25, stock: 320, minStock: 60, categoryId: abarrotesId },
    { sku: 'ABAR-005', barcode: '7501234560173', name: 'Pasta Espagueti Barilla 500g', description: 'Pasta de sémola de trigo duro de cocción rápida al dente', price: 0.95, stock: 190, minStock: 45, categoryId: abarrotesId },
    { sku: 'ABAR-006', barcode: '7501234560180', name: 'Leche Entera de Vaca Lala 1L', description: 'Leche entera ultrapasteurizada enriquecida con vitaminas A y D', price: 1.65, stock: 180, minStock: 50, categoryId: abarrotesId },

    // Ferretería (6 productos)
    { sku: 'FERR-001', barcode: '7501234560197', name: 'Martillo de Uña Curva Truper 16oz', description: 'Martillo de acero con mango ergonómico de fibra de vidrio', price: 13.90, stock: 30, minStock: 8, categoryId: ferreteriaId },
    { sku: 'FERR-002', barcode: '7501234560203', name: 'Destornilladores Juego de 6 Piezas', description: 'Juego de desarmadores planos y de cruz con puntas magnéticas', price: 19.50, stock: 2, minStock: 5, categoryId: ferreteriaId },
    { sku: 'FERR-003', barcode: '7501234560210', name: 'Cinta Métrica Auto-retráctil 5m', description: 'Flexómetro de alta resistencia con escala métrica e inglesa', price: 6.80, stock: 45, minStock: 12, categoryId: ferreteriaId },
    { sku: 'FERR-004', barcode: '7501234560227', name: 'Pinzas de Presión Mordaza Recta 10', description: 'Pinza perra de acero reforzado para sujeción industrial', price: 12.50, stock: 15, minStock: 6, categoryId: ferreteriaId },
    { sku: 'FERR-005', barcode: '7501234560234', name: 'Taladro Percutor Inalámbrico Dewalt', description: 'Taladro de 20V con batería de iones de litio y maletín', price: 189.00, stock: 8, minStock: 3, categoryId: ferreteriaId },
    { sku: 'FERR-006', barcode: '7501234560241', name: 'Llave Ajustable Inglesa de 10 Pulgadas', description: 'Llave perica cromada con escala de apertura de mordaza', price: 11.20, stock: 20, minStock: 5, categoryId: ferreteriaId },

    // Limpieza (6 productos)
    { sku: 'LIMP-001', barcode: '7501234560258', name: 'Detergente Líquido Ariel 3 Litros', description: 'Jabón concentrado para ropa blanca y de color de alta eficiencia', price: 8.99, stock: 55, minStock: 15, categoryId: limpiezaId },
    { sku: 'LIMP-002', barcode: '7501234560265', name: 'Limpiador Multiusos Pino 1 Litro', description: 'Limpiador desinfectante con aceite de pino de origen natural', price: 2.15, stock: 110, minStock: 25, categoryId: limpiezaId },
    { sku: 'LIMP-003', barcode: '7501234560272', name: 'Esponjas para Trastes Scotch Pack de 3', description: 'Fibra verde abrasiva y esponja amarilla de doble cara', price: 1.60, stock: 140, minStock: 30, categoryId: limpiezaId },
    { sku: 'LIMP-004', barcode: '7501234560289', name: 'Limpiador de Vidrios Gatillo 500ml', description: 'Fórmula que disuelve grasa y mugre en cristales sin dejar manchas', price: 2.90, stock: 40, minStock: 10, categoryId: limpiezaId },
    { sku: 'LIMP-005', barcode: '7501234560296', name: 'Jabón Líquido para Manos Dial 220ml', description: 'Jabón antibacterial humectante con extracto de sábila', price: 3.20, stock: 75, minStock: 15, categoryId: limpiezaId },
    { sku: 'LIMP-006', barcode: '7501234560302', name: 'Escoba de Cerdas Suaves Truper', description: 'Escoba para interiores con bastón de madera ligero de 1.2 metros', price: 5.50, stock: 50, minStock: 10, categoryId: limpiezaId },
  ];

  console.log(`Cargando ${productsData.length} productos en la base de datos...`);

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        barcode: prod.barcode,
        price: prod.price,
        stock: prod.stock,
        minStock: prod.minStock,
        description: prod.description,
        categoryId: prod.categoryId
      },
      create: prod
    });
  }

  console.log('¡Carga de base de datos finalizada con éxito!');
}

main()
  .catch((e) => {
    console.error('Error al poblar la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
