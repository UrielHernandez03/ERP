import React, { useState, useEffect } from 'react';
import { 
  PackageOpen, 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit,
  LayoutDashboard,
  Boxes,
  Tags,
  Users,
  Truck,
  LogOut,
  Bell,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: { name: string };
}

interface Category {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: '',
    stock: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/products', formData);
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', categoryId: '', price: '', stock: '', description: '' });
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product', error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
            <button onClick={() => navigate('/inventory')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <ClipboardList className="w-5 h-5" /> Inventario
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
              <Boxes className="w-5 h-5" /> Productos
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Tags className="w-5 h-5" /> Categorías
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Truck className="w-5 h-5" /> Proveedores
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Users className="w-5 h-5" /> Usuarios
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Productos</h1>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o SKU..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  setSearchTerm(val);
                }}
                onKeyDown={(e) => {
                  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                }}
              />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {product.category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} und
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Nuevo Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Registrar Producto</h2>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')})}
                    onKeyDown={(e) => { if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault(); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select 
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input 
                    required 
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                  <input 
                    required 
                    type="number"
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  Guardar Producto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
