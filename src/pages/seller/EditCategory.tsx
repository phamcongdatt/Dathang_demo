import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Category {
  id: string;
  ten: string;
  moTa: string;
}

const AddMenu: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchStoreAndCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const catRes = await fetch('http://localhost:5118/api/Category/GetAll', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!catRes.ok) throw new Error('Lỗi khi lấy danh mục');
        const catData = await catRes.json();
        const categoriesData = Array.isArray(catData.data) ? catData.data : [];
        setCategories(categoriesData);

        // Tải thông tin danh mục hiện tại nếu có id
        if (id) {
          const categoryRes = await fetch(`http://localhost:5118/api/Category/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!categoryRes.ok) throw new Error('Không tìm thấy danh mục');
          const categoryData = await categoryRes.json();
          const category = categoryData.data;
          setSelectedCategory(category);
          setForm({
            name: category.Ten || '',
            description: category.MoTa || '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndCategories();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = categories.find(c => c.id === selectedId);
    if (selected) {
      setSelectedCategory(selected);
      setForm({
        name: selected.ten,
        description: selected.moTa,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!id || !form.name || !form.description) {
      setError('Vui lòng chọn danh mục và nhập đầy đủ tên và mô tả!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        Ten: form.name,
        MoTa: form.description,
      };
      const res = await fetch(`http://localhost:5118/api/Category/suggest-update/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess('Đề xuất cập nhật danh mục đã được gửi thành công. Vui lòng chờ admin phê duyệt.');
        setTimeout(() => {
          navigate('/seller/store-category');
        }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Gửi đề xuất cập nhật danh mục thất bại!');
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
              onClick={() => navigate('/seller/store-category')}
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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Cập nhật danh mục</h1>

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
                    {/* Hiển thị thông tin danh mục hiện tại */}
                    {selectedCategory && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-md font-medium text-gray-700 mb-2">Thông tin danh mục hiện tại</h3>
                        <p><strong>Tên:</strong> {selectedCategory.ten}</p>
                        <p><strong>Mô tả:</strong> {selectedCategory.moTa || '-'}</p>
                      </div>
                    )}

                    {!id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chọn danh mục để cập nhật
                        </label>
                        <select
                          value={selectedCategory?.id || ''}
                          onChange={handleSelectCategory}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.ten}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Sửa danh mục"
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
                    disabled={loading || !id}
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
                    ) : 'Gửi đề xuất cập nhật'}
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