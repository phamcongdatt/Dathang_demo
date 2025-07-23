import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const orderId = query.get('orderId');
  const error = query.get('error');

  return (
    <div className="bg-gradient-to-br from-red-50 to-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-lg w-full text-center">
          <div className="text-5xl mb-4 text-red-500">❌</div>
          <h1 className="text-2xl font-bold text-red-700 mb-4">Thanh toán thất bại!</h1>
          <p className="text-gray-700 mb-4">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
          {orderId && (
            <div className="mb-2 text-gray-600">Mã đơn hàng: <span className="font-semibold">{orderId}</span></div>
          )}
          {error && (
            <div className="mb-2 text-gray-500">Mã lỗi: <span className="font-semibold">{error}</span></div>
          )}
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 mt-4"
            onClick={() => navigate('/orders')}
          >
            Quay lại đơn hàng của tôi
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentFailed; 