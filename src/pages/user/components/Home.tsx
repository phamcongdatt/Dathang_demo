import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Banner from '../../../components/Banner';
import CategoryGrid from '../../../components/CategoryGrid';
import ProductGrid from '../../../components/ProductGrid';
import Footer from '../../../components/Footer';
import { FiArrowRight, FiClock, FiStar, FiShoppingBag, FiPercent } from 'react-icons/fi';

const Home: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Navbar Effect */}
      <div className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-md bg-white/90 backdrop-blur-sm' : 'bg-transparent'}`}>
        <Navbar />
      </div>

      <main className="relative pt-16">
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <Banner />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        {/* Category Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Các danh mục món ăn được mua nhiều</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our wide range of delicious food categories
              </p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Món ăn nổi bật </h2>
                <p className="text-gray-600 mt-2">Được ưa thích hôm nay</p>
              </div>
              <button className="mt-4 md:mt-0 flex items-center text-orange-600 font-medium hover:text-orange-700 transition-colors">
                View all <FiArrowRight className="ml-2" />
              </button>
            </div>
            <ProductGrid />
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl flex items-start">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiClock className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Get your food delivered in under 30 minutes</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl flex items-start">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiStar className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Quality Food</h3>
                  <p className="text-gray-600">Fresh ingredients from trusted suppliers</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl flex items-start">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <FiPercent className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Great Offers</h3>
                  <p className="text-gray-600">Daily discounts and special deals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promotional Section */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-3">Special Discount</h2>
                <p className="text-lg opacity-90 max-w-md">
                  Get 30% off your first order when you pay online. Limited time offer!
                </p>
              </div>
              <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center">
                <FiShoppingBag className="mr-2" /> Order Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;