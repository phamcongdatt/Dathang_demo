import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiMapPin, FiPhone, FiArrowRight } from 'react-icons/fi';

interface OrderItem {
  menuId: string;
  quantity: number;
  name?: string;
  price?: number;
}

interface ShippingInfoState {
  items: OrderItem[];
  paymentMethod?: 'COD' | 'VNPAY' | 'MOMO';
}

const EnterShippingInfo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ShippingInfoState | undefined;

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim() || !phone.trim()) {
      setError('Please enter both delivery address and phone number');
      return;
    }

    // Validate phone number format
    if (!/^\d{10,15}$/.test(phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call or processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.setItem('deliveryAddress', address);
      localStorage.setItem('phoneNumber', phone);
      
      navigate('/checkout', {
        state: {
          items: state?.items || [],
          paymentMethod: state?.paymentMethod,
          deliveryAddress: address,
          phoneNumber: phone,
        },
      });
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!state || !state.items || state.items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin vận chuyển  </h1>
            <p className="text-gray-600">Nhập thông tin để tiếp tục </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8">
            <form onSubmit={handleSaveInfo} className="space-y-6">
              {/* Address Field */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Nhập địa chỉ để nhận hàng"
                  />
                </div>
              </div>
              
              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Nhập số điện thoại của bạn"
                    pattern="[0-9]{10,15}"
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Tiếp tục đặt hàng
                      <FiArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Thông tin của bạn sẽ được lưu an toàn để tiếp tục đặt hàng nhanh hơn</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EnterShippingInfo;