import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Category {
  id: string;
  ten: string;
}

const AddMenu: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
      const fetchStoreAndCategories = async () => {
        setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const storesRes = await fetch('http://localhost:5118/api/Stores/mystores', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!storesRes.ok) throw new Error('Lỗi khi lấy thông tin cửa hàng');
        const storesData = await storesRes.json();
        const approvedStore = Array.isArray(storesData) ? storesData.find((s: any) => s.status === 'Approved') : null;
        if (!approvedStore) throw new Error('Không tìm thấy cửa hàng đã duyệt');
        setStoreId(approvedStore.id);
        const catRes = await fetch('http://localhost:5118/api/Category/GetAll');
        if (!catRes.ok) throw new Error('Lỗi khi lấy danh mục');
        const catData = await catRes.json();
        setCategories(Array.isArray(catData.data) ? catData.data : []);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.description) {
      setError('Vui lòng nhập đầy đủ tên và mô tả danh mục!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        Ten: form.name, // Tên danh mục
        MoTa: form.description, // Mô tả danh mục
      };
      const res = await fetch('http://localhost:5118/api/Category/suggest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess('Đề xuất danh mục đã được gửi thành công. Vui lòng chờ admin phê duyệt.');
        setTimeout(() => {
          navigate('/seller/store-category'); // Điều hướng sau khi thành công
        }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Gửi đề xuất danh mục thất bại!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/seller/store-menus')}
              className="flex items-center text-cyan-600 hover:text-cyan-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Quay lại
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm danh mục mới</h1>
              
              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm border border-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm border border-green-200">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Ví dụ: Đồ ăn sáng"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        rows={3}
                        placeholder="Mô tả chi tiết về danh mục..."
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang gửi...
                      </span>
                    ) : 'Gửi đề xuất danh mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddMenu;