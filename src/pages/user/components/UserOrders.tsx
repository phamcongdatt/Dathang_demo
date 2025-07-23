import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';

const UserOrders: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <Link
          to="/orders"
          className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center">
            <FiShoppingBag className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <h3 className="text-base font-medium text-gray-900">Đơn hàng của tôi</h3>
              <p className="text-sm text-gray-500">Xem tất cả đơn hàng và theo dõi trạng thái</p>
            </div>
          </div>
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-gray-500"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default UserOrders; 