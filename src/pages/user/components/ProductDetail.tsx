import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useCart } from '../../../context/CartContext';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaStore, FaShareAlt, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { RiCouponLine } from 'react-icons/ri';
import { BsShieldCheck, BsTruck } from 'react-icons/bs';

interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  stock?: number;
  sold?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
}

interface ReviewItem {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
  variant?: string;
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
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlist, setIsWishlist] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState('');

  // Đảm bảo thứ tự khai báo các hàm
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await fetch(`http://localhost:5118/api/Review/menu/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể tải đánh giá: ${errorText}`);
      }
      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      const formattedItems = data.map((item: any) => ({
        id: item.id,
        userName: item.userName || 'Người dùng ẩn danh',
        rating: item.rating,
        comment: item.comment,
        imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
        createdAt: item.createdAt,
        userAvatar: 'https://source.unsplash.com/random/100x100/?user',
        variant: ['Loại đặc biệt', 'Loại thường', 'Combo'][Math.floor(Math.random() * 3)],
      }));
      setReviews(formattedItems);
      const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      formattedItems.forEach((item: ReviewItem) => {
        stats[item.rating as keyof typeof stats]++;
      });
      setReviewStats(stats);
    } catch (err: any) {
      console.error('Fetch reviews error:', err);
    }
  };

  const checkCanReview = async () => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    try {
      const res = await fetch(`http://localhost:5118/api/Orders/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
    } catch (err) {
      console.error('Check review permission error:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;
    setReviewSubmitting(true);
    setReviewSubmitError('');
    setReviewSubmitSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để đánh giá.');
      }
      const formData = new FormData();
      formData.append('menuId', id);
      formData.append('rating', reviewRating.toString());
      formData.append('comment', reviewComment);
      for (let i = 0; i < reviewImages.length; i++) {
        formData.append('imageUrls', reviewImages[i]);
      }
      const res = await fetch('http://localhost:5118/api/Review/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.status === 401) {
        throw new Error('Đăng nhập để đánh giá.');
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.title || 'Lỗi khi đánh giá sản phẩm.');
      }
      setReviewRating(0);
      setReviewComment('');
      setReviewImages([]);
      setReviewSubmitting(false);
      setReviewSubmitSuccess('Đánh giá của bạn đã được gửi thành công!');
      await fetchReviews();
      await checkCanReview();
    } catch (err: any) {
      setReviewSubmitting(false);
      setReviewSubmitError(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  // Hàm thêm sản phẩm vào wishlist
  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5118/api/Wishlist/AddTowishlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuId: id, // Gửi menuId từ product
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi khi thêm vào danh sách yêu thích: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        setIsWishlist(true);
        setSuccessMessage('Đã thêm vào danh sách yêu thích!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Thêm vào danh sách yêu thích thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể thêm vào danh sách yêu thích. Vui lòng thử lại.');
    }
  };

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
          console.error('Server response:', text);
          throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid product data');
        }
        
        setProduct({
          id: data.id,
          storeId: data.storeId,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl,
          description: data.description,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          originalPrice: data.price * 1.2,
          discount: 20,
          stock: 100,
          sold: 1250,
          rating: 4.7,
          reviewCount: 342,
          images: data.imageUrl ? [data.imageUrl] : ['https://source.unsplash.com/random/600x600/?food'],
        });
      } catch (err: any) {
        console.error('Fetch product error:', err);
        setError(err.message || 'Không thể tải thông tin sản phẩm. Vui lòng kiểm tra máy chủ tại http://localhost:5118.');
      } finally {
        setLoading(false);
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
          console.error('Server response:', text);
          throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.data;
        
        if (!Array.isArray(products)) {
          throw new Error('Suggested products data is not an array');
        }
        
        setSuggestedProducts(
          products
            .filter((p: Product) => String(p.id) !== String(id))
            .slice(0, 8)
            .map(p => ({
              ...p,
              originalPrice: p.price * 1.15,
              discount: 15,
              sold: Math.floor(Math.random() * 1000) + 100,
              rating: (Math.random() * 1 + 4).toFixed(1),
            }))
        );
      } catch (err: any) {
        console.error('Fetch suggested products error:', err);
      }
    };

    if (id) {
      fetchProduct();
      fetchSuggestedProducts();
      fetchReviews();
      checkCanReview();
    } else {
      setError('ID sản phẩm không hợp lệ');
      setLoading(false);
    }
  }, [id]);

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
        body: JSON.stringify({ 
          menuId: product?.id, 
          quantity: quantity, 
          note: '' 
        }),
      });
      
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      
      if (!res.ok) {
        let errorMsg = 'Lỗi khi thêm vào giỏ hàng';
        try {
          const data = await res.json();
          errorMsg = data.title || errorMsg;
        } catch {
          const text = await res.text();
          console.error('Error response:', text);
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
    setShowPaymentModal(true);
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  const handlePrevImage = () => {
    const imagesLength = product?.images?.length ?? 0;
    if (imagesLength > 0) {
      setSelectedImage(prev => (prev === 0 ? imagesLength - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    const imagesLength = product?.images?.length ?? 0;
    if (imagesLength > 0) {
      setSelectedImage(prev => (prev === imagesLength - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white py-2 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="hover:text-orange-500 cursor-pointer">Trang chủ</span>
            <span className="mx-2">/</span>
            <span className="hover:text-orange-500 cursor-pointer">{product?.categoryName || 'Danh mục'}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-400 truncate max-w-xs">{product?.name}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/5 h-96 bg-gray-200 rounded-lg"></div>
              <div className="w-full md:w-3/5 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : product ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 p-4">
                <div className="relative">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img 
                      src={product.images ? product.images[selectedImage] : product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.images && product.images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                      >
                        <FaChevronLeft />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded-md border-2 cursor-pointer ${selectedImage === index ? 'border-orange-500' : 'border-transparent'}`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full md:w-3/5 p-4 border-l">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderRatingStars(Number(product.rating) || 0)}
                  </div>
                  <span className="text-sm text-gray-600 mr-4">{product.rating?.toFixed(1)}</span>
                  <span className="text-sm text-gray-600 border-l pl-4 mr-4">{product.reviewCount} đánh giá</span>
                  <span className="text-sm text-gray-600 border-l pl-4">{product.sold} đã bán</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-end mb-2">
                    <span className="text-3xl font-bold text-orange-500 mr-2">
                      {product.price.toLocaleString()}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through mr-2">
                        {product.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-sm bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                        {product.discount}% giảm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BsTruck className="mr-1" />
                    <span>Phí vận chuyển: 15.000₫ - 30.000₫</span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Số lượng</div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 border rounded-l-md flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <div className="w-12 h-8 border-t border-b flex items-center justify-center">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-8 h-8 border rounded-r-md flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500 ml-2">{product.stock} sản phẩm có sẵn</span>
                  </div>
                </div>
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-100 border border-orange-500 text-orange-600 py-3 px-4 rounded-md hover:bg-orange-200 transition-colors flex items-center justify-center"
                  >
                    <FaShoppingCart className="mr-2" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Mua ngay
                  </button>
                </div>
                {successMessage && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-center animate-fade-in">
                    {successMessage}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  <button 
                    onClick={handleAddToWishlist}
                    className={`flex items-center ${isWishlist ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <FaHeart className="mr-1" />
                    {isWishlist ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
                  </button>
                  <button 
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center text-gray-600"
                  >
                    <FaShareAlt className="mr-1" />
                    Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm mt-4 p-4">
            <div className="flex items-center mb-3">
              <FaStore className="text-orange-500 mr-2" />
              <h3 className="font-medium">Thông tin cửa hàng</h3>
            </div>
            <div className="flex items-center">
              <img 
                src="https://source.unsplash.com/random/60x60/?shop" 
                alt="Shop" 
                className="w-12 h-12 rounded-full border mr-3"
              />
              <div>
                <div className="font-medium">Cửa hàng {product.name.split(' ')[0]}</div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-3">Online 3 phút trước</span>
                  <span>1.2k người theo dõi</span>
                </div>
              </div>
              <button className="ml-auto bg-orange-100 text-orange-500 px-4 py-1 rounded-full text-sm hover:bg-orange-200">
                Xem cửa hàng
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm mt-4">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-6 py-3 font-medium ${activeTab === 'description' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-medium ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
                >
                  Đánh giá ({product.reviewCount})
                </button>
              </div>
            </div>
            <div className="p-6">
              {activeTab === 'description' ? (
                <div>
                  <h4 className="font-medium mb-3">Chi tiết sản phẩm</h4>
                  <div className="text-gray-700 whitespace-pre-line">
                    {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 pr-0 md:pr-8 mb-6 md:mb-0">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-orange-500">
                            {product.rating?.toFixed(1)}/5
                          </div>
                          <div className="flex justify-center mt-1">
                            {renderRatingStars(Number(product.rating) || 0)}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            {product.reviewCount} đánh giá
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="flex items-center">
                              <div className="w-10 text-sm text-gray-600">{star} sao</div>
                              <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-orange-500" 
                                  style={{ width: `${(reviewStats[star as keyof typeof reviewStats] / (product.reviewCount || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="w-10 text-sm text-gray-600 text-right">
                                {reviewStats[star as keyof typeof reviewStats]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-2/3">
                      {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Chưa có đánh giá nào cho sản phẩm này
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map(review => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                              <div className="flex items-center mb-3">
                                <img 
                                  src={review.userAvatar || 'https://source.unsplash.com/random/40x40/?user'} 
                                  alt={review.userName} 
                                  className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                  <div className="font-medium">{review.userName}</div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <div className="flex mr-2">
                                      {renderRatingStars(review.rating)}
                                    </div>
                                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>
                              {review.variant && (
                                <div className="text-sm text-gray-600 mb-2">
                                  Phân loại: {review.variant}
                                </div>
                              )}
                              <div className="text-gray-700 mb-3">{review.comment}</div>
                              {review.imageUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {review.imageUrls.map((img, idx) => (
                                    <img 
                                      key={idx} 
                                      src={img} 
                                      alt={`Đánh giá ${idx + 1}`} 
                                      className="w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {canReview && !hasReviewed && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                          <h3 className="text-xl font-bold text-orange-600 mb-4">Đánh giá sản phẩm này</h3>
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className="block font-medium mb-1">Chọn số sao:</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button type="button" key={star} onClick={() => setReviewRating(star)}>
                                    <svg className={`w-7 h-7 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block font-medium mb-1">Bình luận:</label>
                              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full border rounded p-2" rows={3} required maxLength={1000} />
                            </div>
                            <div>
                              <label className="block font-medium mb-1">Ảnh (tùy chọn):</label>
                              <input type="file" multiple accept="image/*" onChange={e => setReviewImages(Array.from(e.target.files || []))} />
                              {reviewImages.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {reviewImages.map((file, i) => (
                                    <img key={i} src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded" />
                                  ))}
                                </div>
                              )}
                            </div>
                            {reviewSubmitError && <div className="text-red-500">{reviewSubmitError}</div>}
                            {reviewSubmitSuccess && <div className="text-green-600">{reviewSubmitSuccess}</div>}
                            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded font-semibold" disabled={reviewSubmitting}>
                              {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                          </form>
                        </div>
                      )}
                      {canReview && hasReviewed && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 text-green-600 font-semibold">
                          Bạn đã đánh giá sản phẩm này.
                        </div>
                      )}
                      {!canReview && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 text-gray-500">
                          Bạn cần mua sản phẩm này (và đơn đã hoàn thành) để đánh giá.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Sản phẩm tương tự</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {suggestedProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={product.imageUrl || 'https://source.unsplash.com/random/300x300/?product'} 
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    {product.discount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h4>
                    <div className="flex items-end">
                      <span className="text-orange-500 font-bold mr-2">{product.price.toLocaleString()}₫</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">{product.originalPrice.toLocaleString()}₫</span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-1">
                        {renderRatingStars(Number(product.rating) || 0)}
                      </div>
                      <span className="text-xs text-gray-500">Đã bán {product.sold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm</div>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
      {showPaymentModal && product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Chọn phương thức thanh toán</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-500">Nhận hàng rồi mới thanh toán</div>
                    </div>
                  </div>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'Online' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('Online')}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'Online' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'Online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="font-medium">Thanh toán Online (VNPAY)</div>
                      <div className="text-sm text-gray-500">Giảm thêm 5% khi thanh toán online</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{(product.price * quantity).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">20.000₫</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-500">{(product.price * quantity + 20000).toLocaleString()}₫</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  navigate('/checkout', {
                    state: {
                      items: [{
                        menuId: product.id,
                        quantity: quantity,
                        name: product.name,
                        price: product.price,
                        storeId: product.storeId,
                      }],
                      paymentMethod: paymentMethod,
                    }
                  });
                }}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetail;