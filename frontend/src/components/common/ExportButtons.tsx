import React, { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ColumnDef {
  header: string;
  key: string;
}

interface ExportButtonsProps {
  data: any[];
  columns: ColumnDef[];
  filename: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, columns, filename }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatData = () => {
    return data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        // Handle nested keys like 'product.name'
        const keys = col.key.split('.');
        let val = item;
        keys.forEach(k => {
          val = val ? val[k] : '';
        });
        row[col.header] = val;
      });
      return row;
    });
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const formattedData = formatData();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
      
      // Auto-size columns
      const colWidths = columns.map(c => ({ wch: Math.max(c.header.length, 15) }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    if (data.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(16);
      doc.text(`Reporte: ${filename}`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

      const headers = [columns.map(c => c.header)];
      const formattedData = data.map(item => {
        return columns.map(col => {
          const keys = col.key.split('.');
          let val = item;
          keys.forEach(k => {
            val = val !== null && val !== undefined ? val[k] : '';
          });
          return val;
        });
      });

      autoTable(doc, {
        head: headers,
        body: formattedData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] } // Indigo-600
      });

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToExcel}
        disabled={data.length === 0 || isExporting}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        title="Exportar a Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>
      
      <button
        onClick={exportToPDF}
        disabled={data.length === 0 || isExporting}
        className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        title="Exportar a PDF"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
