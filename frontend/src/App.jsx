// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// استيراد الصفحات الأساسية للمستخدم
import Homepage from './pages/Homepage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductListingPage from './pages/Products/ProductListingPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import ShoppingCartPage from './pages/Cart/ShoppingCartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmationPage from './pages/Checkout/OrderConfirmationPage';
import StaticPage from './pages/StaticPage';

// استيراد مكونات الهيكل الأساسي
import Header from './components/Header';
import Footer from './components/Footer';

// استيراد سياق المصادقة
import { AuthProvider, useAuth } from './contexts/AuthContext';

// استيراد صفحات ومكونات لوحة تحكم المسؤول
import AdminDashboard from './pages/Admin/AdminDashboard';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import BrandManagement from './pages/Admin/BrandManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import UserManagement from './pages/Admin/UserManagement';
import ReviewManagement from './pages/Admin/ReviewManagement';
import ContentManagement from './pages/Admin/ContentManagement';
import DiscountManagement from './pages/Admin/DiscountManagement'; // ****** استيراد صفحة إدارة الخصومات ******
import AdminLayout from './components/Admin/AdminLayout';

// استيراد صفحات ومكونات لوحة تحكم المستخدم
import UserDashboard from './pages/MyAccount/UserDashboard';
import UserProfile from './pages/MyAccount/UserProfile';
import UserAddresses from './pages/MyAccount/UserAddresses';
import UserOrders from './pages/MyAccount/UserOrders';
import UserWishlist from './pages/MyAccount/UserWishlist';
import UserLayout from './components/User/UserLayout';


// مكون لحماية المسارات العامة التي تتطلب مصادقة
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحقق من المصادقة...</span>
        </div>
        <p className="ms-3 text-secondary">جاري التحقق من المصادقة...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// مكون لحماية المسارات الإدارية (يتطلب مصادقة وأن يكون المستخدم مسؤولاً)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحقق من الصلاحيات...</span>
        </div>
        <p className="ms-3 text-secondary">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// هذا المكون يحتوي على جميع المسارات ومكونات الهيكل الرئيسية
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <Routes>
          {/* مسارات المستخدم العامة */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* مسارات لوحة تحكم المستخدم المحمية */}
          <Route
            path="/my-account/*"
            element={
              <PrivateRoute>
                <UserLayout>
                  <Routes>
                    <Route index element={<UserDashboard />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="orders" element={<UserOrders />} />
                    <Route path="addresses" element={<UserAddresses />} />
                    <Route path="wishlist" element={<UserWishlist />} />
                  </Routes>
                </UserLayout>
              </PrivateRoute>
            }
          />

          {/* مسارات لوحة تحكم المسؤول المحمية */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="brands" element={<BrandManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="reviews" element={<ReviewManagement />} />
                    <Route path="content" element={<ContentManagement />} />
                    <Route path="discounts" element={<DiscountManagement />} /> {/* ****** إضافة مسار إدارة الخصومات ****** */}
                    {/* أضف مسارات لوحة تحكم المسؤول الأخرى هنا: */}
                    {/* <Route path="settings" element={<StoreSettings />} /> */}
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* مسارات الصفحات الأخرى (Checkout Flow) */}
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/about-us" element={<StaticPage slug="about-us" />} />
          <Route path="/privacy-policy" element={<StaticPage slug="privacy-policy" />} />
          <Route path="/terms-of-service" element={<StaticPage slug="terms-of-service" />} />
          <Route path="/contact-us" element={<StaticPage slug="contact-us" />} />
          <Route path="/forgot-password" element={<div className="container text-center mt-5"><p className="text-muted">صفحة نسيت كلمة المرور (قريباً)</p></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
