import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { jwtDecode } from 'jwt-decode';

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

const Review: React.FC = () => {
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
        const response = await fetch(`http://localhost:5118/api/Review/customer/${customerId}`, {
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
        console.log('API Response:', result); // Kiểm tra cấu trúc dữ liệu
        const data = Array.isArray(result) ? result : (result.data || []); // Xử lý nếu data nằm trong key 'data'
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

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`http://localhost:5118/api/Review/Delete/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xóa đánh giá thất bại: ${errorText}`);
      }

      setItems(items.filter(item => item.id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa đánh giá thất bại');
    }
  };

  const handleEdit = (review: ReviewItem) => {
    setEditingId(review.id);
    setEditComment(review.comment);
  };

  const handleUpdate = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`http://localhost:5118/api/Review/Update/${reviewId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: editComment }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cập nhật đánh giá thất bại: ${errorText}`);
      }

      setItems(items.map(item =>
        item.id === reviewId ? { ...item, comment: editComment } : item
      ));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật đánh giá thất bại');
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đánh giá của bạn</h1>
          <p className="text-gray-600">Xem và quản lý các đánh giá bạn đã đăng</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
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
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có đánh giá</h3>
            <p className="mt-1 text-gray-500">Bạn chưa đánh giá món ăn nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.menuName || item.storeName}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        {renderRatingStars(item.rating)}
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Xóa
                      </button>
                    </div>
                  </div>

                  {editingId === item.id ? (
                    <div className="mt-4">
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-600">{item.comment}</p>
                  )}
                  {item.imageUrls.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                      {item.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt="Review" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Review;