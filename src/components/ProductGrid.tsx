import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  storeId: string; 
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
}
const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Menus/popular', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          throw new Error(`Lỗi khi tải sản phẩm: ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleNavigate = (id: number) => {
    try {
      navigate(`/order/${id}`);
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Lỗi khi chuyển trang. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 my-12 px-4 sm:px-6 lg:px-8">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-3xl shadow-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-12 text-center text-red-600 text-xl font-semibold bg-red-50 p-6 rounded-2xl shadow-md">
        {error}
        <button
          className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="my-12 text-center text-gray-600 text-xl font-medium bg-gray-100 p-6 rounded-2xl shadow-md">
        Không có sản phẩm nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 my-8 px-4">
      {products.slice(0, 8).map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center p-4 cursor-pointer group"
          onClick={() => navigate(`/product/${p.id}`)}
        >
          <div className="relative w-32 h-32 mb-3">
            <img
              src={p.imageUrl || 'https://source.unsplash.com/200x200/?food,meal'}
              alt={p.name}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="font-semibold text-gray-800 mb-1 text-center line-clamp-2">
            {p.name}
          </div>
          <div className="text-orange-500 font-bold mb-3">
            {p.price.toLocaleString()}₫
          </div>
          <button
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors group-hover:scale-105"
            onClick={e => {
              e.stopPropagation();
              navigate('/checkout', {
                state: {
                  items: [{
                    menuId: p.id,
                    quantity: 1,
                    name: p.name,
                    price: p.price,
                    storeId: p.storeId,
                  }],
                },
              });
            }}
          >
            Mua ngay
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;