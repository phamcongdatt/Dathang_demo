import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiCreditCard, FiDollarSign, FiLoader } from 'react-icons/fi';

interface CartItem {
  id: string;
  menuId: string;
  menuName: string;
  menuImage?: string;
  menuPrice: number;
  quantity: number;
  note?: string;
  subTotal: number;
}
interface Product {
  id: string;
  storeId: string; 
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
}
const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'COD'>('COD');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5118/api/Cart', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to load cart');
        const data = await res.json();
        setItems((data.data && data.data.items) ? data.data.items : []);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const total = items.reduce((sum, item) => sum + (item.subTotal || 0), 0);

  const handleRemove = async (itemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5118/api/Cart/remove-item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to remove item');
      setItems(prev => prev.filter(item => item.id !== itemId));
      await refreshCartCount();
    } catch (err) {
      alert('Could not remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:5118/api/Cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to clear cart');
      setItems([]);
      await refreshCartCount();
    } catch (err) {
      alert('Could not clear cart. Please try again.');
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5118/api/Cart/update-quantity/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to update quantity');
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, quantity: newQuantity, subTotal: i.menuPrice * newQuantity } 
          : i
      ));
      await refreshCartCount();
    } catch (err) {
      alert('Could not update quantity. Please try again.');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:5118/api/Orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(i => ({ menuId: i.menuId, quantity: i.quantity, note: i.note })),
          paymentMethod,
        }),
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.message || 'Checkout failed');
      navigate(`/order/${data.id}`);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout error occurred');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn </h1>
            <p className="mt-2 text-gray-600">
              {items.length > 0 
                ? ` Bạn có ${items.length} sản phẩm ${items.length > 1 ? '' : ''} trong giỏ hàng  `
                : 'Giỏ hàng trống '}
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start adding some delicious items to your cart</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.id} className="p-4 flex">
                    <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={item.menuImage || 'https://source.unsplash.com/300x300/?food'}
                        alt={item.menuName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.menuName}
                        </h3>
                        <p className="ml-4 text-lg font-medium text-gray-900">
                          {(item.subTotal / 100).toFixed(2)} VNĐ
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <button 
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="text-gray-500 hover:text-indigo-500"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        
                        <span className="mx-2 text-gray-700">{item.quantity}</span>
                        
                        <button 
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="text-gray-500 hover:text-indigo-500"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mt-2 flex">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FiTrash2 className="mr-1 h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Tổng tiền  </p>
                  <p>{(total / 100).toFixed(2)} VNĐ</p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Phương thức thanh toán </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 border rounded-md flex items-center justify-center ${
                        paymentMethod === 'COD' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FiDollarSign className="h-5 w-5 mr-2" />
                      <span>Thanh toán khi nhận hàng </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Online')}
                      className={`p-3 border rounded-md flex items-center justify-center ${
                        paymentMethod === 'Online' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FiCreditCard className="h-5 w-5 mr-2" />
                      <span>Online Payment</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleClearCart}
                    className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center"
                  >
                    <FiTrash2 className="mr-1 h-4 w-4" /> Xóa giỏ hàng
                  </button>
                  
                  <button
                     onClick={e => {
                      e.stopPropagation();
                      navigate('/checkout');
                    }}
                    className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <>
                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      'Tiếp tục đặt hàng'
                    )}
                  </button>
                </div>
                
                {checkoutError && (
                  <div className="mt-4 text-sm text-red-600 text-center">
                    {checkoutError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;