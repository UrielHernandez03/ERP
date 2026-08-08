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

    const electronica = categories.find(c => c.name === 'Electrónica')?.id;
    const ropa = categories.find(c => c.name === 'Ropa')?.id;
    const abarrotes = categories.find(c => c.name === 'Abarrotes')?.id;
    const ferreteria = categories.find(c => c.name === 'Ferretería')?.id;
    const limpieza = categories.find(c => c.name === 'Limpieza')?.id;

    const productosDePrueba = [
      { sku: 'ELEC001', name: 'Monitor Dell 27 Pulgadas', description: 'Monitor 4K para oficina', price: 350.00, stock: 15, minStock: 5, categoryId: electronica! },
      { sku: 'ELEC002', name: 'Teclado Mecanico Logitech', description: 'Teclado inalambrico', price: 120.50, stock: 3, minStock: 5, categoryId: electronica! },
      { sku: 'ELEC003', name: 'Raton Inalambrico Microsoft', description: 'Ergonómico negro', price: 45.00, stock: 30, minStock: 10, categoryId: electronica! },
      { sku: 'ELEC004', name: 'Auriculares Sony WH1000XM4', description: 'Cancelación de ruido activa', price: 299.99, stock: 8, minStock: 10, categoryId: electronica! },
      { sku: 'ELEC005', name: 'Cable USB C a USB C 2M', description: 'Carga rápida 100W', price: 15.00, stock: 100, minStock: 20, categoryId: electronica! },
      { sku: 'ELEC006', name: 'Cargador Pared 65W Baseus', description: 'Nitruro de Galio', price: 35.00, stock: 12, minStock: 15, categoryId: electronica! },

      { sku: 'ROPA001', name: 'Camiseta Algodon Blanca', description: 'Talla M', price: 15.00, stock: 50, minStock: 10, categoryId: ropa! },
      { sku: 'ROPA002', name: 'Pantalon Mezclilla Levi', description: 'Corte recto, talla 32', price: 45.00, stock: 20, minStock: 8, categoryId: ropa! },
      { sku: 'ROPA003', name: 'Chaqueta Cuero Negra', description: 'Estilo clásico', price: 120.00, stock: 4, minStock: 5, categoryId: ropa! },
      { sku: 'ROPA004', name: 'Zapatos Deportivos Nike', description: 'Correr y gimnasio', price: 85.00, stock: 15, minStock: 10, categoryId: ropa! },
      { sku: 'ROPA005', name: 'Calcetines Deportivos Pack 5', description: 'Algodón absorbente', price: 12.00, stock: 80, minStock: 30, categoryId: ropa! },

      { sku: 'ABAR001', name: 'Cafe en Grano 1KG', description: 'Tueste oscuro', price: 25.00, stock: 8, minStock: 10, categoryId: abarrotes! },
      { sku: 'ABAR002', name: 'Aceite de Oliva Extra Virgen', description: 'Botella de vidrio 750ml', price: 12.50, stock: 40, minStock: 15, categoryId: abarrotes! },
      { sku: 'ABAR003', name: 'Arroz Premium 5KG', description: 'Grano largo', price: 8.90, stock: 60, minStock: 20, categoryId: abarrotes! },
      { sku: 'ABAR004', name: 'Frijol Negro 2KG', description: 'Limpio y listo para cocer', price: 6.50, stock: 45, minStock: 15, categoryId: abarrotes! },
      { sku: 'ABAR005', name: 'Lata Atun en Agua', description: 'Pack de 6 unidades', price: 9.99, stock: 120, minStock: 40, categoryId: abarrotes! },

      { sku: 'FERR001', name: 'Taladro Percutor Bosch', description: '800W con estuche', price: 85.00, stock: 12, minStock: 4, categoryId: ferreteria! },
      { sku: 'FERR002', name: 'Juego Llaves Combinadas', description: '12 piezas acero al cromo vanadio', price: 45.00, stock: 25, minStock: 10, categoryId: ferreteria! },
      { sku: 'FERR003', name: 'Martillo Carpintero', description: 'Mango de fibra de vidrio', price: 18.50, stock: 15, minStock: 5, categoryId: ferreteria! },
      { sku: 'FERR004', name: 'Cinta Metrica 5 Metros', description: 'Uso rudo profesional', price: 8.00, stock: 50, minStock: 20, categoryId: ferreteria! },

      { sku: 'LIMP001', name: 'Detergente Industrial 5L', description: 'Uso rudo', price: 18.50, stock: 25, minStock: 5, categoryId: limpieza! },
      { sku: 'LIMP002', name: 'Escoba Uso Exterior', description: 'Cerdas duras de plástico', price: 6.50, stock: 35, minStock: 10, categoryId: limpieza! },
      { sku: 'LIMP003', name: 'Cloro Concentrado 10L', description: 'Para desinfección profunda', price: 22.00, stock: 18, minStock: 8, categoryId: limpieza! },
      { sku: 'LIMP004', name: 'Bolsas Basura Grandes', description: 'Caja con 100 bolsas negras', price: 14.99, stock: 40, minStock: 15, categoryId: limpieza! },
      { sku: 'LIMP005', name: 'Guantes de Latex Caja', description: '100 unidades talla L', price: 9.50, stock: 150, minStock: 50, categoryId: limpieza! }
    ];

    for (const prod of productosDePrueba) {
      if (!prod.categoryId) continue;

      const existe = await prisma.product.findUnique({ where: { sku: prod.sku } });
      if (!existe) {
        await prisma.product.create({ data: prod });
        console.log(`Producto creado: ${prod.name}`);
      } else {
        console.log(`Producto ya existe: ${prod.name}`);
      }
    }

    console.log('Productos de prueba cargados exitosamente.');
  } catch (error) {
    console.error('Error cargando productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
