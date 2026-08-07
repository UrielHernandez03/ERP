import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageOpen, 
  LayoutDashboard, 
  Boxes, 
  Tags, 
  Users, 
  Truck,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import axiosInstance from '../api/axios';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalProviders: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
    totalProviders: 0
  });

  useEffect(() => {
    // 1. Obtener la información del usuario logueado
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        setUserName(res.data.name);
      } catch (error) {
        console.error('Error cargando usuario', error);
      }
    };

    // 2. Obtener las estadísticas
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error cargando estadísticas', error);
      }
    };

    fetchUser();
    fetchStats();
  }, []);

  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem('token');
    // Redirigir al login
    navigate('/login');
  };

  // Función para obtener las iniciales del nombre (ej: "Juan Pérez" -> "JP")
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar / Barra Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-blue-600">
              <PackageOpen className="w-7 h-7" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Inventory<span className="text-blue-600">Pro</span></span>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Boxes className="w-5 h-5" />
              Productos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Tags className="w-5 h-5" />
              Categorías
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Truck className="w-5 h-5" />
              Proveedores
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
              <Users className="w-5 h-5" />
              Usuarios
            </a>
          </nav>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Panel General</h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar algo..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-shadow"
                onChange={(e) => {
                  // Filtra cualquier caracter especial, dejando solo letras, números y espacios
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                }}
                onKeyDown={(e) => {
                  // Bloquear teclas de símbolos comunes para evitar que siquiera se dibujen
                  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            
            <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div 
              className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 cursor-pointer"
              title={userName || 'Usuario'}
            >
              {getInitials(userName)}
            </div>
          </div>
        </header>

        {/* Área de trabajo (Dashboard Cards) */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Tarjeta 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Productos</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Boxes className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-emerald-500 font-medium">Actualizado</span>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.lowStockProducts}</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-amber-500 font-medium">Requieren atención</span>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Categorías</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCategories}</h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Tags className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Organización activa</span>
              </div>
            </div>

            {/* Tarjeta 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Proveedores</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProviders}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-emerald-500 font-medium">Activos</span>
              </div>
            </div>
          </div>

          {/* Sección de Actividad Reciente */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-400 font-medium">No hay actividad reciente para mostrar por ahora.</p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Dashboard;
