import React, { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
}

const defaultIcons = ['🍔', '🍰', '🍕', '🍜', '🍣'];

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Category/GetAll');
        if (!res.ok) throw new Error('Lỗi khi tải danh mục');
        const result = await res.json();
        setCategories(result.data);
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 my-8 px-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 animate-pulse rounded-2xl shadow-md"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 text-center text-red-500 text-lg font-medium">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="my-8 text-center text-gray-500 text-lg">
        Không có danh mục nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 my-8 px-4">
      {categories.slice(0, 8).map((cat, i) => (
        <div
          key={cat.id}
          className="group flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
            {defaultIcons[i % defaultIcons.length]}
          </span>
          <span className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;