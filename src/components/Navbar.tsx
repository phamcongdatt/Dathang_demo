import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiBell, FiUser, FiHome, FiList } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NoticationContext';

const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const { NotificationCount } = useNotification();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Xóa ô tìm kiếm sau khi submit
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-orange-500 font-bold text-2xl">
            <span className="text-4xl animate-pulse">🛒</span>
            <span className="tracking-tight">ShopeeFood</span>
          </Link>
          
          <div className="flex-1 mx-4 md:mx-8 max-w-2xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm món ăn, cửa hàng..."
                  className="w-full rounded-full border border-gray-200 px-5 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 text-gray-700"
                  value={query}
                  onChange={handleInputChange}
                />
                <button 
                  type="submit" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                >
                  🔍
                </button>
              </div>
            </form>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 text-gray-600 text-xl">
            <Link
              to="/cart"
              className="hover:text-orange-500 transition relative group"
              aria-label="Cart"
            >
              <FiShoppingCart />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition">
                {cartCount || 0}
              </span>
            </Link>
            <Link
              to="/notification"
              className="hover:text-orange-500 transition relative group"
              aria-label="Notifications"
            >
              <FiBell />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition">
                {NotificationCount || 0}
              </span>
            </Link>
            <Link
              to="/register-store"
              className="hover:text-orange-500 transition"
              aria-label="Register Store"
              title="Đăng ký gian hàng"
            >
              <FiHome />
            </Link>
            <Link
              to="/WishList"
              className="hover:text-orange-500 transition"
              aria-label="WishList"
              title="Danh sách yêu thích"
            >
              <FiList />
            </Link>
            <Link
              to="/profile"
              className="hover:text-orange-500 transition"
              aria-label="Profile"
            >
              <FiUser />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;