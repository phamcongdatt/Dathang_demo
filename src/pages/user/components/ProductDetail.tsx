import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useCart } from '../../../context/CartContext';

interface Product {
  id: string;
  storeId: string; // Thêm storeId
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { refreshCartCount } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'COD'>('COD');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5118/api/Menus/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('Phản hồi từ server (fetchProduct):', text);
          throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Dữ liệu sản phẩm không hợp lệ');
        }
        setProduct({
          id: data.id,
          storeId: data.storeId, // Lấy storeId từ response
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          description: data.description,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
        });
      } catch (err: any) {
        console.error('Lỗi fetch sản phẩm:', err);
        setError(err.message || 'Không thể tải thông tin sản phẩm. Vui lòng kiểm tra server tại http://localhost:5118.');
      }
    };

    const fetchSuggestedProducts = async () => {
      try {
        const res = await fetch('http://localhost:5118/api/Menus/popular', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('Phản hồi từ server (fetchSuggestedProducts):', text);
          throw new Error(`Lỗi HTTP: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.data;
        if (!Array.isArray(products)) {
          throw new Error('Dữ liệu sản phẩm đề xuất không phải mảng');
        }
        setSuggestedProducts(
          products
            .filter((p: Product) => String(p.id) !== String(id) && (!product?.categoryName || p.categoryName === product.categoryName))
            .slice(0, 8)
        );
      } catch (err: any) {
        console.error('Lỗi fetch sản phẩm đề xuất:', err);
        setError(`Không thể tải sản phẩm tương tự. Vui lòng kiểm tra server tại http://localhost:5118. Chi tiết: ${err.message}`);
      }
    };

    if (id) {
      Promise.all([fetchProduct(), fetchSuggestedProducts()]).finally(() => setLoading(false));
    } else {
      setError('ID sản phẩm không hợp lệ');
      setLoading(false);
    }
  }, [id, product?.categoryName]);

  const handleNavigate = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Chuyển trang tới: ${path}`);
    try {
      navigate(path);
    } catch (err) {
      console.error('Lỗi navigation:', err);
      setError('Không thể chuyển trang. Vui lòng thử lại.');
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:5118/api/Cart/add-item', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuId: product?.id, quantity: 1, note: '' }),
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      if (!res.ok) {
        let errorMsg = 'Lỗi khi thêm vào giỏ hàng';
        try {
          const data = await res.json();
          console.error('Lỗi thêm vào giỏ hàng, response:', data);
          if (data.errors && data.errors.Note) {
            errorMsg = 'Trường Note là bắt buộc.';
          } else {
            errorMsg = data.title || errorMsg;
          }
        } catch {
          const text = await res.text();
          console.error('Lỗi thêm vào giỏ hàng, response text:', text);
        }
        throw new Error(errorMsg);
      }
      await refreshCartCount();
      setSuccessMessage('Đã thêm vào giỏ hàng!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    setShowPaymentModal(true); // Mở modal để chọn phương thức thanh toán
  };

  const confirmBuyNow = async () => {
    if (!product) return;
    setBuyLoading(true);
    setBuyError('');
    try {
      // Chuyển hướng sang trang checkout với thông tin đầy đủ, bao gồm storeId
      navigate('/checkout', {
        state: {
          items: [{
            menuId: product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            storeId: product.storeId, // Truyền storeId
          }],
          paymentMethod: paymentMethod,
        },
      });
    } catch (err: any) {
      setBuyError('Không thể chuyển đến trang thanh toán. Vui lòng thử lại.');
    } finally {
      setBuyLoading(false);
      setShowPaymentModal(false); // Đóng modal sau khi xử lý
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 h-64 bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl" />
              <div className="w-full md:w-1/2 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded-full w-1/3" />
              </div>
            </div>
            <div className="mt-8">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="flex gap-3 overflow-x-auto pb-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-60 w-40 bg-gray-200 rounded-xl flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 rounded-2xl shadow-lg p-8 text-center text-red-600 text-lg font-semibold animate-fade-in">
            {error}
            <div className="mt-4 flex gap-3 justify-center">
              <button
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
              <button
                className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300"
                onClick={(e) => handleNavigate('/', e)}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-100 rounded-2xl shadow-lg p-8 text-center text-gray-600 text-lg font-semibold animate-fade-in">
            Không tìm thấy sản phẩm.
            <button
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md"
              onClick={(e) => handleNavigate('/', e)}
            >
              Về trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {successMessage}
          </div>
        )}
        <div
          className="fixed inset-0 bg-[url('https://source.unsplash.com/1600x900/?food,pattern')] bg-cover bg-center opacity-10 z-0"
          style={{ transform: `translateY(${window.scrollY * 0.3}px)` }}
        />
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 relative overflow-hidden z-10 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-red-100/30 opacity-50 transition-opacity duration-500" />
          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative group">
                <img
                  src={product.imageUrl || 'https://source.unsplash.com/300x300/?food,meal'}
                  alt={product.name}
                  className="w-full max-w-[300px] h-auto object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce-in">
                  -20%
                </div>
                <div className="absolute bottom-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-in">
                  Hot
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-3 animate-slide-in-right tracking-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.377 2.45a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.377-2.45a1 1 0 00-1.175 0l-3.377 2.45c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.734 9.397c-.784-.57-.381-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm font-medium">(4.8 - 1.2k)</span>
                  <span className="text-gray-600 text-sm font-medium">Đã bán: 2.5k</span>
                </div>
                <p className="text-gray-700 text-sm md:text-base mb-4 leading-relaxed line-clamp-3">
                  {product.description || 'Món ăn được chế biến từ nguyên liệu tươi sạch, đảm bảo chất lượng và mang lại trải nghiệm ẩm thực tuyệt vời.'}
                </p>
                <div className="text-xl md:text-2xl font-bold text-orange-600 mb-4">
                  {product.price.toLocaleString()}₫
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-gray-600 text-sm font-medium">Danh mục: {product.categoryName || 'Ẩm thực'}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold text-base hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-md"
                  onClick={handleBuyNow}
                  aria-label={`Mua ${product.name}`}
                >
                  Mua ngay
                </button>
                <button
                  className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full font-semibold text-base hover:bg-orange-50 hover:border-orange-600 transition-all duration-300"
                  onClick={handleAddToCart}
                  aria-label={`Thêm ${product.name} vào giỏ hàng`}
                >
                  Thêm vào giỏ
                </button>
                {successMessage && (
                  <div className="ml-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold shadow animate-fade-in">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {suggestedProducts.length > 0 && (
          <div className="mt-8 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-orange-600 animate-slide-in-left tracking-tight">
                Sản phẩm tương tự
              </h3>
              <a
                href="/products"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-2"
                onClick={(e) => handleNavigate('/products', e)}
              >
                Xem tất cả <span className="text-base">→</span>
              </a>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100">
              {suggestedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col items-center p-4 cursor-pointer group relative overflow-hidden snap-center w-40 flex-shrink-0"
                  onClick={(e) => handleNavigate(`/product/${p.id}`, e)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  <div className="relative w-24 h-24 mb-3">
                    <img
                      src={p.imageUrl || 'https://source.unsplash.com/150x150/?food,meal'}
                      alt={p.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-in">
                      -15%
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 mb-2 text-center line-clamp-2 text-sm">
                    {p.name}
                  </div>
                  <div className="text-orange-600 font-bold text-sm mb-3">
                    {p.price.toLocaleString()}₫
                  </div>
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce-in">
                    Hot
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modal chọn phương thức thanh toán */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setShowPaymentModal(false)}>×</button>
            <h3 className="text-lg font-bold mb-4 text-orange-600 text-center">Chọn phương thức thanh toán</h3>
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                Thanh toán khi nhận hàng (COD)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="Online" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} />
                Thanh toán Online (VNPAY)
              </label>
            </div>
            {buyError && <div className="text-red-500 mb-2 text-center">{buyError}</div>}
            <button
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 mt-2"
              onClick={confirmBuyNow}
              disabled={buyLoading}
            >
              {buyLoading ? 'Đang xử lý...' : 'Xác nhận mua hàng'}
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;