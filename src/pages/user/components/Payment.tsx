import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface PaymentInfo {
  orderId: number;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

const Payment: React.FC = () => {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Payment');
        if (!res.ok) throw new Error('Lỗi khi tải thông tin thanh toán');
        const data = await res.json();
        setPayment(data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Thanh toán đơn hàng</h1>
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_,i)=>(<div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : !payment ? (
          <div className="my-6">Không có thông tin thanh toán.</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 space-y-2">
            <div><span className="font-semibold">Mã đơn hàng:</span> {payment.orderId}</div>
            <div><span className="font-semibold">Số tiền:</span> {payment.amount.toLocaleString()}₫</div>
            <div><span className="font-semibold">Phương thức:</span> {payment.method}</div>
            <div><span className="font-semibold">Trạng thái:</span> <span className="text-blue-500 font-semibold">{payment.status}</span></div>
            <div><span className="font-semibold">Ngày tạo:</span> {new Date(payment.createdAt).toLocaleString()}</div>
            <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600">Thanh toán lại</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Payment; 