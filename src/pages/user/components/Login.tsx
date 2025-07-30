import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { FaEye, FaEyeSlash, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BiLock } from 'react-icons/bi';
import ForgotPassword from './ForgotPassword';
import { FiLoader } from 'react-icons/fi';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

const handleNormalLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setErrors({ email: '', password: '' });

  // Validate form
  const validationErrors = {
    email: email ? '' : 'Email là bắt buộc',
    password: password ? '' : 'Mật khẩu là bắt buộc',
  };

  if (validationErrors.email || validationErrors.password) {
    setErrors(validationErrors);
    setLoading(false);
    return;
  }

  try {
    const res = await fetch('http://localhost:5118/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // Kiểm tra network error
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = 
        res.status === 401 ? 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên.' :
        res.status === 400 ? 'Email hoặc mật khẩu không đúng' :
        errorData.message || 'Đăng nhập thất bại';
      
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const data = await res.json();
    
    if (!data?.token) {
      throw new Error('Không nhận được token từ server');
    }

    localStorage.setItem('token', data.token);
    navigate('/');
    
  } catch (err: any) {
    setError(err.message || 'Đã xảy ra lỗi khi kết nối đến server');
  } finally {
    setLoading(false);
  }
};
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const idToken = credentialResponse.credential;
      console.log('Received idToken:', idToken); // Debug
      if (!idToken || typeof idToken !== 'string') {
        setError('Token từ Google không hợp lệ');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5118/api/Auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idToken),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng nhập Google thất bại');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        navigate('/');
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <GoogleOAuthProvider clientId="175295289334-in7m9cmqr54oee17pd3qcvd04fv6iegl.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
        <div
          className="absolute inset-0 z-0 backdrop-blur-sm bg-opacity-50"
        />

        <div className="w-full max-w-md z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Chào mừng trở lại!</h2>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleNormalLogin} className="space-y-6">
              <div>
                <div className="relative">
                  <MdEmail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-blue-500`}
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <BiLock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-10 pr-12 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-blue-500`}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Đăng nhập'
                )}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      setError('Đăng nhập Google thất bại');
                      setLoading(false);
                    }}
                    theme="filled_blue"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    locale="vi"
                  />
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  <FaFacebook className="text-blue-600 mr-2" />
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Đăng ký
                </Link>
              </p>
            </form>
          </div>

          <footer className="mt-8 text-center">
            <div className="flex justify-center space-x-4 mb-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaLinkedin />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaInstagram />
              </a>
            </div>
            <div className="text-sm text-gray-600 space-x-4">
              <a href="#" className="hover:text-gray-900">
                Chính sách bảo mật
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900">
                Điều khoản dịch vụ
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-900">
                Liên hệ
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-600">© 2025 Công ty của bạn. Đã đăng ký bản quyền.</p>
          </footer>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;