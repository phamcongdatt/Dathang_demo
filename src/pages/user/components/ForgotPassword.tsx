import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';
import { FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:5118/api/Auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Yêu cầu không thành công');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
    <Link to="/login" className="text-sm text-blue-600 hover:underline">
      Quay lại đăng nhập
    </Link>
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Quên mật khẩu</h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-lg text-center border border-green-100">
              Mật khẩu tạm thời đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <MdEmail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : null}
                Gửi yêu cầu
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:underline"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;