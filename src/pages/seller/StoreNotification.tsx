import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Notification {
  id: string;
  title: string;
  message: string;
  content?: string;
  createdAt: string;
  isRead?: boolean;
  type?: string;
  data?: string;
}

interface Order {
  DeliveryAddress: string;
}

const StoreNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Notification | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Sửa typo 'selecte' thành 'selectedOrder'
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5118/api/Notification', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Không thể tải thông báo');
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Helper: Lấy orderId từ message hoặc data
  function extractOrderId(notification: Notification): string | null {
    if (notification.data) return notification.data;
    const match = notification.message?.match(/#([a-f0-9\-]{10,})/i);
    return match ? match[1] : null;
  }

  // Fetch thông tin Order nếu cần
  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/Orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải thông tin đơn hàng');
      const data = await res.json();
      setSelectedOrder(data); // Giả sử API trả về object chứa DeliveryAddress
    } catch (err: any) {
      setError(err.message || 'Có lỗi khi tải thông tin đơn hàng');
    }
  };

  // Xác nhận hoặc từ chối
  const handleAction = async (type: 'Confirmed' | 'reject', notification: Notification) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('token');
      let res;
      if (notification.type === 'order') {
        const orderId = extractOrderId(notification);
        if (!orderId) throw new Error('Không tìm thấy mã đơn hàng!');
        if (type === 'Confirmed') {
          res = await fetch(`http://localhost:5118/api/Orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify('Confirmed'),
          });
        } else {
          res = await fetch(`http://localhost:5118/api/Orders/${orderId}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify("Người bán đã từ chối đơn hàng"),
          });
        }
      } else {
        // Xử lý cho các loại thông báo khác (nếu có)
        throw new Error('Loại thông báo không hỗ trợ hành động này');
      }

      if (!res.ok) throw new Error('Thao tác thất bại');
      setActionSuccess(type === 'Confirmed' ? 'Đã xác nhận thành công!' : 'Đã từ chối!');
      
      // Xóa thông báo sau khi hành động thành công
      await fetch(`http://localhost:5118/api/Notification/${notification.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setNotifications(prev => prev.filter(n => n.id !== notification.id));

      setTimeout(() => {
        setModalOpen(false);
        setSelected(null);
        setSelectedOrder(null);
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  // Mở modal và tải thông tin Order nếu cần
  const handleOpenModal = (notification: Notification) => {
    setSelected(notification);
    setModalOpen(true);
    if (notification.type === 'order') {
      const orderId = extractOrderId(notification);
      if (orderId) fetchOrderDetails(orderId);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiBell className="mr-2" /> Thông báo của bạn
          </h1>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiBell className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <FiBell className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Không có thông báo nào</h3>
              <p className="mt-1 text-sm text-gray-500">Bạn chưa nhận được thông báo nào.</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`bg-white shadow rounded-lg p-5 flex items-start gap-4 border-l-4 ${noti.isRead ? 'border-gray-300' : 'border-blue-500'} cursor-pointer hover:bg-blue-50`}
                  onClick={() => handleOpenModal(noti)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {noti.isRead ? (
                      <FiCheckCircle className="h-6 w-6 text-gray-400" />
                    ) : (
                      <FiBell className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-md font-semibold ${noti.isRead ? 'text-gray-700' : 'text-blue-700'}`}>{noti.title || 'Thông báo'}</h2>
                      <span className="text-xs text-gray-400 ml-2">{new Date(noti.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-gray-600 text-sm line-clamp-2">{noti.message || noti.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal chi tiết thông báo */}
          {modalOpen && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={() => { setModalOpen(false); setSelected(null); setSelectedOrder(null); }}
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold mb-2 text-blue-700 flex items-center">
                  <FiBell className="mr-2" /> {selected.title || 'Thông báo'}
                </h2>
                <div className="mb-2 text-gray-600 text-sm">
                  <span className="font-medium">Thời gian:</span> {new Date(selected.createdAt).toLocaleString()}
                </div>
                {selectedOrder && (
                  <div className="mb-4 text-gray-800 text-sm">
                    <span className="font-medium">Địa chỉ giao hàng:</span> {selectedOrder.DeliveryAddress}
                  </div>
                )}
                <div className="mb-4 text-gray-800">
                  {selected.message || selected.content}
                </div>
                {/* Nếu là loại cần phản hồi thì hiển thị nút xác nhận/từ chối */}
                {(selected.type === 'order' || selected.type === 'suggest') && !selected.isRead && (
                  <div className="flex gap-4 mt-4">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center disabled:opacity-60"
                      onClick={() => handleAction('Confirmed', selected)}
                      disabled={actionLoading}
                    >
                      <FiCheckCircle className="mr-2" /> Xác nhận
                    </button>
                    <button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium flex items-center justify-center disabled:opacity-60"
                      onClick={() => handleAction('reject', selected)}
                      disabled={actionLoading}
                    >
                      <FiXCircle className="mr-2" /> Từ chối
                    </button>
                  </div>
                )}
                {actionError && <div className="text-red-600 mt-3 text-sm">{actionError}</div>}
                {actionSuccess && <div className="text-green-600 mt-3 text-sm">{actionSuccess}</div>}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoreNotification;