import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { OrderStatus, PaymentMethod } from '../../types/enums';
import { FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiPackage, FiDollarSign } from 'react-icons/fi';
import { BsCash, BsCreditCard } from 'react-icons/bs';

interface Store {
  id: string;
  name: string;
  logo?: string;
}

interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  customerName: string;
  deliveryAddress: string;
  items: {
    menuId: string;
    name: string;
    quantity: number;
    price: number;
    note?: string;
  }[];
}

const StoreOrders: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  // Fetch stores data
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5118/api/Stores/mystores', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Không thể tải danh sách cửa hàng');

        const data = await res.json();
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
        setLoading(false);
      }
    };
    fetchStores();
  }, [navigate]);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedStoreId) return;
      
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5118/api/orders/store/${selectedStoreId}`;
        
        const params = new URLSearchParams();
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        if (selectedPayment !== 'all') params.append('paymentMethod', selectedPayment);
        
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to load orders' }));
          throw new Error(errorData.message || `Error ${res.status}`);
        }
        
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [selectedStoreId, selectedStatus, selectedPayment]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatus),
      });

      if (!res.ok) throw new Error(res.statusText);

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/orders/${orderId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!res.ok) throw new Error(res.statusText);

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: OrderStatus.Rejected } : order
      ));
      setIsRejecting(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to reject order');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return <FiClock className="mr-1" />;
      case OrderStatus.Confirmed: return <FiCheckCircle className="mr-1" />;
      case OrderStatus.Preparing: return <FiPackage className="mr-1" />;
      case OrderStatus.Ready: return <FiTruck className="mr-1" />;
      case OrderStatus.Completed: return <FiCheckCircle className="mr-1" />;
      case OrderStatus.Cancelled: return <FiXCircle className="mr-1" />;
      case OrderStatus.Rejected: return <FiXCircle className="mr-1" />;
      default: return <FiShoppingBag className="mr-1" />;
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.COD: return <BsCash className="mr-1" />;
      case PaymentMethod.Online: return <BsCreditCard className="mr-1" />;
      default: return <FiDollarSign className="mr-1" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case OrderStatus.Confirmed: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.Preparing: return 'bg-purple-50 text-purple-700 border-purple-200';
      case OrderStatus.Ready: return 'bg-green-50 text-green-700 border-green-200';
      case OrderStatus.Completed: return 'bg-gray-50 text-gray-700 border-gray-200';
      case OrderStatus.Cancelled: return 'bg-red-50 text-red-700 border-red-200';
      case OrderStatus.Rejected: return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const statusActions = [
    { status: OrderStatus.Pending, actions: ['confirm', 'reject'] },
    { status: OrderStatus.Confirmed, actions: ['preparing'] },
    { status: OrderStatus.Preparing, actions: ['ready'] },
    { status: OrderStatus.Ready, actions: ['complete'] }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và quản lý tất cả đơn hàng của cửa hàng
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {stores.length > 0 && (
              <select
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            )}
            
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tất cả hình thức</option>
                {Object.values(PaymentMethod).map(method => (
                  <option key={method} value={method}>
                    {method === PaymentMethod.COD ? 'Tiền mặt' : 'Online'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiXCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : !selectedStoreId && !loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-3 text-lg font-medium text-gray-900">Bạn chưa có cửa hàng nào</h3>
            <p className="mt-2 text-sm text-gray-500">Vui lòng tạo cửa hàng để bắt đầu quản lý đơn hàng.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/stores/create')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
              >
                Tạo cửa hàng mới
              </button>
            </div>
          </div>
        ) : orders.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-3 text-lg font-medium text-gray-900">Không có đơn hàng</h3>
            <p className="mt-2 text-sm text-gray-500">Hiện không có đơn hàng nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
            {orders.map(order => (
                <li key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <FiShoppingBag className="mr-2 text-orange-500" />
                          Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {getPaymentIcon(order.paymentMethod)}
                          {order.paymentMethod === PaymentMethod.COD ? 'Tiền mặt' : 'Online'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          <FiDollarSign className="mr-1" />
                          {order.paymentStatus === 'Pending' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                        </span>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Khách hàng:</span> {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Địa chỉ:</span> {order.deliveryAddress}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Thời gian:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {order.totalPrice.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Chi tiết đơn hàng</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            {item.note && (
                              <p className="text-xs text-gray-500 mt-1">Ghi chú: {item.note}</p>
                            )}
                          </div>
                          <span className="text-gray-900">{item.price.toLocaleString('vi-VN')}₫</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {isRejecting === order.id ? (
                      <div className="w-full sm:w-auto bg-white p-3 rounded-lg shadow-md border border-gray-200">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Nhập lý do từ chối..."
                          className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setIsRejecting(null);
                              setRejectReason('');
                            }}
                            className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                          >
                            Xác nhận từ chối
                          </button>
                        </div>
                </div>
                    ) : (
                      <>
                        {order.status === OrderStatus.Pending && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.Confirmed)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
                            >
                              <FiCheckCircle className="mr-1" />
                              Xác nhận
                            </button>
                            <button
                              onClick={() => setIsRejecting(order.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center"
                            >
                              <FiXCircle className="mr-1" />
                              Từ chối
                            </button>
                          </>
                        )}
                        {order.status === OrderStatus.Confirmed && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Preparing)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
                          >
                            <FiPackage className="mr-1" />
                            Bắt đầu chuẩn bị
                          </button>
                        )}
                        {order.status === OrderStatus.Preparing && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Ready)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium flex items-center"
                          >
                            <FiTruck className="mr-1" />
                            Đã chuẩn bị xong
                          </button>
                        )}
                        {order.status === OrderStatus.Ready && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, OrderStatus.Completed)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center"
                          >
                            <FiCheckCircle className="mr-1" />
                            Hoàn thành
                          </button>
                        )}
                      </>
                    )}
              </div>
                </li>
            ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StoreOrders; 