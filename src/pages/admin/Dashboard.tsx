import React, { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiCoffee, FiPackage, FiDollarSign, FiBell } from 'react-icons/fi';
import { AiOutlineDashboard } from 'react-icons/ai';
import Sidebar from '../../components/Sidebar';

interface StatCardProps {
  icon: React.ReactElement<{ className?: string }>;
  value: number | string;
  label: string;
  color: string;
  trend?: number;
}

interface ApiResponse {
  users?: any[];
  stores?: any[];
  menus?: any[];
  orders?: any[];
  revenue?: number;
  notifications?: any[];
  growthRate?: number;
  recentActivities?: any[];
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, trend }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow`}>
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        {React.cloneElement(icon, { className: `text-${color}-500 text-xl` })}
      </div>
      {trend !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    menus: 0,
    orders: 0,
    revenue: 0,
    notifications: 0,
    growthRate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5118/api/admin/dashboard-stats', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats({
          users: data.users,
          stores: data.stores,
          menus: data.menus,
          orders: data.orders,
          revenue: data.revenue,
          notifications: 0, // Nếu có API cho notifications thì lấy luôn
          growthRate: 0     // Nếu có API cho growthRate thì lấy luôn
        });
        // Process recent activities from API or create default if not provided
        const activities = data.recentActivities || [
          { id: 1, action: 'New user registered', time: 'Just now', icon: <FiUsers /> },
          { id: 2, action: 'System initialized', time: 'Just now', icon: <FiBell /> }
        ];
        
        setRecentActivities(activities);
        
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <AiOutlineDashboard className="mr-2" /> Dashboard
                </h1>
                <p className="text-gray-600">Overview of your platform</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Export
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Generate Report
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <StatCard 
                    icon={<FiUsers />} 
                    value={stats.users} 
                        label="Người dùng" 
                    color="blue" 
                    trend={stats.growthRate} 
                  />
                  <StatCard 
                    icon={<FiShoppingBag />} 
                    value={stats.stores} 
                    label=" Cửa hàng đẫ kích hoạt" 
                    color="orange" 
                    trend={stats.growthRate} 
                  />
                  <StatCard 
                    icon={<FiCoffee />} 
                    value={stats.menus} 
                    label="Sản phẩm" 
                    color="green" 
                    trend={stats.growthRate} 
                  />
                  <StatCard 
                    icon={<FiDollarSign />} 
                    value={stats.revenue.toLocaleString() + '₫'} 
                        label="Tổng doanh thu" 
                    color="purple" 
                    trend={stats.growthRate} 
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-800">Revenue Overview</h3>
                      <select className="text-sm border border-gray-200 rounded px-3 py-1 bg-white">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                      </select>
                    </div>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                      [Revenue Chart Placeholder]
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                      {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-3 text-blue-500">
                            {activity.icon || <FiBell />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;