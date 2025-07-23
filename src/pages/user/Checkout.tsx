import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiShoppingBag, FiMapPin, FiPhone, FiCreditCard, FiEdit2, FiLoader } from 'react-icons/fi';

interface OrderItem {
  menuId: string;
  quantity: number;
  name?: string;
  price?: number;
  note?: string;
  storeId?: string;
  imageUrl?: string;
}

interface CheckoutState {
  items: OrderItem[];
  paymentMethod?: 'COD' | 'Online' | 'MOMO';
  deliveryAddress?: string;
  phoneNumber?: string;
}

interface PaymentMethodOption {
  value: 'COD' | 'Online' | 'MOMO';
  label: string;
  icon: React.ReactNode;
  description: string;
}

// Add PaymentMethod type
type PaymentMethod = 'COD' | 'Online' | 'MOMO';

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | undefined;

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(state?.paymentMethod || 'COD');
  const [note, setNote] = useState('');
  const [isEditingShipping, setIsEditingShipping] = useState(false);

  // Get shipping info from localStorage or state
  const [deliveryAddress, setDeliveryAddress] = useState(
    localStorage.getItem('deliveryAddress') || state?.deliveryAddress || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    localStorage.getItem('phoneNumber') || state?.phoneNumber || ''
  );

  const paymentMethods: PaymentMethodOption[] = [
    {
      value: 'COD',
      label: '',
      icon: <FiShoppingBag className="text-green-500" />,
      description: 'Thanh toán khi nhận hàng'
    },
    {
      value: 'Online',
      label: 'Ví VNPAY',
      icon: <FiCreditCard className="text-blue-500" />,
      description: 'Thanh toán qua tài khoản VNpay  '
    },
    {
      value: 'MOMO',
      label: 'Ví MOMO ',
      icon: <FiCreditCard className="text-pink-500" />,
      description: 'Thanh toán qua tài khoản MOMO'
    }
  ];

  useEffect(() => {
    const tempOrder = localStorage.getItem('tempOrder');
    const initialState = state || (tempOrder ? JSON.parse(tempOrder) : null);

    if (!initialState || !initialState.items || initialState.items.length === 0) {
      navigate('/');
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const itemsWithDetails = await Promise.all(
          initialState.items.map(async (item: OrderItem) => {
            const res = await fetch(`http://localhost:5118/api/Menus/${item.menuId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
              },
              credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to load product ${item.menuId}`);
            const product = await res.json();
            return {
              menuId: item.menuId,
              quantity: item.quantity,
              name: product.name || item.name,
              price: product.price || item.price,
              note: item.note || '',
              storeId: product.storeId || item.storeId,
              imageUrl: product.imageUrl || item.imageUrl,
            };
          })
        );
        setOrderItems(itemsWithDetails);
        setTotal(itemsWithDetails.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0));
      } catch (err: any) {
        setError('Failed to load product details. Please try again!');
      }
    };

    fetchProductDetails();

    if (!deliveryAddress || !phoneNumber) {
      navigate('/shipping-info', { state: { items: initialState.items, paymentMethod } });
    }

    if (tempOrder) localStorage.removeItem('tempOrder');
  }, [state, navigate, deliveryAddress, phoneNumber, paymentMethod]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!deliveryAddress || !phoneNumber) {
      setError('Please enter delivery address and phone number!');
      return;
    }
    
    const storeId = orderItems[0]?.storeId;
    if (!storeId) {
      setError('Store ID not found. Please check your data!');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Chuyển paymentMethod về 'Online' nếu là VNPAY hoặc MOMO
      let backendPaymentMethod: 'COD' | 'Online' = paymentMethod === 'COD' ? 'COD' : 'Online';
      const payload = {
        StoreId: storeId,
        DeliveryAddress: deliveryAddress,
        PaymentMethod: backendPaymentMethod,
        Items: orderItems.map((item) => ({
          MenuId: item.menuId,
          Quantity: item.quantity,
          Note: item.note || note,
        })),
      };
      
      const res = await fetch('http://localhost:5118/api/Orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || 'An error occurred!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShipping = () => {
    localStorage.setItem('deliveryAddress', deliveryAddress);
    localStorage.setItem('phoneNumber', phoneNumber);
    setIsEditingShipping(false);
  };

  if (!state && !localStorage.getItem('tempOrder')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Kiểm tra </h1>
            <p className="mt-2 text-lg text-gray-600">Xem lại đơn hàng của bạn trươc khi đăt hàng </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Đơn hàng</h2>
                  <span className="text-sm text-gray-500">{orderItems.length} sản phẩm  </span>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="py-4 flex">
                      <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/80'}
                          alt={item.name || `Product ${item.menuId}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            {item.name || `Product ${item.menuId}`}
                          </h3>
                          <p className="ml-4 text-base font-medium text-gray-900">
                            {(item.price || 0 * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-500">Số lượng  : {item.quantity}</p>
                        
                        {item.note && (
                          <p className="mt-1 text-sm text-gray-500">Ghi chú: {item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Giá  </p>
                    <p>{total.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Thông tin giao hàng </h2>
                  <button 
                    onClick={() => setIsEditingShipping(!isEditingShipping)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <FiEdit2 className="mr-1" /> {isEditingShipping ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {isEditingShipping ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Địa chỉ giao hànghàng
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Số điện thoạithoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleUpdateShipping}
                      className="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FiMapPin className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Địa chỉ giao hàng </p>
                        <p className="text-sm text-gray-500">{deliveryAddress}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiPhone className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">Phone Number</p>
                        <p className="text-sm text-gray-500">{phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú cho đơn hàng </h2>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Special instructions for your order..."
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương thức thanh toán </h2>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.value 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod(method.value)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                          {method.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{method.label}</h3>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                        <div className="ml-auto">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={() => {}}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng tiền </span>
                    <span className="text-sm font-medium text-gray-900">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping</span>
                    <span className="text-sm font-medium text-gray-900">Miễn phí  </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Tổng tiền </span>
                      <span className="text-base font-bold text-indigo-600">
                        {total.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || !deliveryAddress || !phoneNumber}
                  className={`mt-6 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading || !deliveryAddress || !phoneNumber ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FiLoader className="animate-spin mr-2" /> Processing...
                    </span>
                  ) : (
                    'Tiếp tục đặt hàng'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;