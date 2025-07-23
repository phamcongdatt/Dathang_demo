import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface Category {
  id: string;
  ten: string;
  moTa: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  isLocked: boolean;
}

const RegisterStore: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    // Kiểm tra đăng nhập và lấy thông tin user
    checkUserAndLoadData();
  }, [navigate]);

  const checkUserAndLoadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Lấy thông tin profile user
      const profileRes = await fetch('http://localhost:5118/api/Auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileRes.status === 401) {
        navigate('/login');
        return;
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.data) {
          setUserProfile(profileData.data);
          
          // Kiểm tra role - nếu đã là Seller thì chuyển hướng
          if (profileData.data.role === 'Seller') {
            setError('Bạn đã là người bán rồi! Không cần đăng ký gian hàng nữa.');
            setTimeout(() => {
              navigate('/seller/mystores');
            }, 3000);
            return;
          }
        }
      }

      // Lấy danh sách danh mục
      fetchCategories();
    } catch (err) {
      console.error('Lỗi khi kiểm tra thông tin user:', err);
      setError('Có lỗi xảy ra khi kiểm tra thông tin người dùng');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5118/api/Category/GetAll');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  const getCoordinatesFromAddress = async (address: string) => {
    try {
      // Sử dụng API geocoding để lấy tọa độ từ địa chỉ
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi lấy tọa độ:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }

      // Kiểm tra lại role
      if (userProfile?.role === 'Seller') {
        setError('Bạn đã là người bán rồi!');
        return;
      }

      // Validate form
      if (!formData.name.trim() || !formData.address.trim() || !formData.description.trim()) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Lấy tọa độ từ địa chỉ
      const coordinates = await getCoordinatesFromAddress(formData.address);
      
      const storeData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId || null,
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null
      };

      const res = await fetch('http://localhost:5118/api/Stores/createStore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });

      if (res.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        return;
      }

      if (res.status === 403) {
        setError('Bạn không có quyền đăng ký gian hàng. Vui lòng liên hệ admin.');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || 'Có lỗi xảy ra khi đăng ký gian hàng');
        return;
      }

      const result = await res.json();
      setSuccess('Đăng ký gian hàng thành công! Gian hàng của bạn đang chờ admin duyệt. Sau khi được duyệt, bạn sẽ trở thành người bán.');
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        description: '',
        categoryId: ''
      });

      // Chuyển hướng sau 5 giây
      setTimeout(() => {
        navigate('/profile');
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký gian hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nếu đã là Seller, hiển thị thông báo
  if (userProfile?.role === 'Seller') {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Bạn đã là người bán!</h1>
            <div className="bg-blue-50 text-blue-600 p-4 rounded-lg text-center font-medium mb-6">
              Bạn đã có quyền người bán rồi. Không cần đăng ký gian hàng nữa.
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/seller/mystores')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Xem gian hàng của tôi
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Về trang cá nhân
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6 border-b pb-4 border-gray-100">
            Đăng ký gian hàng
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg text-center font-medium mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gian hàng *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập tên gian hàng"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ gian hàng *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Hệ thống sẽ tự động lấy tọa độ từ địa chỉ này
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Mô tả về gian hàng, loại món ăn, đặc điểm..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.ten}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Lưu ý:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Chỉ người dùng thường (Customer) mới có thể đăng ký gian hàng</li>
                <li>• Gian hàng sẽ được admin duyệt trong vòng 24-48 giờ</li>
                <li>• Sau khi được duyệt, bạn sẽ trở thành người bán (Seller)</li>
                <li>• Tọa độ sẽ được tự động lấy từ địa chỉ bạn nhập</li>
                <li>• Hãy nhập địa chỉ chính xác để khách hàng tìm thấy dễ dàng</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký gian hàng'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterStore; 