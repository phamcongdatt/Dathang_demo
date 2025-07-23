import React, { useState, useEffect } from 'react';

const banners = [
  'https://bloganchoi.com/wp-content/uploads/2023/11/ung-dung-dat-do-an-tot-nhat-11.jpg',
  'https://tse3.mm.bing.net/th/id/OIP.IytNC0I0Yga6i3tScHem7QHaEK?pid=Api&P=0&h=220',
  'https://news.khangz.com/wp-content/uploads/2023/08/ung-dung-dat-do-an-7.jpg',
];

const Banner: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[36rem] overflow-hidden rounded-2xl mb-8 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" />
      {banners.map((banner, i) => (
        <img
          key={i}
          src={banner}
          alt={`Banner ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-orange-500 scale-125'
                : 'bg-white/70 hover:bg-white border border-orange-400'
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
      <div className="absolute top-1/2 left-8 -translate-y-1/2 text-white z-20 hidden md:block">
        <h2 className="text-3xl font-bold mb-2 animate-slide-in-left">Ưu đãi đặc biệt hôm nay!</h2>
        <p className="text-lg animate-slide-in-left animation-delay-200">
          Giảm giá lên đến 50% cho mọi đơn hàng
        </p>
      </div>
    </div>
  );
};

export default Banner;