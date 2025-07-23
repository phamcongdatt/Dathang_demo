import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface ReviewItem {
  id: number;
  menuName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const storeId = 1; // TODO: Lấy từ router/query thực tế

const StoreReview: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5118/api/Review/store/${storeId}`);
        if (!res.ok) throw new Error('Lỗi khi tải đánh giá');
        const data = await res.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Đánh giá của khách hàng</h1>
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_,i)=>(<div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : items.length === 0 ? (
          <div className="my-6">Chưa có đánh giá nào.</div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                <div className="font-semibold text-gray-800 mb-1">{item.menuName}</div>
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_,i)=>(<span key={i} className={i < item.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>))}
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-600 text-sm">{item.comment}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StoreReview; 