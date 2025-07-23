import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiCheckCircle, FiXCircle, FiClock, FiSearch, FiChevronDown, FiMoreVertical } from 'react-icons/fi';
// Đã loại bỏ import { motion } from 'framer-motion';

interface Store {
  id: string;
  name: string;
  sellerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  logo?: string;
}

const ManageStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('stores');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/stores`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
});
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Lỗi khi tải danh sách cửa hàng');
      }
      const data = await res.json();
      setStores(data);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/stores/${storeId}/approve`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(await res.text());
      setStores(stores.map(s => s.id === storeId ? { ...s, status: 'approved' } : s));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt cửa hàng');
    } finally {
      setDropdownOpen(null);
    }
  };

  const handleReject = async (storeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/stores/${storeId}/reject`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(await res.text());
      setStores(stores.map(s => s.id === storeId ? { ...s, status: 'rejected' } : s));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối cửa hàng');
    } finally {
      setDropdownOpen(null);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         store.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="mr-1" />;
      case 'rejected': return <FiXCircle className="mr-1" />;
      default: return <FiClock className="mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý cửa hàng</h1>
            <p className="text-gray-600 mt-1">Duyệt và quản lý các cửa hàng đăng ký</p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm cửa hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    className="appearance-none bg-white pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-xl shadow-sm animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FiXCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Đã xảy ra lỗi</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchStores}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Thử lại
              </button>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <FiSearch className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy cửa hàng</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || selectedStatus !== 'all' 
                  ? "Hãy thử thay đổi tiêu chí tìm kiếm" 
                  : "Hiện chưa có cửa hàng nào đăng ký"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cửa hàng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chủ sở hữu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đăng ký
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStores.map((store) => (
                      <tr 
                        key={store.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                              {store.logo ? (
                                <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-blue-600 font-medium text-sm">
                                  {store.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{store.name}</div>
                              <div className="text-sm text-gray-500">{store.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{store.sellerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{store.phone}</div>
                          <div className="text-sm text-gray-500">{store.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                              {getStatusIcon(store.status)}
                              {store.status.toLowerCase() === 'approved' ? 'Đã duyệt' : 
                               store.status.toLowerCase() === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(store.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {store.status === 'pending' ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(store.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <FiCheckCircle className="mr-1" /> Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(store.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FiXCircle className="mr-1" /> Từ chối
                              </button>
                            </div>
                          ) : (
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setDropdownOpen(dropdownOpen === store.id ? null : store.id)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                              >
                                <FiMoreVertical className="h-5 w-5" />
                              </button>
                              
                              {dropdownOpen === store.id && (
                                <div
                                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                >
                                  <div className="py-1">
                                    {store.status !== 'approved' && (
                                      <button
                                        onClick={() => handleApprove(store.id)}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      >
                                        <FiCheckCircle className="mr-2 text-green-500" />
                                        Duyệt cửa hàng
                                      </button>
                                    )}
                                    {store.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleReject(store.id)}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      >
                                        <FiXCircle className="mr-2 text-red-500" />
                                        Từ chối cửa hàng
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageStores;