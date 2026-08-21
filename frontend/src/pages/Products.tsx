import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle,
  X,
  PackageCheck
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';

interface Product {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  minStock: number;
  categoryId: number;
  category: { name: string };
}

interface Category {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    price: '',
    stock: '',
    minStock: '5',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error al cargar la lista de productos', 'error');
    } finally {
      setLoading(false);
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

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      price: '',
      stock: '0',
      minStock: '5',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId.toString(),
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Editar producto
        await axiosInstance.put(`/products/${editingProduct.id}`, formData);
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        // Crear producto
        await axiosInstance.post('/products', formData);
        showToast('Producto creado exitosamente', 'success');
      }
      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al guardar el producto', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        showToast('Producto eliminado correctamente', 'success');
        fetchProducts();
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Error al eliminar el producto', 'error');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
          Sin Stock
        </span>
      );
    }
    if (stock <= minStock) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
          <AlertTriangle className="w-3.5 h-3.5" />
          Bajo Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
        Disponible ({stock})
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6 animate-slide-in">
      
      {/* Barra de Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => {
              // Limitar caracteres especiales en la búsqueda
              setSearchTerm(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));
            }}
          />
        </div>
        
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 btn-gradient px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="card-premium rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 font-semibold tracking-wider uppercase border-b border-slate-50">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio Unitario</th>
                <th className="px-6 py-4">Estado Stock</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                      <span className="text-slate-400 font-medium">Cargando productos...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <PackageCheck className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-slate-400 font-medium">No se encontraron productos registrados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-500 font-semibold">
                      <p className="font-bold text-slate-800">{product.sku}</p>
                      {product.barcode && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5" title="Código de Barras">
                          {product.barcode}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      {product.description && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 max-w-xs truncate" title={product.description}>
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg font-medium text-[10px]">
                        {product.category?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{getStockBadge(product.stock, product.minStock)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
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

      {/* Modal Crear/Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden animate-scale-up">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800">
                {editingProduct ? 'Editar Producto' : 'Registrar Producto'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre del Producto</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Computadora Portátil"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.name}
                    onChange={(e) => {
                      // Validación estricta: sin caracteres especiales
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setFormData({...formData, name: val});
                    }}
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">SKU (Código Único)</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingProduct} // SKU es llave única y de catálogo, mejor no editarlo
                    placeholder="Ej. COMP-001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
                    value={formData.sku}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                      setFormData({...formData, sku: val});
                    }}
                  />
                </div>

                {/* Código de Barras */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Código de Barras (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 750123456789"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.barcode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      setFormData({...formData, barcode: val});
                    }}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Precio Unitario ($)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                {/* Stock Inicial / Stock Mínimo */}
                {editingProduct ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Mínimo Alerta</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={formData.minStock}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 5) return;
                        setFormData({...formData, minStock: val});
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Inicial</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="0"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        value={formData.stock}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length > 5) return;
                          setFormData({...formData, stock: val});
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción (Opcional)</label>
                  <textarea 
                    placeholder="Detalles sobre el producto..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setFormData({...formData, description: val});
                    }}
                  />
                </div>

              </div>

              {/* Botones de acción */}
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

export default Products;
