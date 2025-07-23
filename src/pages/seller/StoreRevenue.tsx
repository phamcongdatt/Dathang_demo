import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface RevenueStat {
  date: string;
  totalRevenue: number;
  totalOrders: number;
}

const storeId = 1; // TODO: Lấy từ router/query thực tế

const StoreRevenue: React.FC = () => {
  const [stats, setStats] = useState<RevenueStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://localhost:5118/api/Revenue/store/${storeId}/overview?range=${timeRange}`
        );
        if (!res.ok) throw new Error('Lỗi khi tải doanh thu');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [timeRange]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-600">Thống kê doanh thu cửa hàng</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-lg ${timeRange === 'week' ? 'bg-orange-500 text-white' : 'bg-white'}`}
            >
              Tuần
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-lg ${timeRange === 'month' ? 'bg-orange-500 text-white' : 'bg-white'}`}
            >
              Tháng
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 rounded-lg ${timeRange === 'year' ? 'bg-orange-500 text-white' : 'bg-white'}`}
            >
              Năm
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : stats.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
            Chưa có dữ liệu doanh thu trong khoảng thời gian này
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                      Số đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat) => (
                    <tr key={stat.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(stat.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{stat.totalOrders}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-orange-600">
                        {stat.totalRevenue.toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
              Tổng cộng: {stats.reduce((sum, stat) => sum + stat.totalRevenue, 0).toLocaleString('vi-VN')}₫
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StoreRevenue;