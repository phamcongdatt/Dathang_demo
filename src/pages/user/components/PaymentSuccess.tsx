import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const orderId = query.get('orderId');

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-2">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-lg w-full text-center">
          <div className="text-5xl mb-4 text-green-500">✔️</div>
          <h1 className="text-2xl font-bold text-green-700 mb-4">Thanh toán thành công!</h1>
          <p className="text-gray-700 mb-4">Cảm ơn bạn đã thanh toán đơn hàng.</p>
          {orderId && (
            <div className="mb-4 text-gray-600">Mã đơn hàng: <span className="font-semibold">{orderId}</span></div>
          )}
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 mt-4"
            onClick={() => navigate('/orders')}
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess; 