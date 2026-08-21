import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  ClipboardList,
  Calendar,
  Layers
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';

interface Transaction {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  notes: string | null;
  product: { name: string, sku: string };
  provider: { name: string } | null;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
}

interface Provider {
  id: number;
  name: string;
}

const Inventory: React.FC = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'KARDEX' | 'NEW_TX'>('KARDEX');

  // Form State
  const [formData, setFormData] = useState({
    type: 'IN',
    productId: '',
    providerId: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchProviders();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/inventory');
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar la bitácora de inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await axiosInstance.get('/providers');
      setProviders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/inventory', formData);
      showToast('Movimiento de inventario registrado con éxito', 'success');
      setFormData({ type: 'IN', productId: '', providerId: '', quantity: '', notes: '' });
      fetchTransactions();
      fetchProducts(); // Refrescar stock en dropdowns
      setActiveTab('KARDEX');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al registrar el movimiento', 'error');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTxTypeBadge = (type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    switch (type) {
      case 'IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Entrada
          </span>
        );
      case 'OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Salida
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <RefreshCcw className="w-3.5 h-3.5" />
            Ajuste
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Selector de pestañas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('KARDEX')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'KARDEX' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Historial de Movimientos (Kárdex)
        </button>
        <button
          onClick={() => setActiveTab('NEW_TX')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition-all ${
            activeTab === 'NEW_TX' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="w-4 h-4" /> Registrar Movimiento
        </button>
      </div>

      {activeTab === 'KARDEX' ? (
        <div className="space-y-6">
          {/* Barra de Búsqueda */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por producto, SKU o notas..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
            />
          </div>

          <div className="card-premium rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/50 text-slate-400 font-semibold tracking-wider uppercase border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Origen / Destino</th>
                    <th className="px-6 py-4">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                          <span className="text-slate-400 font-medium">Cargando transacciones...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ClipboardList className="w-10 h-10 text-slate-300 mb-2" />
                          <p className="text-slate-400 font-medium">No hay registros en el kárdex de inventario.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{tx.product.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.product.sku}</p>
                        </td>
                        <td className="px-6 py-4">{getTxTypeBadge(tx.type)}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-800">
                          {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : ''}{tx.quantity} und
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {tx.type === 'IN' && tx.provider ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px]">
                              Proveedor: {tx.provider.name}
                            </span>
                          ) : tx.type === 'OUT' ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px]">
                              Salida Cliente
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={tx.notes || ''}>
                          {tx.notes || <span className="text-slate-300">Sin notas</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Formulario de Transacción */
        <div className="card-premium rounded-3xl p-6 md:p-8 max-w-xl">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Registrar Entrada / Salida / Ajuste</h3>
          </div>

          <form onSubmit={handleSubmitTx} className="space-y-4">
            
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
                placeholder="Cantidad de unidades..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
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
                className="px-6 py-2.5 btn-gradient rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Procesar Movimiento
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Inventory;
