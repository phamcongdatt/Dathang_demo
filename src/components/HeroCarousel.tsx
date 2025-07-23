// HeroCarousel.tsx
import React, { useState, useEffect } from 'react';

const slides = [
  'https://source.unsplash.com/1600x600/?burger',
  'https://source.unsplash.com/1600x600/?chicken',
  'https://source.unsplash.com/1600x600/?fries',
];

const HeroCarousel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      <img
        src={slides[idx]}
        alt="Hero"
        className="w-full h-full object-cover transition-all duration-1000"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 transform -translate-y-1/2 bg-black/30 p-8 rounded-lg">
        <h1 className="text-white text-3xl md:text-5xl font-bold">Welcome to KFC</h1>
        <p className="text-white mt-4 text-lg">Delicious meals delivered fast.</p>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
