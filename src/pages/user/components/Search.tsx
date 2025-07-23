import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

interface SearchResult {
  id: number;
  name: string;
  type: 'store' | 'menu';
  price?: number;
  address?: string;
  imageUrl?: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5118/api/Search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Lỗi khi tìm kiếm');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-2 md:px-0 py-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-500">Tìm kiếm</h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nhập từ khóa..."
            className="flex-1 rounded-full border border-gray-200 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600">Tìm kiếm</button>
        </form>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i)=>(<div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl"/>))}
          </div>
        ) : error ? (
          <div className="text-red-500 my-6">{error}</div>
        ) : results.length === 0 && query ? (
          <div className="my-6">Không tìm thấy kết quả phù hợp.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {results.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center p-4 cursor-pointer">
                <img src={item.imageUrl || 'https://source.unsplash.com/200x200/?food,store'} alt={item.name} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-medium text-gray-800 mb-1 text-center">{item.name}</div>
                {item.type === 'menu' && <div className="text-orange-500 font-bold mb-2">{item.price?.toLocaleString()}₫</div>}
                {item.type === 'store' && <div className="text-gray-500 text-sm mb-2">{item.address}</div>}
                <span className="text-xs text-gray-400">{item.type === 'menu' ? 'Món ăn' : 'Cửa hàng'}</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Search; 