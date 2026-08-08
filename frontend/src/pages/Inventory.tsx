import React, { useState, useEffect } from 'react';
import { 
  PackageOpen, Search, Plus, LayoutDashboard, Boxes, Tags, Users, Truck, LogOut, Bell,
  ArrowUpRight, ArrowDownRight, RefreshCcw, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

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
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    fetchUser();
    fetchTransactions();
    fetchProducts();
    fetchProviders();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUserName(res.data.name);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get('/inventory');
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
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

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/inventory', formData);
      alert('Movimiento registrado con éxito');
      setFormData({ type: 'IN', productId: '', providerId: '', quantity: '', notes: '' });
      fetchTransactions();
      fetchProducts(); // Refresh stock in dropdown
      setActiveTab('KARDEX');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar el movimiento');
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-blue-600">
              <PackageOpen className="w-7 h-7" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Inventory<span className="text-blue-600">Pro</span></span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
              <ClipboardList className="w-5 h-5" /> Inventario
            </button>
            <button onClick={() => navigate('/products')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Boxes className="w-5 h-5" /> Productos
            </button>
            <button onClick={() => navigate('/categories')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Tags className="w-5 h-5" /> Categorías
            </button>
            <button onClick={() => navigate('/providers')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Truck className="w-5 h-5" /> Proveedores
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Control de Inventario</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setActiveTab('KARDEX')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'KARDEX' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Historial (Kardex)
            </button>
            <button 
              onClick={() => setActiveTab('NEW_TX')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'NEW_TX' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Registrar Movimiento
            </button>
          </div>

          {activeTab === 'KARDEX' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                    onKeyDown={(e) => {
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                    }}
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
                  />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto (SKU)</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor/Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No hay movimientos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.type === 'IN' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800"><ArrowDownRight className="w-3.5 h-3.5" /> ENTRADA</span>}
                            {tx.type === 'OUT' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800"><ArrowUpRight className="w-3.5 h-3.5" /> SALIDA</span>}
                            {tx.type === 'ADJUSTMENT' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"><RefreshCcw className="w-3.5 h-3.5" /> AJUSTE</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{tx.product.name}</div>
                            <div className="text-xs text-gray-500">{tx.product.sku}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${tx.type === 'IN' ? 'text-emerald-600' : tx.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}`}>
                              {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : (tx.quantity > 0 ? '+' : '')}{tx.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {tx.provider ? <div className="font-medium text-gray-700">{tx.provider.name}</div> : null}
                            <div className="text-xs truncate max-w-[200px]" title={tx.notes || ''}>{tx.notes}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nuevo Movimiento</h2>
              <form onSubmit={handleSubmitTx} className="space-y-6">
                
                {/* Tipo de Movimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setFormData({...formData, type: 'IN'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors ${formData.type === 'IN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <ArrowDownRight className="w-6 h-6 mb-1" />
                      <span className="text-sm font-semibold">Entrada</span>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'OUT'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors ${formData.type === 'OUT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <ArrowUpRight className="w-6 h-6 mb-1" />
                      <span className="text-sm font-semibold">Salida</span>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'ADJUSTMENT'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors ${formData.type === 'ADJUSTMENT' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <RefreshCcw className="w-6 h-6 mb-1" />
                      <span className="text-sm font-semibold">Ajuste</span>
                    </button>
                  </div>
                </div>

                {/* Producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Producto *</label>
                  <select 
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>

                {/* Proveedor (Opcional, solo en Entradas) */}
                {formData.type === 'IN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Proveedor (Opcional)</label>
                    <select 
                      value={formData.providerId}
                      onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Ninguno / Compra local</option>
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cantidad * {formData.type === 'ADJUSTMENT' && '(Usa positivos para sumar y negativos para restar)'}
                  </label>
                  <input 
                    type={formData.type === 'ADJUSTMENT' ? "number" : "text"}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: formData.type === 'ADJUSTMENT' ? e.target.value.replace(/[^0-9\-]/g, '') : e.target.value.replace(/[^0-9]/g, '')})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. 10"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas / Motivo</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')})}
                    onKeyDown={(e) => {
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Motivo de la salida o ajuste..."
                    rows={3}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    Registrar {formData.type === 'IN' ? 'Entrada' : formData.type === 'OUT' ? 'Salida' : 'Ajuste'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Inventory;
