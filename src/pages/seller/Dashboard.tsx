import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import * as signalR from '@microsoft/signalr';
import { FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiPackage, FiStar, FiBell, FiGrid, FiLayers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Store {
  id: string;
  name: string;
  status: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  isLocked: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState<number>(0);
  const [orders, setOrders] = useState<number>(0);
  const [reviews, setReviews] = useState<number>(0);
  const [notifications, setNotifications] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount,setCategoryCount] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profileRes = await fetch('http://localhost:5118/api/Auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileRes.status === 401) {
          navigate('/login');
          return;
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.data) {
            setUserProfile(profileData.data);
          }
        }

        const storesRes = await fetch('http://localhost:5118/api/Stores/mystores', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (storesRes.status === 401) {
          navigate('/login');
          return;
        }

        if (!storesRes.ok) {
          throw new Error('Lỗi khi tải danh sách gian hàng');
        }

        const storesData = await storesRes.json();
        setStores(storesData);

        if (storesData.length === 0) {
          setError('Bạn chưa có gian hàng nào. Hãy đăng ký gian hàng trước.');
          setLoading(false);
          return;
        }

        const approvedStores = storesData.filter((store: Store) => store.status === 'Approved');

        if (approvedStores.length === 0) {
          setError('Gian hàng của bạn đang chờ admin duyệt. Vui lòng chờ trong 24-48 giờ.');
          setLoading(false);
          return;
        }

        const firstStore = approvedStores[0];
        const storeId = firstStore.id;

        const [revenueRes, ordersRes, reviewsRes, notiRes, revenueChartRes] = await Promise.all([
          fetch(`http://localhost:5118/api/Revenue/store/${storeId}/overview`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`http://localhost:5118/api/Orders/store/${storeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`http://localhost:5118/api/Review/store/${storeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:5118/api/Notification', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`http://localhost:5118/api/Revenue/store/${storeId}/chart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        let revenueTotal = 0;
        let ordersCount = 0;
        let reviewsCount = 0;
        let notificationsCount = 0;

        if (revenueRes.ok) {
          const revenueData = await revenueRes.json();
          revenueTotal = Array.isArray(revenueData) ? revenueData.reduce((sum: number, r: any) => sum + (r.totalRevenue || 0), 0) : 0;
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          ordersCount = Array.isArray(ordersData) ? ordersData.length : 0;
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          reviewsCount = Array.isArray(reviewsData) ? reviewsData.length : 0;
        }

        if (notiRes.ok) {
          const notiData = await notiRes.json();
          notificationsCount = Array.isArray(notiData) ? notiData.length : 0;
        }

        if (revenueChartRes.ok) {
          const chartData = await revenueChartRes.json();
          setRevenueData(Array.isArray(chartData) ? chartData : []);
        }

        setRevenue(revenueTotal);
        setOrders(ordersCount);
        setReviews(reviewsCount);
        setNotifications(notificationsCount);

        try {
          const menuRes = await fetch(`http://localhost:5118/api/Menus/bystore/${storeId}`);
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            setProductCount(Array.isArray(menuData) ? menuData.length : 0);
          } else {
            setProductCount(0);
          }
        } catch {
          setProductCount(0);
        }

      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5118/notificationHub', {
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.start()
      .then(() => {
        console.log('SignalR Connected to notificationHub');
        connection.on('StoreApproved', (storeId) => {
          console.log('StoreApproved event received:', storeId);
          fetchData();
        });
      })
      .catch((err) => {
        console.error('SignalR Connection Error:', err);
      });

    connection.onclose((error) => {
      console.error('Connection closed:', error);
    });

    return () => {
      connection.stop();
    };
  }, [navigate]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1" /> Đã duyệt
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1" /> Đang chờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiAlertCircle className="mr-1" /> Từ chối
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tổng quan về hoạt động gian hàng của bạn
            </p>
          </div>

          {/* User and Store Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin cá nhân</h3>
                <div className="mt-4">
                  {userProfile ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tên:</span> {userProfile.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {userProfile.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Vai trò:</span> {userProfile.role === 'Seller' ? 'Người bán' : 'Đang chờ duyệt'}
                      </p>
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin gian hàng</h3>
                <div className="mt-4">
                  {stores.length > 0 ? (
                    <div className="space-y-3">
                      {stores.map((store) => (
                        <div key={store.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-800">{store.name}</h4>
                            {renderStatusBadge(store.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {store.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Bạn chưa có gian hàng nào</p>
                      <button
                        onClick={() => navigate('/register-store')}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Đăng ký gian hàng mới
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 animate-pulse rounded-lg shadow-md"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FiAlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
                <div className="mt-6">
                  {error.includes('chưa có gian hàng') && (
                    <button
                      onClick={() => navigate('/register-store')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Đăng ký gian hàng
                    </button>
                  )}
                  {error.includes('đang chờ admin duyệt') && (
                    <button
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Xem trang cá nhân
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate('/seller/revenue')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <FiDollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">Tổng doanh thu</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {revenue.toLocaleString()}₫
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate('/seller/StoreOrders')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <FiPackage className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">Tổng đơn hàng</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {orders}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate('/seller/reviews')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <FiStar className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">Đánh giá</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {reviews}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate('/seller/store-notification')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <FiBell className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">Thông báo</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {notifications}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats and Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer col-span-2"
                  onClick={() => navigate('/seller/store-menus')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                          <FiGrid className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5">
                          <dt className="text-sm font-medium text-gray-500">Sản phẩm</dt>
                          <dd className="text-2xl font-semibold text-gray-900">
                            {productCount}
                          </dd>
                        </div>
                      </div>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/seller/add-menu');
                        }}
                      >
                        Thêm mới
                      </button>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate('/seller/store-category')}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                        <FiLayers className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Danh mục</dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {categoryCount} {/* Thay bằng số danh mục thực tế nếu có */}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Biểu đồ doanh thu 7 ngày gần nhất</h3>
                  <div className="h-80">
                    {revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any ) => [`${value}₫`, 'Doanh thu']}
                            labelFormatter={(label : any) => `Ngày: ${label}`}
                          />
                          <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Không có dữ liệu doanh thu để hiển thị</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;