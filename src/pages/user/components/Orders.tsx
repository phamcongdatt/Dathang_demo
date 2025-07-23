import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiTruck, FiXCircle, FiShoppingBag } from 'react-icons/fi';

interface ProductItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  storeId: string;
  storeName?: string;
  deliveryAddress: string;
  paymentMethod: string;
  price?: number;
  createdAt?: string;
  status?: string;
  items: ProductItem[];
}

const statusIcons = {
  'Pending': <FiClock className="text-yellow-500" />,
  'Processing': <FiClock className="text-blue-500" />,
  'Shipped': <FiTruck className="text-blue-500" />,
  'Delivered': <FiCheckCircle className="text-green-500" />,
  'Cancelled': <FiXCircle className="text-red-500" />,
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your orders!');
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5118/api/Orders/myorders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.title || `Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      const enrichedOrders = await Promise.all(data.map(async (order: Order) => {
        if (!order.storeName && order.storeId) {
          const storeRes = await fetch(`http://localhost:5118/api/Stores/${order.storeId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            return { ...order, storeName: storeData.name };
          }
        }
        return order;
      }));

      setOrders(enrichedOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders. Please try again!');
      if (err.message.includes('401')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotal = (items: ProductItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="h-96 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiXCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => navigate('/login')}
                  >
                    Login Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Danh sách đơn hàng của bạn
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              All your purchases in one place
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders yet.
              </p>
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
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          {order.storeName || 'Store name not available'}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-2">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-4">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div key={index} className="flex items-start border-b border-gray-100 pb-4">
                              
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                                  <p className="mt-1 text-sm text-gray-500">Unit price: {item.price.toLocaleString('vi-VN')}₫</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No items in this order</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Order Summary</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Order Date</span>
                              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Delivery Address</span>
                              <span className="text-right">{order.deliveryAddress}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Payment Method</span>
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <span>Total</span>
                                <span>{calculateTotal(order.items).toLocaleString('vi-VN')}₫</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button
                            type="button"
                            className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Track Order
                          </button>
                          <button
                            type="button"
                            className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Order Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;