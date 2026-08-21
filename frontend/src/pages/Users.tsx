import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserCheck, 
  Trash2, 
  ShieldAlert, 
  Calendar,
  UserX
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMINISTRADOR' | 'ALMACENISTA' | 'COMPRAS' | 'GERENTE';
  createdAt: string;
}

const Users: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal / Edit state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'ADMINISTRADOR' | 'ALMACENISTA' | 'COMPRAS' | 'GERENTE'>('ALMACENISTA');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setCurrentUser(res.data);
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      showToast('Error al cargar la lista de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await axiosInstance.put(`/users/${selectedUser.id}/role`, { role: newRole });
      showToast('Rol de usuario actualizado con éxito', 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al actualizar el rol', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (currentUser && currentUser.id === id) {
      showToast('No puedes eliminarte a ti mismo', 'error');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario del sistema?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${id}`);
      showToast('Usuario eliminado con éxito', 'success');
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al eliminar el usuario', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
            Administrador
          </span>
        );
      case 'ALMACENISTA':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
            Almacenista
          </span>
        );
      case 'COMPRAS':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Compras
          </span>
        );
      case 'GERENTE':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
            Gerente
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
            {role}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="space-y-6 animate-slide-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s@.]/g, ''))}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 font-semibold tracking-wider uppercase border-b border-slate-50">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol en Sistema</th>
                <th className="px-6 py-4">Fecha Registro</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                      <span className="text-slate-400 font-medium">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserX className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-slate-400 font-medium">No se encontraron usuarios registrados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-850 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border border-slate-200">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-800">{user.name}</p>
                        {currentUser && currentUser.id === user.id && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">Tú (Actual)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5 whitespace-nowrap mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Cambiar Rol"
                        >
                          <UserCheck className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={currentUser && currentUser.id === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            currentUser && currentUser.id === user.id 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Eliminar Usuario"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center gap-2.5 mb-6 text-indigo-600">
              <ShieldAlert className="w-5.5 h-5.5" />
              <h3 className="text-sm font-bold text-slate-800">Modificar Rol de Usuario</h3>
            </div>
            
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Usuario Seleccionado</label>
                <input 
                  type="text" 
                  disabled 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-500 focus:outline-none"
                  value={`${selectedUser.name} (${selectedUser.email})`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nuevo Rol Autorizado</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                >
                  <option value="ADMINISTRADOR">Administrador (Control total)</option>
                  <option value="ALMACENISTA">Almacenista (Entradas, salidas y stock)</option>
                  <option value="COMPRAS">Compras (Gestión de proveedores y catálogos)</option>
                  <option value="GERENTE">Gerente (Vista general e informes)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  Confirmar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
