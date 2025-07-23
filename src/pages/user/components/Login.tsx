import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5118/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Xử lý chi tiết lỗi dựa trên status code
        if (res.status === 401) {
          setError('Tài khoản đã bị khóa,su dung tai khoan khac hoac lien he voi admin de mo khoa tai khoan.');
        } else {
          setError(data.message || 'Đăng nhập thất bại');
        }
        return;
      }
  
      // Lưu token nếu có và kiểm tra
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token saved:', data.token); // Debug token
        // Kiểm tra token bằng cách gọi API profile (tùy chọn)
        const profileRes = await fetch('http://localhost:5118/api/Auth/profile', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!profileRes.ok) {
          throw new Error('Token không hợp lệ sau khi đăng nhập');
        }
        navigate('/');
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-orange-500 text-center">Đăng nhập</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-orange-500 hover:underline">Đăng ký</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 