import React, { useState } from 'react';

interface Props {
  orderId: string;
  paymentStatus: string;
  paymentMethod: string;
}

const OrderPaymentButton: React.FC<Props> = ({ orderId, paymentStatus, paymentMethod }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVnPay = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5118/api/payment/vnpay/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.PaymentUrl) {
        window.location.href = data.PaymentUrl;
      } else {
        setError(data.message || 'Không tạo được link thanh toán!');
      }
    } catch (err) {
      setError('Có lỗi khi tạo link thanh toán!');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus !== 'Pending' || paymentMethod !== 'Online') return null;

  return (
    <div>
      <button
        onClick={handleVnPay}
        disabled={loading}
        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600"
      >
        {loading ? 'Đang chuyển hướng...' : 'Thanh toán VNPAY'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default OrderPaymentButton; 