import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiImage, FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';

interface Store {
  id: string;
  name: string;
}

interface Menu {
  id: string;
  name: string;
  price: number;
  status: string;
  imageUrl?: string;
  description?: string;
}

const StoreMenus: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
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
        if (data.length > 0) setSelectedStore(data[0].id);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      }
    };
    fetchStores();
  }, [navigate]);

  // Fetch menus when store changes - Sử dụng endpoint mới để lấy tất cả sản phẩm
  useEffect(() => {
    if (!selectedStore) return;
    
    const fetchMenus = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5118/api/menus/all?storeId=${selectedStore}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
        
        const data = await res.json();
        setMenus(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, [selectedStore]);

  const handleDeleteMenu = async (menuId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Xóa sản phẩm thất bại');
      
      setMenus(menus.filter(menu => menu.id !== menuId));
      setSuccess('Xóa sản phẩm thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuStatus = async (menuId: string, currentStatus: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
      
      const res = await fetch(`http://localhost:5118/api/menus/${menuId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Thay đổi trạng thái thất bại');

      setMenus(menus.map(menu => 
        menu.id === menuId ? { ...menu, status: newStatus } : menu
      ));
      setSuccess(`Đã ${newStatus === 'Available' ? 'kích hoạt' : 'tạm ngừng'} sản phẩm`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="mt-2 text-gray-600">Xem và quản lý tất cả sản phẩm của cửa hàng</p>
          </div>

          {/* Store selection and actions */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Cửa hàng:</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                >
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => navigate(`/seller/menus/add?storeId=${selectedStore}`)}
                disabled={!selectedStore}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FiPlus className="mr-2" />
                Thêm sản phẩm mới
              </button>
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <FiX />
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <FiCheck className="mr-2" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
                <FiX />
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && menus.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Không có sản phẩm nào</h3>
              <p className="mt-1 text-sm text-gray-500">Bạn chưa có sản phẩm nào trong cửa hàng.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/seller/menus/add?storeId=${selectedStore}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" />
                  Thêm sản phẩm mới
                </button>
              </div>
            </div>
          )}

          {/* Menu list */}
          {!loading && !error && menus.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menus.map((menu) => (
                      <tr key={menu.id} className={menu.status === 'Unavailable' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {menu.imageUrl ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={menu.imageUrl} alt={menu.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FiImage className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${menu.status === 'Unavailable' ? 'text-gray-400' : 'text-gray-900'}`}>
                                {menu.name}
                              </div>
                              {menu.description && (
                                <div className={`text-sm truncate max-w-xs ${menu.status === 'Unavailable' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {menu.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${menu.status === 'Unavailable' ? 'text-gray-400' : 'text-gray-900'}`}>
                          {menu.price.toLocaleString()}₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            menu.status === 'Available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {menu.status === 'Available' ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => navigate(`/seller/menus/edit/${menu.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh sửa"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => toggleMenuStatus(menu.id, menu.status)}
                              className={menu.status === 'Available' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                              title={menu.status === 'Available' ? 'Tạm ngừng bán' : 'Kích hoạt bán'}
                            >
                              {menu.status === 'Available' ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StoreMenus;