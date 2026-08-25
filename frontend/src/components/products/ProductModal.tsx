import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface Product {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  categoryId: number;
  category: { name: string };
}

export interface Category {
  id: number;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  editingProduct: Product | null;
  categories: Category[];
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProduct, 
  categories 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    price: '',
    stock: '0',
    minStock: '5',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          sku: editingProduct.sku,
          barcode: editingProduct.barcode || '',
          categoryId: editingProduct.categoryId.toString(),
          price: editingProduct.price.toString(),
          stock: editingProduct.stock.toString(),
          minStock: editingProduct.minStock.toString(),
          description: editingProduct.description || ''
        });
      } else {
        setFormData({
          name: '',
          sku: '',
          barcode: '',
          categoryId: '',
          price: '',
          stock: '0',
          minStock: '5',
          description: ''
        });
      }
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden animate-scale-up">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">
            {editingProduct ? 'Editar Producto' : 'Registrar Producto'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre del Producto</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Computadora Portátil"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  setFormData({...formData, name: val});
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">SKU (Código Único)</label>
              <input 
                type="text" 
                required
                disabled={!!editingProduct}
                placeholder="Ej. COMP-001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
                value={formData.sku}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                  setFormData({...formData, sku: val});
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Código de Barras (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej. 750123456789"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.barcode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                  setFormData({...formData, barcode: val});
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Precio Unitario ($)</label>
              <input 
                type="number" 
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            {editingProduct ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Mínimo Alerta</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={formData.minStock}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 5) return;
                    setFormData({...formData, minStock: val});
                  }}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Inicial</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.stock}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 5) return;
                      setFormData({...formData, stock: val});
                    }}
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción (Opcional)</label>
              <textarea 
                placeholder="Detalles sobre el producto..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                value={formData.description}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  setFormData({...formData, description: val});
                }}
              />
            </div>

          </div>

          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-50 mt-6">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
