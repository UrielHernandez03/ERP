import React, { useState } from 'react';
import { Layers, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
}

export interface Provider {
  id: number;
  name: string;
}

interface TransactionFormProps {
  products: Product[];
  providers: Provider[];
  onSubmit: (formData: any) => Promise<void>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ products, providers, onSubmit }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    type: 'IN',
    productId: '',
    providerId: '',
    quantity: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId, 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ type: 'IN', productId: '', providerId: '', quantity: '', notes: '' });
    } catch (error) {
      // Error is handled in the parent, or we let it bubble
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-premium rounded-3xl p-6 md:p-8 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800">Registrar Entrada / Salida / Ajuste</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Tipo de movimiento */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Movimiento</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'IN'})}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                formData.type === 'IN' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
              }`}
            >
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              Entrada (IN)
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'OUT', providerId: ''})}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                formData.type === 'OUT' 
                  ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' 
                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
              }`}
            >
              <ArrowDownRight className="w-5 h-5 text-rose-500" />
              Salida (OUT)
            </button>

            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'ADJUSTMENT', providerId: ''})}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                formData.type === 'ADJUSTMENT' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                  : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-500'
              }`}
            >
              <RefreshCcw className="w-5 h-5 text-blue-500" />
              Ajuste (ADJ)
            </button>
          </div>
        </div>

        {/* Producto */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Producto Relacionado</label>
          <select 
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            value={formData.productId}
            onChange={(e) => setFormData({...formData, productId: e.target.value})}
          >
            <option value="">Seleccionar producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Disponibles: {p.stock} und)</option>
            ))}
          </select>
        </div>

        {/* Proveedor (Solo para Entradas) */}
        {formData.type === 'IN' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Proveedor de Origen</label>
            <select 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.providerId}
              onChange={(e) => setFormData({...formData, providerId: e.target.value})}
            >
              <option value="">Seleccionar proveedor...</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {formData.type === 'ADJUSTMENT' ? 'Cantidad de Ajuste (Puede ser negativa)' : 'Cantidad'}
          </label>
          <input 
            type="number" 
            required
            min={formData.type === 'ADJUSTMENT' ? undefined : 1}
            max={formData.type === 'OUT' && selectedProduct ? selectedProduct.stock : 99999}
            placeholder="Cantidad de unidades..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            value={formData.quantity}
            onChange={(e) => {
              let val = e.target.value;
              if (formData.type === 'ADJUSTMENT') {
                val = val.replace(/[^0-9-]/g, '');
                if (val.indexOf('-') > 0) val = val.replace('-', '');
              } else {
                val = val.replace(/[^0-9]/g, '');
              }
              
              if (val.length > 5) return;

              const num = parseInt(val, 10);
              if (formData.type === 'OUT' && selectedProduct && num > selectedProduct.stock) {
                showToast(`Stock insuficiente. El stock actual es de ${selectedProduct.stock} unidades.`, 'warning');
                return;
              }

              setFormData({...formData, quantity: val});
            }}
          />
          {selectedProduct && (
            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
              Stock disponible en almacén: <span className="text-indigo-600 font-bold">{selectedProduct.stock} unidades</span>
            </p>
          )}
        </div>

        {/* Notas / Justificación */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notas / Justificación (Opcional)</label>
          <textarea 
            placeholder="Ej. Ingreso de lote por compra directa..."
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            value={formData.notes}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
              setFormData({...formData, notes: val});
            }}
          />
        </div>

        {/* Registrar */}
        <div className="pt-4 border-t border-slate-50 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 btn-gradient rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              'Procesar Movimiento'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TransactionForm;
