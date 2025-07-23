import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import UserOrders from './UserOrders';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  isLocked: boolean;
  avatarUrl?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Format date utility
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập để xem thông tin cá nhân');
          window.location.href = '/login';
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5118/api/Auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (res.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
          localStorage.removeItem('token');
          return;
        }
        
        if (!res.ok) throw new Error('Lỗi khi tải thông tin cá nhân');
        
        const responseData = await res.json();
        if (responseData.success && responseData.data) {
          setProfile(responseData.data);
          setFormData({
            fullName: responseData.data.fullName,
            phoneNumber: responseData.data.phoneNumber || ''
          });
        } else {
          setError(responseData.message || 'Không thể lấy thông tin cá nhân');
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const res = await fetch('http://localhost:5118/api/Auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (res.ok) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  // Form validation
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setUpdateError('Vui lòng nhập họ tên');
      return false;
    }
    if (formData.phoneNumber && !/^\d{10,11}$/.test(formData.phoneNumber)) {
      setUpdateError('Số điện thoại không hợp lệ');
      return false;
    }
    return true;
  };

  // Validate password form
  const validatePasswordForm = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Vui lòng nhập đầy đủ mật khẩu');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  // Update profile handler
  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError('Vui lòng đăng nhập lại');
        return;
      }

      const res = await fetch('http://localhost:5118/api/Auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        setUpdateError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        return;
      }

      const responseData = await res.json();
      if (responseData.success) {
        if (profile) {
          setProfile({
            ...profile,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber
          });
        }
        setIsEditing(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setUpdateError(responseData.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Vui lòng đăng nhập lại');
        return;
      }

      const res = await fetch('http://localhost:5118/api/Auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const responseData = await res.json();
      if (responseData.success) {
        setPasswordSuccess(true);
        setPasswordError('');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setPasswordSuccess(false);
          setShowPasswordChange(false);
        }, 3000);
      } else {
        setPasswordError(responseData.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber || ''
      });
    }
    setIsEditing(false);
    setUpdateError('');
    setShowPasswordChange(false);
  };

  // Handle avatar change
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5118/api/Auth/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const responseData = await res.json();
      if (responseData.success) {
        setProfile({ ...profile, avatarUrl: responseData.data.avatarUrl });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-center">
        <div className="h-32 w-32 rounded-full bg-gray-200"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Profile Header */}
          

            {loading ? (
              <div className="p-6">
                <LoadingSkeleton />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : !profile ? (
              <div className="p-6 text-center text-gray-500">
                Không có thông tin cá nhân.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Avatar and Basic Info Section */}
                <div className="px-6 py-8 sm:flex sm:items-center sm:space-x-6">
                  <div className="relative group mx-auto sm:mx-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                      <img
                        src={profile.avatarUrl || "https://source.unsplash.com/300x300/?portrait"}
                        alt={profile.fullName}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {profile.role}
                      </span>
                      {profile.isLocked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đang hoạt động
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Tham gia từ {formatDate(profile.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Success Messages */}
                {updateSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">Cập nhật thông tin thành công!</p>
                      </div>
                    </div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">Đổi mật khẩu thành công!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Profile Form */}
                {isEditing ? (
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cập nhật thông tin cá nhân</h3>
                    
                    {updateError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{updateError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0987654321"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={updateLoading}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          disabled={updateLoading || !formData.fullName.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {updateLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang lưu...
                            </>
                          ) : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : showPasswordChange ? (
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thay đổi mật khẩu</h3>
                    
                    {passwordError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{passwordError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={passwordLoading}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {passwordLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang xử lý...
                            </>
                          ) : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Profile Details Section */}
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
                          <dl className="space-y-4">
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Họ tên
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {profile.fullName}
                              </dd>
                            </div>
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Email
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {profile.email}
                              </dd>
                            </div>
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Số điện thoại
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {profile.phoneNumber || 'Chưa cập nhật'}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài khoản</h3>
                          <dl className="space-y-4">
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Vai trò
                              </dt>
                              <dd className="text-sm text-gray-900 capitalize">
                                {profile.role}
                              </dd>
                            </div>
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Trạng thái
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {profile.isLocked ? (
                                  <span className="text-red-600">Đã khóa</span>
                                ) : (
                                  <span className="text-green-600">Đang hoạt động</span>
                                )}
                              </dd>
                            </div>
                            <div className="sm:flex sm:space-x-4">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Ngày tạo
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {formatDate(profile.createdAt)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                     {!loading && !error && profile && (
                            <UserOrders />
                          )}
                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Cập nhật thông tin
                      </button>
                      <button 
                        onClick={() => setShowPasswordChange(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Đổi mật khẩu
                      </button>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Đăng xuất
                      </button>
                    <div> 

                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Orders Section */}
        
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;