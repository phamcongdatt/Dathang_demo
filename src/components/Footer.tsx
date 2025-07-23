import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-10 mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <span className="font-bold text-2xl">ShopeeFood</span>
          </div>
          <p className="text-sm opacity-80">
            Giao hàng tận nơi, nhanh chóng và tiện lợi. © 2024 ShopeeFood
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Liên kết nhanh</h3>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="hover:underline hover:text-orange-200 transition">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:underline hover:text-orange-200 transition">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:underline hover:text-orange-200 transition">
              Liên hệ
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Theo dõi chúng tôi</h3>
          <div className="flex gap-4 text-2xl">
            <a href="#" className="hover:text-orange-200 transition">
              FB
            </a>
            <a href="#" className="hover:text-orange-200 transition">
              IG
            </a>
            <a href="#" className="hover:text-orange-200 transition">
              YT
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-orange-300/30 pt-6 text-center text-sm opacity-70">
     
      </div>
    </div>
  </footer>
);

export default Footer;