import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Menu, 
  X,
  ClipboardList
} from 'lucide-react';
import axiosInstance from '../api/axios';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        setUserName(res.data.name);
        setUserRole(res.data.role);
      } catch (error) {
        console.error('Error cargando usuario', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Panel de Control';
      case '/inventory': return 'Control de Inventario';
      case '/products': return 'Catálogo de Productos';
      case '/categories': return 'Categorías de Productos';
      case '/providers': return 'Gestión de Proveedores';
      case '/users': return 'Gestión de Usuarios';
      default: return 'InventoryPro ERP';
    }
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventario', path: '/inventory', icon: ClipboardList },
    { name: 'Productos', path: '/products', icon: Boxes },
    { name: 'Categorías', path: '/categories', icon: Tags },
    { name: 'Proveedores', path: '/providers', icon: Truck },
    // Solo habilitar Usuarios en el Sidebar si es ADMINISTRADOR
    ...(userRole === 'ADMINISTRADOR' ? [{ name: 'Usuarios', path: '/users', icon: Users }] : [])
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo / Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-50">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <PackageOpen className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Inventory<span className="text-indigo-600">Pro</span>
              </span>
            </div>
          </div>

          {/* Menú */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50/70 text-indigo-700 shadow-sm border border-indigo-100/30' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (Usuario y Logout) */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName || 'Usuario'}</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">{userRole || 'Rol'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50/50 rounded-xl text-sm font-medium transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform text-red-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar móvil) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <aside className="relative w-64 bg-white h-full flex flex-col justify-between p-4 shadow-2xl animate-slide-in">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-indigo-600">
                  <PackageOpen className="w-6 h-6" />
                  <span className="text-lg font-bold text-slate-900 tracking-tight">InventoryPro</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-slate-50 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-100">
                  {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">{userRole}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50/50 rounded-xl text-sm font-medium transition-all"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Buscador Rápido (Desktop) */}
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Búsqueda rápida..." 
                className="pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 transition-all duration-200"
              />
            </div>
            
            {/* Notificaciones */}
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>
            
            {/* Avatar Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/10 border border-indigo-200/20 hover:scale-[1.03] active:scale-95 transition-transform"
                title={userName || 'Usuario'}
              >
                {getInitials(userName)}
              </button>
              
              {isUserDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsUserDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-30 animate-slide-in">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{userRole}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50/50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
