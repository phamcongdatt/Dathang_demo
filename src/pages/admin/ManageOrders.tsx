import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiRefreshCw, FiEye, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

type OrderStatus = 'Pending' | 'Preparing' | 'Confirmed' | 'Completed' | 'Rejected' | 'Cancelled';

interface Order {
  id: string;
  customerId?: string;
  storeName?: string;
  totalPrice?: number;
  status?: OrderStatus;
  createdAt?: string;
}

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Preparing: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Chờ xử lý',
  Preparing: 'Đang chuẩn bị',
  Confirmed: 'Đã xác nhận',
  Completed: 'Hoàn thành',
  Rejected: 'Đã từ chối',
  Cancelled: 'Đã hủy',
};

const getStatus = (status: any): OrderStatus => {
  const validStatuses: OrderStatus[] = ['Pending', 'Preparing', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'];
  return validStatuses.includes(status) ? status : 'Pending';
};

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số đơn hàng trên mỗi trang

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5118/api/admin/GetAllOrders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to load orders');
        }
        
        const response = await res.json();
        const data = response.data || [];
        
        const safeOrders = data.map((order: any) => ({
          id: order.id || '',
          customerId: order.customerId || 'Không xác định',
          storeName: order.storeName || 'Không xác định',
          totalPrice: order.totalPrice || 0,
          status: getStatus(order.status), // Sử dụng getStatus để đảm bảo giá trị hợp lệ
          createdAt: order.createdAt || new Date().toISOString()
        }));
        
        setOrders(safeOrders);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm dd/MM/yyyy', { locale: vi });
    } catch {
      return 'Không xác định';
    }
  };

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Không có đơn hàng</h3>
              <p className="mt-1 text-sm text-gray-500">Hiện không có đơn hàng nào trong hệ thống.</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa hàng</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerId || 'Không xác định'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.storeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(order.totalPrice || 0).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[order.status || 'Pending']
                          }`}>
                            {statusLabels[order.status || 'Pending']}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? formatDate(order.createdAt) : 'Không xác định'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Phân trang */}
              <div className="flex justify-center items-center py-4 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageOrders;