import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit,
  AlertTriangle,
  PackageCheck
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';
import ProductModal, { type Product, type Category } from '../components/products/ProductModal';
import ExportButtons from '../components/common/ExportButtons';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (formData: any) => {
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
      throw error; // Rethrow to let the modal know it failed
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
        
        <div className="flex items-center gap-2">
          <ExportButtons 
            data={filteredProducts} 
            filename="Catalogo_Productos" 
            columns={[
              { header: 'SKU', key: 'sku' },
              { header: 'Código de Barras', key: 'barcode' },
              { header: 'Producto', key: 'name' },
              { header: 'Categoría', key: 'category.name' },
              { header: 'Precio Unitario ($)', key: 'price' },
              { header: 'Stock Actual', key: 'stock' },
              { header: 'Stock Mínimo', key: 'minStock' }
            ]} 
          />
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 btn-gradient px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={categories}
      />

    </>
  );
};

export default Products;
