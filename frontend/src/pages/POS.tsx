import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  CreditCard,
  Banknote,
  Minus,
  Plus,
  Trash2,
  Printer,
  User
} from 'lucide-react';
import axiosInstance from '../api/axios';
import { useToast } from '../context/ToastContext';
import { generateSaleReceipt } from '../utils/generateSaleReceipt';

interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface Customer {
  id: number;
  name: string;
}

const POS: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');

  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCustomers();
    // Fetch some default products for quick select
    fetchProducts('');
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async (search: string) => {
    setLoadingSearch(true);
    try {
      const res = await axiosInstance.get(`/products?limit=20&search=${search}`);
      if (res.data && res.data.data) {
        setProducts(res.data.data);
      } else {
        setProducts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast('Producto sin stock disponible', 'error');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          showToast('No puedes exceder el stock disponible', 'error');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    
    // Focus search input for barcode scanners
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      setSearchTerm(''); // clear after add
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > item.stock) {
          showToast('No puedes exceder el stock disponible', 'error');
          return item;
        }
        if (newQ < 1) return item;
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const payload = {
        customerId: selectedCustomerId || null,
        paymentMethod,
        items: cart.map(c => ({
          productId: c.id,
          quantity: c.cartQuantity,
          price: c.price
        }))
      };

      const res = await axiosInstance.post('/sales', payload);
      showToast('Venta procesada con éxito', 'success');
      
      // Imprimir Ticket
      generateSaleReceipt(res.data);

      // Limpiar POS
      setCart([]);
      setSelectedCustomerId('');
      setSearchTerm('');
      fetchProducts(''); // Refrescar stock de lista actual
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al procesar la venta', 'error');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-slide-in h-[calc(100vh-120px)]">
      
      {/* SECCIÓN IZQUIERDA: Búsqueda y Productos */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              ref={searchInputRef}
              type="text" 
              autoFocus
              placeholder="Escanear código de barras o buscar producto..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingSearch ? (
             <div className="flex justify-center items-center h-32">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => addToCart(p)}
                  className={`p-4 rounded-xl border ${p.stock > 0 ? 'border-slate-100 hover:border-indigo-300 hover:shadow-md cursor-pointer bg-white' : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'} transition-all flex flex-col justify-between h-full`}
                >
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{p.sku}</p>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <p className="font-black text-indigo-600">${p.price.toFixed(2)}</p>
                    <p className={`text-xs font-bold ${p.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.stock} und
                    </p>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  No se encontraron productos.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: Carrito de Compras */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex-shrink-0">
        <div className="p-4 bg-slate-900 text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold">Ticket de Venta</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Carrito vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-slate-100 font-semibold text-sm leading-tight">{item.name}</h4>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-300 hover:text-white hover:bg-slate-600 rounded">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-slate-100 text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-300 hover:text-white hover:bg-slate-600 rounded">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-indigo-300 font-bold text-sm">
                    ${(item.price * item.cartQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="bg-slate-900 p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs text-slate-300">
              <User className="w-4 h-4 ml-2 mr-1 opacity-50" />
              <select 
                className="w-full bg-transparent border-none focus:ring-0 py-1.5 focus:outline-none"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="" className="bg-slate-800">Público en General</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setPaymentMethod('CASH')}
                className={`flex justify-center items-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all border ${paymentMethod === 'CASH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}
              >
                <Banknote className="w-3.5 h-3.5" /> Efectivo
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex justify-center items-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all border ${paymentMethod === 'CARD' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Tarjeta
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-1.5">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>IVA (16%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-xl font-black mt-2">
              <span>Total</span>
              <span className="text-indigo-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 mt-2"
          >
            <Printer className="w-5 h-5" /> Cobrar y Emitir Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
