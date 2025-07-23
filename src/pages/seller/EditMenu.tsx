import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Category {
  id: string;
  ten: string;
}

interface Menu {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
  status: string;
}

const EditMenu: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    categoryId: '',
    status: 'Available'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  // Fetch menu data and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        
        // Fetch menu details
        const menuRes = await fetch(`http://localhost:5118/api/menus/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!menuRes.ok) throw new Error('Không thể tải thông tin sản phẩm');
        const menuData = await menuRes.json();
        
        setForm({
          name: menuData.name,
          price: menuData.price.toString(),
          description: menuData.description || '',
          imageUrl: menuData.imageUrl || '',
          categoryId: menuData.categoryId,
          status: menuData.status
        });
        setOriginalImageUrl(menuData.imageUrl || '');
        setImagePreview(menuData.imageUrl || null);
        
        // Fetch categories
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
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.price || !form.categoryId) {
      setError('Vui lòng nhập đầy đủ tên, giá và chọn danh mục!');
      return;
    }
    setLoading(true);
    try {
      let imageUrl = originalImageUrl; // Giữ ảnh cũ nếu không upload ảnh mới
      
      if (selectedFile) {
        // Upload file mới lên API upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('http://localhost:5118/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Lỗi khi upload ảnh');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/menus/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          description: form.description,
          imageUrl: imageUrl,
          categoryId: form.categoryId,
          status: form.status
        }),
      });
      
      if (res.ok) {
        setSuccess('Cập nhật sản phẩm thành công!');
        setTimeout(() => {
          navigate('/seller/store-menus');
        }, 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Cập nhật sản phẩm thất bại!');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.name) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Cập nhật sản phẩm</h1>
              
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
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Ví dụ: Phở bò"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          name="price"
                          type="number"
                          min="0"
                          value={form.price}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="50000"
                          required
                        />
                        <span className="absolute left-3 top-2.5 text-gray-500">₫</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories && Array.isArray(categories) ? (
                          categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.ten}
                            </option>
                          ))
                        ) : (
                          <option disabled>Không có danh mục</option>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        <option value="Available">Đang bán</option>
                        <option value="Unavailable">Ngừng bán</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                        rows={3}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setSelectedFile(null);
                              }}
                              className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                                <span>Tải ảnh lên</span>
                                <input 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG tối đa 5MB</p>
                          </>
                        )}
                      </div>
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
                        Đang cập nhật...
                      </span>
                    ) : 'Cập nhật sản phẩm'}
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

export default EditMenu; 