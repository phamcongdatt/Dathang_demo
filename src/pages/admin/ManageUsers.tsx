import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiLock, FiUnlock, FiUser, FiMail, FiShield, FiRefreshCw, FiAlertCircle, FiSearch, FiChevronDown, FiMoreVertical } from 'react-icons/fi';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isLocked?: boolean;
  createdAt?: string;
  avatar?: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5118/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
});
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to load users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5118/api/admin/users/${userId}/lock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (err) {
      console.error('Failed to lock user:', err);
    } finally {
      setDropdownOpen(null);
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5118/api/admin/users/${userId}/unlock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to unlock user:', err);
    } finally {
      setDropdownOpen(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'locked' ? user.isLocked : !user.isLocked);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Seller': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isLocked?: boolean) => {
    return isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả tài khoản người dùng hệ thống</p>
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
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <select
                    className="appearance-none bg-white pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="Admin">Quản trị viên</option>
                    <option value="Seller">Người bán</option>
                    <option value="User">Người dùng</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none bg-white pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="locked">Đã khóa</option>
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
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Đã xảy ra lỗi</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiRefreshCw className="mr-2" /> Thử lại
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <FiUser className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy người dùng</h3>
              <p className="mt-2 text-sm text-gray-500">
                Hãy thử thay đổi tiêu chí tìm kiếm của bạn
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tham gia
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
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <FiUser className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role === 'Admin' ? 'Quản trị viên' : 
                             user.role === 'Seller' ? 'Người bán' : 'Người dùng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isLocked)}`}>
                            {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                              <FiMoreVertical className="h-5 w-5" />
                            </button>
                            
                            {dropdownOpen === user.id && (
                              <div
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                              >
                                <div className="py-1">
                                  {user.isLocked ? (
                                    <button
                                      onClick={() => handleUnlockUser(user.id)}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <FiUnlock className="mr-2 text-green-500" />
                                      Mở khóa tài khoản
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleLockUser(user.id)}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <FiLock className="mr-2 text-red-500" />
                                      Khóa tài khoản
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
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

export default ManageUsers;