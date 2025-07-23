import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

interface Store {
  id: number;
  name: string;
  address: string;
  imageUrl?: string;
  status?: string;
}

const MyStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await fetch('http://localhost:5118/api/Stores/mystores', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Lỗi khi tải cửa hàng của bạn');
        const data = await res.json();
        setStores(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [navigate]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col"
    onClick={() => navigate('/seller/dashboard')}
    >
      
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-6 border-b-2 border-teal-100 pb-4">
            Cửa hàng của bạn
          </h1>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-60 bg-gray-200 animate-pulse rounded-xl shadow-md"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg shadow-md text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center text-gray-600">
              Bạn chưa có cửa hàng nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 flex flex-col items-center p-4 cursor-pointer hover:-translate-y-2"
                >
                  <img
                    src={store.imageUrl || 'https://source.unsplash.com/200x200/?store,food'}
                    alt={store.name}
                    className="w-36 h-36 object-cover rounded-lg mb-3"
                  />
                  <div className="font-semibold text-gray-800 text-center mb-1 line-clamp-1">
                    {store.name}
                  </div>
                  <div className="text-gray-600 text-sm text-center mb-2 line-clamp-2">
                    {store.address}
                  </div>
                  {store.status && (
                    <div className="text-xs text-green-600 mb-2">Trạng thái: {store.status}</div>
                  )}
                  <button className="bg-teal-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-600 transition-colors duration-200"
                  >
                    Quản lý
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyStores;