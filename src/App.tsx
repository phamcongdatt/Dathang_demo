import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NoticationContext';

// User pages
import Home from './pages/user/components/Home';
import Stores from './pages/user/components/Stores';
import Menus from './pages/user/components/Menus';
import Cart from './pages/user/components/Cart';
import Orders from './pages/user/components/Orders';
import Profile from './pages/user/components/Profile';
import Wishlist from './pages/user/components/Wishlist';
import Review from './pages/user/components/Review';
import Search from './pages/user/components/Search';
import Location from './pages/user/components/Location';
import Payment from './pages/user/components/Payment';
import Notification from './pages/user/components/Notification';
import Login from './pages/user/components/Login';
import Register from './pages/user/components/Register';
import ProductDetail from './pages/user/components/ProductDetail';
import RegisterStore from './pages/user/components/RegisterStore';
import PaymentSuccess from './pages/user/components/PaymentSuccess';
import PaymentFailed from './pages/user/components/PaymentFailed';
import Checkout from './pages/user/Checkout';
import ShippingInfo from './pages/user/ShippingInfo';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import MyStores from './pages/seller/MyStores';
import StoreMenus from './pages/seller/StoreMenus';
import StoreOrders from './pages/seller/StoreOrders';
import StoreRevenue from './pages/seller/StoreRevenue';
import StoreReview from './pages/seller/StoreReview';
import AddMenu from './pages/seller/AddMenu'; 
import EditMenu from './pages/seller/EditMenu';
import StoreCategory from './pages/seller/Store-Category';
import AddCategory from './pages/seller/AddCategory';
import EditCategory from './pages/seller/EditCategory';
import StoreNotification from './pages/seller/StoreNotification';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageMenu from './pages/admin/ManageMenu';
import ManageSettings from './pages/admin/ManageSettings';

function App() {
  return (
    <CartProvider>
      <NotificationProvider> {/* Thêm NotificationProvider */}
        <Routes>
          {/* User routes */}
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/review" element={<Review />} />
          <Route path="/search" element={<Search />} />
          <Route path="/location" element={<Location />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register-store" element={<RegisterStore />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/Shipping-info" element={<ShippingInfo />} />

          {/* Seller routes */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/mystores" element={<MyStores />} />
          <Route path="/seller/store-menus" element={<StoreMenus />} />
          <Route path="/seller/StoreOrders" element={<StoreOrders />} />
          <Route path="/seller/revenue" element={<StoreRevenue />} />
          <Route path="/seller/review" element={<StoreReview />} />
          <Route path="/seller/add-menu" element={<AddMenu />} />
          <Route path="/seller/menus/edit/:id" element={<EditMenu />} />
          <Route path="/seller/store-category" element={<StoreCategory />} />
          <Route path="/seller/add-category" element={<AddCategory />} />
          <Route path="/seller/edit-category/:id" element={<EditCategory />} />
          <Route path="/seller/store-notification" element={<StoreNotification />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/ManageUsers" element={<ManageUsers />} />
          <Route path="/admin/ManageStores" element={<ManageStores />} />
          <Route path="/admin/ManageOrders" element={<ManageOrders />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/ManageMenu" element={<ManageMenu />} />
          <Route path= "/admin/ManageSettings" element={<ManageSettings />} />
        </Routes>
      </NotificationProvider>
    </CartProvider>
  );
}

export default App;