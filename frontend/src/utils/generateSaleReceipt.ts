import jsPDF from 'jspdf';

interface SaleItem {
  product: { name: string; sku: string };
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: number;
  customer?: { name: string } | null;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: SaleItem[];
}

export const generateSaleReceipt = (sale: Sale) => {
  // Ticket de 80mm de ancho (ancho típico de impresora térmica)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200]
  });

  const primaryColor = '#1e293b'; // slate-800
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.text('InventoryPro', 40, 10, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('TICKET DE VENTA', 40, 15, { align: 'center' });
  
  const dateObj = new Date(sale.createdAt);
  const formattedDate = dateObj.toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });

  doc.setFontSize(8);
  doc.text(`TICKET NO: #TX-${sale.id.toString().padStart(6, '0')}`, 40, 22, { align: 'center' });
  doc.text(`FECHA: ${formattedDate}`, 40, 26, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(5, 30, 75, 30);

  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 5, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.customer ? sale.customer.name : 'Público en General', 20, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Método:', 5, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.paymentMethod, 20, 39);

  doc.line(5, 42, 75, 42);

  // Generar tabla de productos manual para control exacto del ancho
  let y = 47;
  doc.setFont('helvetica', 'bold');
  doc.text('CANT x PRECIO', 5, y);
  doc.text('IMPORTE', 75, y, { align: 'right' });
  y += 4;
  doc.setFont('helvetica', 'normal');

  for (const item of sale.items) {
    // Nombre del producto (puede ser largo, se trunca o envuelve)
    doc.text(item.product.name.substring(0, 35), 5, y);
    y += 4;
    doc.text(`${item.quantity} x $${item.price.toFixed(2)}`, 5, y);
    doc.text(`$${item.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
    y += 5;
  }

  doc.line(5, y, 75, y);
  y += 5;

  doc.text('SUBTOTAL:', 35, y);
  doc.text(`$${sale.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
  y += 4;
  doc.text('IVA (16%):', 35, y);
  doc.text(`$${sale.tax.toFixed(2)}`, 75, y, { align: 'right' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 35, y);
  doc.text(`$${sale.total.toFixed(2)}`, 75, y, { align: 'right' });
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });

  // Guardar el documento
  doc.save(`Ticket_Venta_${sale.id}.pdf`);
};
