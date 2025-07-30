import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';  
import Footer from '../../../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingBag, FiMapPin, FiClock } from 'react-icons/fi';
import { FaStore, FaUtensils } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SearchResult {
  type: string;
  id: string;
  name: string;
  description: string;
  storeId: string;
  rating: number | null;
  reviewCount: number;
  orderCount: number;
  categoryName: string;
  imageUrl?: string;
  popularityScore: number;
  storeName?: string;
  price?: number;
  address?: string;
  deliveryTime?: string;
}

interface Product {
  id: string;
  storeId: string; 
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
}
const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    
    if (!query) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5118/api/Search/GetSearch?searchTerm=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch search results');
        const data = await res.json();
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search, navigate]);

  const renderSkeletonLoader = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4">
            <Skeleton height={160} className="mb-4" />
            <Skeleton count={2} />
            <div className="flex justify-between mt-3">
              <Skeleton width={80} />
              <Skeleton width={60} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderResultCard = (result: SearchResult) => (
    <div 
      key={`${result.type}-${result.id}`}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white"
      onClick={() => navigate(result.type === 'store' ? `/store/${result.id}` : `/menu/${result.id}`)}
    >
      <div className="relative">
        <img 
          src={result.imageUrl} 
          alt={result.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.png';
          }}
        />
        <div className="absolute top-2 left-2 bg-white rounded-full p-2 shadow">
          {result.type === 'store' ? (
            <FaStore className="text-orange-500" />
          ) : (
            <FaUtensils className="text-orange-500" />
          )}
        </div>
      </div>
      
      <div className="p-4 cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{result.name}</h3>
          {result.type === 'menu' && result.price && (
            <span className="font-medium text-orange-500 whitespace-nowrap ml-2">
              {result.price.toLocaleString()}đ
            </span>
          )}
        </div>
        
        {result.type === 'store' ? (
          <>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FiMapPin className="mr-1" />
              <span className="truncate">{result.address}</span>
            </div>
            {result.deliveryTime && (
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FiClock className="mr-1" />
                <span>{result.deliveryTime}</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.description}</p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {result.type === 'store' ? (
            <>
              <div className="flex items-center">
                {result.rating && (
                  <div className="flex items-center bg-orange-50 text-orange-600 px-2 py-1 rounded mr-2">
                    <FiStar className="mr-1 fill-current" />
                    <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500">{result.reviewCount} reviews</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <FiShoppingBag className="mr-1" />
                <span>{result.orderCount} orders</span>
              </div>
            </>
          ) : (
            <div className="w-full">
              <div className="flex items-center text-sm text-gray-600">
                <FaStore className="mr-1 text-orange-500" />
                <span className="truncate">{result.storeName}</span>
              </div>
            </div>
          )}
            <button
            className="bg-orange-500 text-white px-9 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors group-hover:scale-105"
            onClick={e => {
              e.stopPropagation();
              navigate('/checkout', {
                state: {
                  items: [{
                    menuId: result.id,
                    quantity: 1,
                    name: result.name,
                    price: result.price,
                    storeId: result.storeId,
                  }],
                },
              });
            }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {results.length > 0 
              ? `Có ${results.length} kết quả cho "${searchQuery}"`
              : `Không tìm thấy kết quả cho "${searchQuery}"`
            }
          </p>
        </div>
        
        {loading ? (
          renderSkeletonLoader()
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any matches for your search. Try different keywords or check for typos.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(renderResultCard)}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResultsPage;