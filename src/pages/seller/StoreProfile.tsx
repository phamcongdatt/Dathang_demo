import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface StoreProfileInfo {
  id: number;
  name: string;
  address: string;
  description?: string;
  imageUrl?: string;
  status?: string;
}

const storeId = 1; // TODO: Lấy từ router/query thực tết

const StoreProfile: React.FC = () => {
  const [profile, setProfile] = useState<StoreProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', description: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5118/api/Stores/${storeId}`);
        if (!res.ok) throw new Error('Lỗi khi tải thông tin cửa hàng');
        const data = await res.json();
        setProfile(data);
        setForm({ name: data.name, address: data.address, description: data.description || '' });
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Gửi API cập nhật thông tin cửa hàng (POST/PUT)
    setEdit(false);
    setProfile({ ...profile!, ...form });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Thông tin cửa hàng</h1>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_,i)=>(<div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : !profile ? (
          <div className="my-6">Không có thông tin cửa hàng.</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <img src={profile.imageUrl || 'https://source.unsplash.com/100x100/?store,food'} alt={profile.name} className="w-24 h-24 object-cover rounded-full mb-4" />
            {edit ? (
              <div className="w-full space-y-3">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Tên cửa hàng" className="w-full border rounded px-3 py-2" />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="w-full border rounded px-3 py-2" />
                <button onClick={handleSave} className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 mt-2">Lưu</button>
              </div>
            ) : (
              <>
                <div className="font-bold text-lg mb-2">{profile.name}</div>
                <div className="text-gray-600 mb-1">Địa chỉ: {profile.address}</div>
                {profile.description && <div className="text-gray-600 mb-1">Mô tả: {profile.description}</div>}
                {profile.status && <div className="text-xs text-blue-500 mb-2">Trạng thái: {profile.status}</div>}
                <button onClick={()=>setEdit(true)} className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600">Chỉnh sửa</button>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
