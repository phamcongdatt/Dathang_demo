import React, { createContext, useContext, useState,useEffect } from 'react';

interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    refreshCartCount(); // Gọi khi component mount
  }, []); // Rỗng để chỉ chạy một lần

  // Hàm này gọi API để lấy số lượng sản phẩm trong giỏ hàng
  const refreshCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch('http://localhost:5118/api/Cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        setCartCount(0);
        return;
      }
      const data = await res.json();
      console.log('API data:', data); // Debug dữ liệu từ API
      setCartCount(data.data?.items?.length || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      setCartCount(0);
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}; 