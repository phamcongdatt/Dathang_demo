import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Wishlist');
        if (!res.ok) throw new Error('Lỗi khi tải danh sách yêu thích');
        const data = await res.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Sản phẩm yêu thích</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_,i)=>(<div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : items.length === 0 ? (
          <div className="my-6">Bạn chưa có sản phẩm yêu thích nào.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.slice(0, 12).map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center p-4 cursor-pointer"
              >
                <img src={item.imageUrl || 'https://source.unsplash.com/200x200/?food,meal'} alt={item.name} className="w-28 h-28 object-cover rounded mb-2" />
                <div className="font-medium text-gray-800 mb-1 text-center">{item.name}</div>
                <div className="text-orange-500 font-bold mb-2">{item.price.toLocaleString()}₫</div>
                <button className="bg-red-500 text-white px-4 py-1 rounded-full text-sm hover:bg-red-600">Bỏ yêu thích</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist; 