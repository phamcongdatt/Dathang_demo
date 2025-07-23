import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import { FiMapPin, FiPhone, FiClock, FiStar } from 'react-icons/fi';


interface Store {
  id: number;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  rating?: number;
  imageUrl?: string;
}

const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5118/api/Stores');
        if (!res.ok) throw new Error('Failed to load stores');
        const data = await res.json();
        setStores(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Our Store Locations</h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search stores..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No stores found</div>
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStores.map(store => (
                <div
                  key={store.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="relative h-48 w-full">
                    <img 
                      src={store.imageUrl || 'https://source.unsplash.com/400x300/?store,cafe,restaurant'} 
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                    {store.rating && (
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center text-sm font-medium">
                        <FiStar className="text-yellow-400 mr-1" />
                        {store.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{store.name}</h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <FiMapPin className="mr-2" />
                      <span className="text-sm">{store.address}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center text-gray-600 mb-1">
                        <FiPhone className="mr-2" />
                        <span className="text-sm">{store.phone}</span>
                      </div>
                    )}
                    {store.openingHours && (
                      <div className="flex items-center text-gray-600">
                        <FiClock className="mr-2" />
                        <span className="text-sm">{store.openingHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedStore && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="relative h-64 w-full">
                    <img 
                      src={selectedStore.imageUrl || 'https://source.unsplash.com/800x400/?store,cafe,restaurant'} 
                      alt={selectedStore.name}
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setSelectedStore(null)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h2>
                      {selectedStore.rating && (
                        <div className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                          <FiStar className="mr-1" />
                          {selectedStore.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <FiMapPin className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-gray-700">Address</h3>
                          <p className="text-gray-600">{selectedStore.address}</p>
                        </div>
                      </div>
                      
                      {selectedStore.phone && (
                        <div className="flex items-start">
                          <FiPhone className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-gray-700">Phone</h3>
                            <p className="text-gray-600">{selectedStore.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedStore.openingHours && (
                        <div className="flex items-start">
                          <FiClock className="mt-1 mr-3 text-gray-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-gray-700">Opening Hours</h3>
                            <p className="text-gray-600">{selectedStore.openingHours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition">
                        Get Directions
                      </button>
                      <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition">
                        Call Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Stores;