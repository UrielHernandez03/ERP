import { prisma } from './prisma';

async function seedProducts() {
  console.log('Iniciando carga de productos de prueba...');

  try {
    // Buscar categorías
    const categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      console.log('No hay categorías. Asegúrate de correr el seed principal primero.');
      return;
    }

    const electronica = (categories as any[]).find(c => c.name === 'Electrónica')?.id;
    const ropa = (categories as any[]).find(c => c.name === 'Ropa')?.id;
    const abarrotes = (categories as any[]).find(c => c.name === 'Abarrotes')?.id;
    const ferreteria = (categories as any[]).find(c => c.name === 'Ferretería')?.id;
    const limpieza = (categories as any[]).find(c => c.name === 'Limpieza')?.id;

    const productosDePrueba = [
      { sku: 'ELEC001', name: 'Monitor Dell 27 Pulgadas', description: 'Monitor 4K para oficina', price: 350.00, stock: 15, minStock: 5, categoryId: electronica! },
      { sku: 'ELEC002', name: 'Teclado Mecanico Logitech', description: 'Teclado inalambrico', price: 120.50, stock: 3, minStock: 5, categoryId: electronica! },
      { sku: 'ELEC003', name: 'Raton Inalambrico Microsoft', description: 'Ergonómico negro', price: 45.00, stock: 30, minStock: 10, categoryId: electronica! },
      { sku: 'ELEC004', name: 'Auriculares Sony WH1000XM4', description: 'Cancelación de ruido activa', price: 299.99, stock: 8, minStock: 10, categoryId: electronica! },
      { sku: 'ELEC005', name: 'Cable USB C a USB C 2M', description: 'Carga rápida 100W', price: 15.00, stock: 100, minStock: 20, categoryId: electronica! },
      { sku: 'ELEC006', name: 'Cargador Pared 65W Baseus', description: 'Nitruro de Galio', price: 35.00, stock: 12, minStock: 15, categoryId: electronica! },

      { sku: 'ROPA001', name: 'Camiseta Algodon Blanca', description: 'Talla M', price: 15.00, stock: 50, minStock: 10, categoryId: ropa! },
      { sku: 'ROPA002', name: 'Pantalon Mezclilla Levi', description: 'Corte recto, talla 32', price: 45.00, stock: 20, minStock: 8, categoryId: ropa! },
      { sku: 'ROPA003', name: 'Chaqueta Cortavientos Nike', description: 'Ideal para correr', price: 65.00, stock: 10, minStock: 5, categoryId: ropa! },
      { sku: 'ROPA004', name: 'Calcetines Deportivos 3 Pack', description: 'Color blanco', price: 9.99, stock: 80, minStock: 15, categoryId: ropa! },

      { sku: 'ABAR001', name: 'Arroz Super Extra 1KG', description: 'Grano largo', price: 1.80, stock: 200, minStock: 50, categoryId: abarrotes! },
      { sku: 'ABAR002', name: 'Aceite de Girasol 1L', description: 'Aceite vegetal', price: 3.20, stock: 150, minStock: 30, categoryId: abarrotes! },
      { sku: 'ABAR003', name: 'Frijoles Negros 1KG', description: 'Marca La Costeña', price: 2.10, stock: 120, minStock: 40, categoryId: abarrotes! },
      { sku: 'ABAR004', name: 'Atun en Agua 140g', description: 'Lata de atún aleta amarilla', price: 1.15, stock: 300, minStock: 50, categoryId: abarrotes! },
      { sku: 'ABAR005', name: 'Pasta Espagueti 500g', description: 'Semola de trigo duro', price: 0.90, stock: 180, minStock: 40, categoryId: abarrotes! },

      { sku: 'FERR001', name: 'Martillo de Uña 16oz', description: 'Mango de fibra de vidrio', price: 14.50, stock: 25, minStock: 5, categoryId: ferreteria! },
      { sku: 'FERR002', name: 'Juego Destornilladores 6Pz', description: 'Puntas magneticas', price: 18.90, stock: 15, minStock: 5, categoryId: ferreteria! },
      { sku: 'FERR003', name: 'Cinta Metrica 5 Metros', description: 'Carcasa resistente al impacto', price: 6.50, stock: 40, minStock: 10, categoryId: ferreteria! },
      { sku: 'FERR004', name: 'Pinzas de Presion 10 Pulgadas', description: 'Acero cromo vanadio', price: 12.00, stock: 18, minStock: 5, categoryId: ferreteria! },

      { sku: 'LIMP001', name: 'Detergente Liquido 3L', description: 'Para ropa blanca y de color', price: 8.50, stock: 60, minStock: 15, categoryId: limpieza! },
      { sku: 'LIMP002', name: 'Desinfectante Multiusos 1L', description: 'Aroma a pino', price: 2.30, stock: 100, minStock: 25, categoryId: limpieza! },
      { sku: 'LIMP003', name: 'Esponjas para Trastes 3 Pack', description: 'Fibra verde y amarilla', price: 1.50, stock: 150, minStock: 30, categoryId: limpieza! },
      { sku: 'LIMP004', name: 'Limpiador de Vidrios Gatillo 500ml', description: 'Aroma fresco sin residuos', price: 2.80, stock: 45, minStock: 10, categoryId: limpieza! }
    ];

    console.log(`Cargando ${productosDePrueba.length} productos...`);

    // Insertar productos de prueba ignorando duplicados por SKU
    for (const prod of productosDePrueba) {
      await prisma.product.upsert({
        where: { sku: prod.sku },
        update: {},
        create: prod
      });
    }

    console.log('Productos de prueba cargados con éxito.');
  } catch (error) {
    console.error('Error al insertar productos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
