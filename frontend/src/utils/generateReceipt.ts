import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  notes: string | null;
  product: { name: string; sku: string };
  provider: { name: string } | null;
}

export const generateReceipt = (tx: Transaction) => {
  // Crear un documento PDF tamaño ticket/recibo (A5 horizontal)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  });

  // Colores corporativos (Indigo 600: #4f46e5)
  const primaryColor = '#4f46e5';
  const textColor = '#334155'; // slate-700
  const lightText = '#64748b'; // slate-500

  // Configuración de fuente
  doc.setFont('helvetica', 'bold');
  
  // Header: Logo / Título
  doc.setTextColor(primaryColor);
  doc.setFontSize(22);
  doc.text('InventoryPro', 14, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightText);
  doc.setFontSize(10);
  doc.text('Comprobante de Movimiento de Inventario', 14, 28);
  
  // Número de Ticket y Fecha
  const dateObj = new Date(tx.date);
  const formattedDate = dateObj.toLocaleString('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor);
  doc.setFontSize(12);
  doc.text(`TICKET NO: #TX-${tx.id.toString().padStart(6, '0')}`, 130, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightText);
  doc.setFontSize(10);
  doc.text(`Fecha: ${formattedDate}`, 130, 28);

  // Línea separadora
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // Determinar tipo de movimiento
  let tipoTexto = 'Desconocido';
  let colorTipo = textColor;
  let origenDestino = '—';

  if (tx.type === 'IN') {
    tipoTexto = 'ENTRADA DE MERCANCÍA';
    colorTipo = '#10b981'; // emerald-500
    origenDestino = tx.provider ? `Proveedor: ${tx.provider.name}` : 'Ajuste de Entrada';
  } else if (tx.type === 'OUT') {
    tipoTexto = 'SALIDA DE MERCANCÍA';
    colorTipo = '#f43f5e'; // rose-500
    origenDestino = 'Salida Cliente / Interna';
  } else {
    tipoTexto = 'AJUSTE DE INVENTARIO';
    colorTipo = '#3b82f6'; // blue-500
    origenDestino = 'Auditoría / Ajuste';
  }

  // Información General
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorTipo);
  doc.setFontSize(14);
  doc.text(tipoTexto, 14, 48);

  // Tabla con los detalles
  autoTable(doc, {
    startY: 55,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#ffffff',
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 11
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 }, // SKU
      1: { halign: 'left', cellWidth: 'auto' }, // Producto
      2: { halign: 'center', cellWidth: 30 }, // Cantidad
    },
    head: [['SKU', 'Producto', 'Cantidad']],
    body: [
      [
        tx.product.sku,
        tx.product.name,
        `${tx.quantity} unds`
      ]
    ],
  });

  // Información Adicional (Notas y Origen)
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor);
  doc.setFontSize(10);
  doc.text('Origen / Destino:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(origenDestino, 14, finalY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Notas / Descripción:', 100, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(tx.notes || 'Sin notas adicionales.', 100, finalY + 6, { maxWidth: 90 });

  // Footer
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 130, 196, 130);

  doc.setTextColor(lightText);
  doc.setFontSize(8);
  doc.text('Documento generado automáticamente por InventoryPro.', 14, 138);
  
  // Guardar el documento
  doc.save(`Recibo_TX_${tx.id}.pdf`);
};
