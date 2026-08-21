import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit,
  X,
  Truck
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';

interface Provider {
  id: number;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

const Providers: React.FC = () => {
  const { showToast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/providers');
      setProviders(res.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      showToast('Error al cargar la lista de proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProvider(null);
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      contact: provider.contact || '',
      phone: provider.phone || '',
      email: provider.email || '',
      address: provider.address || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProvider) {
        // Editar
        await axiosInstance.put(`/providers/${editingProvider.id}`, formData);
        showToast('Proveedor actualizado exitosamente', 'success');
      } else {
        // Crear
        await axiosInstance.post('/providers', formData);
        showToast('Proveedor registrado exitosamente', 'success');
      }
      handleCloseModal();
      fetchProviders();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar el proveedor', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await axiosInstance.delete(`/providers/${id}`);
        showToast('Proveedor eliminado correctamente', 'success');
        fetchProviders();
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Error al eliminar el proveedor', 'error');
      }
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contact && p.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="space-y-6 animate-slide-in">
      
      {/* Barra de Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, contacto o correo..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
          />
        </div>
        
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 btn-gradient px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Proveedor
        </button>
      </div>

      <div className="card-premium rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 font-semibold tracking-wider uppercase border-b border-slate-50">
              <tr>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Contacto Principal</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                      <span className="text-slate-400 font-medium">Cargando proveedores...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Truck className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-slate-400 font-medium">No se encontraron proveedores registrados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProviders.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.contact || 'No especificado'}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{p.phone || 'No especificado'}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{p.email || 'No especificado'}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{p.address || 'No especificado'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Crear/Editar Proveedor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden animate-scale-up">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800">
                {editingProvider ? 'Editar Proveedor' : 'Registrar Proveedor'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre de la empresa */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre Comercial</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Distribuidora Central S.A."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setFormData({...formData, name: val});
                    }}
                  />
                </div>

                {/* Persona de Contacto */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Persona de Contacto</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.contact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setFormData({...formData, contact: val});
                    }}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    placeholder="Ej. +52 5512345678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                  />
                </div>

                {/* Correo */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="Ej. ventas@distribuidoracentral.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '')})}
                  />
                </div>

                {/* Dirección física */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dirección Física</label>
                  <textarea 
                    placeholder="Calle, Número, Ciudad, CP..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value.replace(/[^a-zA-Z0-9\s,.]/g, '')})}
                  />
                </div>

              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-50 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default Providers;
