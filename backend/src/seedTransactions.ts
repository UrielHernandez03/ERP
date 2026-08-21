import { TransactionType } from '@prisma/client';
import { prisma } from './prisma';

async function main() {
  console.log('Iniciando carga de 20 movimientos de inventario en el Kárdex...');

  // 1. Obtener productos y proveedores del catálogo
  const products = await prisma.product.findMany({ where: { isActive: true } });
  const providers = await prisma.provider.findMany();

  if (products.length === 0) {
    console.error('Error: No se encontraron productos. Ejecuta primero seedAll.');
    process.exit(1);
  }

  // 2. Limpiar transacciones previas para empezar desde limpio
  await prisma.inventoryTransaction.deleteMany();
  console.log('Limpiada bitácora previa de movimientos.');

  // Restablecer stock de productos a su estado inicial de semilla antes de simular movimientos
  const initialStocks: Record<string, number> = {
    'ELEC-001': 15, 'ELEC-002': 4, 'ELEC-003': 25, 'ELEC-004': 12, 'ELEC-005': 120, 'ELEC-006': 18,
    'ROPA-001': 65, 'ROPA-002': 22, 'ROPA-003': 3, 'ROPA-004': 95, 'ROPA-005': 35, 'ROPA-006': 14,
    'ABAR-001': 240, 'ABAR-002': 140, 'ABAR-003': 160, 'ABAR-004': 320, 'ABAR-005': 190, 'ABAR-006': 180,
    'FERR-001': 30, 'FERR-002': 2, 'FERR-003': 45, 'FERR-004': 15, 'FERR-005': 8, 'FERR-006': 20,
    'LIMP-001': 55, 'LIMP-002': 110, 'LIMP-003': 140, 'LIMP-004': 40, 'LIMP-005': 75, 'LIMP-006': 50,
  };

  for (const prod of products) {
    const defaultStock = initialStocks[prod.sku] ?? 10;
    await prisma.product.update({
      where: { id: prod.id },
      data: { stock: defaultStock }
    });
  }
  console.log('Stock de productos restablecido a valores iniciales de catálogo.');

  // 3. Diseñar 20 movimientos de inventario ordenados por fecha
  // Formato: [sku, type, quantity, notes, daysAgo, providerIndex (optional)]
  const rawTxData: Array<[string, TransactionType, number, string, number, number?]> = [
    ['ELEC-001', TransactionType.IN, 10, 'Ingreso por lote nuevo de monitores', 10, 0],
    ['ELEC-002', TransactionType.IN, 5, 'Reabastecimiento de teclados mecánicos', 9, 1],
    ['ROPA-003', TransactionType.IN, 15, 'Lote de cortavientos Nike impermeables', 9, 2],
    ['ABAR-001', TransactionType.IN, 100, 'Entrada de costales de arroz premium', 8, 4],
    ['FERR-002', TransactionType.IN, 12, 'Compra de juegos de destornilladores', 8, 6],
    
    ['ELEC-001', TransactionType.OUT, 3, 'Envío a sucursal norte por pedido web', 7],
    ['ELEC-005', TransactionType.OUT, 20, 'Venta al detalle de cables USB-C', 7],
    ['ROPA-001', TransactionType.OUT, 15, 'Salida por temporada de uniformes', 6],
    ['ROPA-003', TransactionType.OUT, 4, 'Venta al cliente corporativo', 6],
    ['ABAR-001', TransactionType.OUT, 50, 'Suministro a comedores industriales', 5],
    
    ['ELEC-002', TransactionType.ADJUSTMENT, -2, 'Ajuste de inventario por auditoría interna', 5],
    ['LIMP-001', TransactionType.IN, 30, 'Carga de detergente líquido Ariel', 4, 8],
    ['LIMP-003', TransactionType.IN, 50, 'Entrada de esponjas Scotch doble cara', 4, 9],
    ['FERR-005', TransactionType.IN, 4, 'Reabastecimiento de taladros Dewalt', 3, 7],
    ['FERR-001', TransactionType.OUT, 5, 'Venta de martillos para constructora', 3],
    
    ['ROPA-002', TransactionType.OUT, 6, 'Venta al detalle de jeans corte recto', 2],
    ['ABAR-004', TransactionType.OUT, 40, 'Venta mayorista de latas de atún', 2],
    ['LIMP-001', TransactionType.OUT, 10, 'Salida por insumos de aseo interno', 1],
    ['ELEC-006', TransactionType.ADJUSTMENT, 3, 'Ajuste por mercancía recuperada de exhibición', 1],
    ['FERR-005', TransactionType.OUT, 2, 'Venta de taladro percutor', 0],
  ];

  let createdCount = 0;

  for (const [sku, type, quantity, notes, daysAgo, provIdx] of rawTxData) {
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) continue;

    // Calcular fecha hacia atrás
    const txDate = new Date();
    txDate.setDate(txDate.getDate() - daysAgo);

    let providerId: number | null = null;
    if (provIdx !== undefined && providers[provIdx]) {
      providerId = providers[provIdx].id;
    }

    // 1. Crear la transacción de inventario
    await prisma.inventoryTransaction.create({
      data: {
        type,
        quantity,
        notes,
        productId: product.id,
        providerId,
        date: txDate
      }
    });

    // 2. Actualizar el stock en caliente
    let finalStock = product.stock;
    if (type === TransactionType.IN || type === TransactionType.ADJUSTMENT) {
      finalStock += quantity;
    } else if (type === TransactionType.OUT) {
      finalStock -= quantity;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: finalStock }
    });

    createdCount++;
  }

  console.log(`¡Carga exitosa! Se registraron ${createdCount} movimientos de inventario en el Kárdex.`);
}

main()
  .catch((e) => {
    console.error('Error al sembrar transacciones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
