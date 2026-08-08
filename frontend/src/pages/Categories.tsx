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

interface Category {
  id: number;
  name: string;
  description: string | null;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUserName(res.data.name);
    } catch (error) {
      console.error('Error cargando usuario', error);
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/categories', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear categoría');
    }
  };

  // Filtrado
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <button onClick={() => navigate('/products')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Boxes className="w-5 h-5" /> Productos
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
              <Tags className="w-5 h-5" /> Categorías
            </button>
            <button onClick={() => navigate('/providers')} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Truck className="w-5 h-5" /> Proveedores
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Users className="w-5 h-5" /> Usuarios
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
          <h1 className="text-xl font-semibold text-gray-800">Categorías</h1>
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
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar categoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                onKeyDown={(e) => {
                  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                }}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm transition-shadow"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{cat.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {cat.description || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nueva Categoría */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Registrar Categoría</h2>
              </div>
              <form onSubmit={handleCreateCategory} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')})}
                    onKeyDown={(e) => {
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. Lácteos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')})}
                    onKeyDown={(e) => {
                      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) e.preventDefault();
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Descripción breve..."
                    rows={3}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Categories;
