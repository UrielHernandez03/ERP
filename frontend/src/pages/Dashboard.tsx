import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  Tags, 
  Truck,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  ClipboardList
} from 'lucide-react';
import axiosInstance from '../api/axios';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalProviders: number;
}

interface RecentActivity {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  notes: string | null;
  product: { name: string; sku: string };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
    totalProviders: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStatsAndActivity = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        axiosInstance.get('/dashboard/stats'),
        axiosInstance.get('/inventory')
      ]);
      setStats(statsRes.data);
      // Solo tomamos los 5 movimientos más recientes
      setRecentActivities(activityRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndActivity();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bienvenido de nuevo al panel</h2>
          <p className="text-sm text-slate-500 mt-1">Aquí tienes un resumen del estado actual de tu inventario y operaciones.</p>
        </div>
        <button 
          onClick={fetchStatsAndActivity}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1 - Productos */}
        <div 
          onClick={() => navigate('/products')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200/80 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Productos</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{stats.totalProducts}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-emerald-500 mt-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            Catálogo al día
          </div>
        </div>

        {/* Tarjeta 2 - Stock Bajo */}
        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200/80 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Stock Crítico</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{stats.lowStockProducts}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className={`flex items-center text-xs font-medium mt-2 ${stats.lowStockProducts > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {stats.lowStockProducts > 0 
              ? 'Requiere reabastecimiento' 
              : 'Todo el stock normal'}
          </div>
        </div>

        {/* Tarjeta 3 - Categorías */}
        <div 
          onClick={() => navigate('/categories')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200/80 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Categorías</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{stats.totalCategories}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs text-slate-400 mt-2 font-medium">
            Clasificación activa
          </div>
        </div>

        {/* Tarjeta 4 - Proveedores */}
        <div 
          onClick={() => navigate('/providers')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200/80 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Proveedores</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{stats.totalProviders}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-500 font-medium mt-2">
            Socios comerciales activos
          </div>
        </div>

      </div>

      {/* Actividad Reciente & Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actividad Reciente (Kárdex Express) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Últimos Movimientos</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Ver Kárdex completo
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-medium">No hay actividad reciente en el inventario.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 rounded-xl border border-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      activity.type === 'IN' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : activity.type === 'OUT' 
                          ? 'bg-rose-50 text-rose-600' 
                          : 'bg-blue-50 text-blue-600'
                    }`}>
                      {activity.type === 'IN' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : activity.type === 'OUT' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <RefreshCcw className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{activity.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{activity.product.sku} • {activity.notes || 'Sin descripción'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${
                      activity.type === 'IN' 
                        ? 'text-emerald-600' 
                        : activity.type === 'OUT' 
                          ? 'text-rose-600' 
                          : 'text-blue-600'
                    }`}>
                      {activity.type === 'IN' ? '+' : activity.type === 'OUT' ? '-' : ''}{activity.quantity} und
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-6">Operaciones Rápidas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/inventory')} 
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-indigo-50/30 hover:text-indigo-700 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100 transition-all text-left"
              >
                <span>Registrar movimiento de stock</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => navigate('/products')} 
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-indigo-50/30 hover:text-indigo-700 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100 transition-all text-left"
              >
                <span>Añadir nuevo producto</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => navigate('/providers')} 
                className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-indigo-50/30 hover:text-indigo-700 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100 transition-all text-left"
              >
                <span>Gestionar base de proveedores</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl text-white text-xs relative overflow-hidden shadow-md shadow-indigo-500/10">
            <div className="relative z-10 space-y-2">
              <p className="font-bold text-sm">Control de Stock Crítico</p>
              <p className="text-white/80 leading-relaxed">Configura stock mínimo en cada producto para recibir alertas inmediatas de desabastecimiento.</p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
