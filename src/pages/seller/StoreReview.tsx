import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { jwtDecode } from 'jwt-decode';
import { s } from 'framer-motion/dist/types.d-Bq-Qm38R';

interface ReviewItem {
  id: number;
  menuName: string;
  storeName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
}

interface JwtPayload {
  sub?: string;
  [key: string]: any;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
}

const StoreReview: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        if (!token) throw new Error('Không tìm thấy token xác thực');

        const decodedToken = jwtDecode<JwtPayload>(token);
        console.log('Decoded Token:', decodedToken);
        const customerId = decodedToken.sub || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        if (!customerId) throw new Error('Không tìm thấy CustomerId trong token');

        console.log('CustomerId:', customerId);
        const response = await fetch(`http://localhost:5118/api/Review/store/${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Không thể tải đánh giá: ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result); 
        const data = Array.isArray(result) ? result : (result.data || []); 
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          menuName: item.menuId ? item.storeName : 'N/A',
          storeName: item.storeName,
          rating: item.rating,
          comment: item.comment,
          imageUrls: item.imageUrls || [],
          createdAt: item.createdAt,
        }));
        setItems(formattedItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);


  const handleGetReviewsByStore = async (storeId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`http://localhost:5118/api/Review/store/${storeId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xóa đánh giá thất bại: ${errorText}`);
      }

      setItems(items.filter(item => item.id !== storeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa đánh giá thất bại');
    }
  };
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
