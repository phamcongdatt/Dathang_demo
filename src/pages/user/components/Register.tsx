import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { FiLoader } from 'react-icons/fi';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const validationErrors = {
      name:"",
      email: '',
      password: '', 
      confirmPassword: '',
    };

    if (!name) validationErrors.name = 'Tên là bắt buộc';
    if (!email) validationErrors.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) validationErrors.email = 'Email không hợp lệ';
    if (!password) validationErrors.password = 'Mật khẩu là bắt buộc';
    else if (password.length < 6) validationErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!confirmPassword) validationErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    else if (password !== confirmPassword) validationErrors.confirmPassword = 'Mật khẩu không khớp';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5118/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        throw new Error('Không nhận được token từ server');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng ký');
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
      <div className="flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0 bg-gray-50">
        <div>
          <a href="/">
            <h3 className="text-4xl font-bold text-purple-600">Logo</h3>
          </a>
        </div>
        <div className="w-full px-6 py-4 mt-6 overflow-hidden bg-white shadow-md sm:max-w-lg sm:rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 undefined">
                Tên
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="text"
                  name="name"
                  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 undefined">
                Email
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="email"
                  name="email"
                  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 undefined">
                Mật khẩu
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="password"
                  name="password"
                  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 undefined">
                Xác nhận mật khẩu
              </label>
              <div className="flex flex-col items-start">
                <input
                  type="password"
                  name="password_confirmation"
                  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
            <Link to="/forgot-password" className="text-xs text-purple-600 hover:underline">
              Quên mật khẩu?
            </Link>
            <div className="flex items-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
              >
                {loading ? <FiLoader className="animate-spin mx-auto" /> : 'Đăng ký'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-purple-600 hover:underline">
              Đăng nhập
            </Link>
          </div>
          <div className="flex items-center w-full my-4">
            <hr className="w-full" />
            <p className="px-3">HOẶC</p>
            <hr className="w-full" />
          </div>
          <div className="my-6 space-y-2">
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
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;