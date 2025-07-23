import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface LocationInfo {
  id: number;
  address: string;
  city: string;
  district: string;
  ward: string;
}

const Location: React.FC = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ address: '', city: '', district: '', ward: '' });

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Location');
        if (!res.ok) throw new Error('Lỗi khi tải địa chỉ');
        const data = await res.json();
        setLocation(data);
        setForm({ address: data.address, city: data.city, district: data.district, ward: data.ward });
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Gửi API cập nhật địa chỉ (POST/PUT)
    setEdit(false);
    setLocation({ ...location!, ...form });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Địa chỉ giao hàng</h1>
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_,i)=>(<div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : !location ? (
          <div className="my-6">Chưa có địa chỉ giao hàng.</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            {edit ? (
              <div className="space-y-3">
                <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
                <input name="city" value={form.city} onChange={handleChange} placeholder="Tỉnh/Thành phố" className="w-full border rounded px-3 py-2" />
                <input name="district" value={form.district} onChange={handleChange} placeholder="Quận/Huyện" className="w-full border rounded px-3 py-2" />
                <input name="ward" value={form.ward} onChange={handleChange} placeholder="Phường/Xã" className="w-full border rounded px-3 py-2" />
                <button onClick={handleSave} className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 mt-2">Lưu</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-semibold">Địa chỉ:</span> {location.address}</div>
                <div><span className="font-semibold">Tỉnh/Thành phố:</span> {location.city}</div>
                <div><span className="font-semibold">Quận/Huyện:</span> {location.district}</div>
                <div><span className="font-semibold">Phường/Xã:</span> {location.ward}</div>
                <button onClick={()=>setEdit(true)} className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 mt-2">Chỉnh sửa</button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Location; 