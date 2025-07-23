import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiSettings
} from 'react-icons/fi';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Tổng quan', icon: <FiHome />, path: '/admin/Dashboard' },
    { id: 'users', label: 'Tài khoản', icon: <FiUsers />, path: '/admin/ManageUsers' },
    { id: 'categories', label: 'Danh mục', icon: <FiPackage />, path: '/admin/categories'},
    { id: 'products', label: 'Sản phẩm', icon: <FiPackage />, path: '/admin/ManageMenu' },
    { id: 'stores', label: 'Cửa hàng', icon: <FiShoppingBag />, path: '/admin/ManageStores' },
    { id: 'orders', label: 'Đơn hàng', icon: <FiDollarSign />, path: '/admin/ManageOrders' },
    { id: 'settings', label: 'Cài đặt', icon: <FiSettings />, path: '/admin/ManageSettings' }
  ];

  const handleClick = (item: MenuItem) => {
    setActiveTab(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Quản lý Admin</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors
                  ${activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
