// ===== src/App.jsx =====
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// صفحات المستخدم العامة
import Homepage from './pages/Homepage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductListingPage from './pages/Products/ProductListingPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import ShoppingCartPage from './pages/Cart/ShoppingCartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmationPage from './pages/Checkout/OrderConfirmationPage';
import StaticPage from './pages/StaticPage';

// الهيكل العام
import Header from './components/Header';
import Footer from './components/Footer';

// المصادقة
import { AuthProvider, useAuth } from './contexts/AuthContext';

// لوحة الأدمن
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import BrandManagement from './pages/Admin/BrandManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import UserManagement from './pages/Admin/UserManagement';
import ReviewManagement from './pages/Admin/ReviewManagement';
import ContentManagement from './pages/Admin/ContentManagement';
import DiscountManagement from './pages/Admin/DiscountManagement';
import AdminSidebar from './pages/Admin/AdminSidebar'; // للجوال العالمي فقط

// لوحة حساب المستخدم
import UserLayout from './components/User/UserLayout';
import UserDashboard from './pages/MyAccount/UserDashboard';
import UserProfile from './pages/MyAccount/UserProfile';
import UserAddresses from './pages/MyAccount/UserAddresses';
import UserOrders from './pages/MyAccount/UserOrders';
import UserWishlist from './pages/MyAccount/UserWishlist';

// السلة (المزوّد الجديد)
import { CartProvider } from './contexts/CartContext';

// نظام الإشعارات
import { ToastProvider } from './components/common/Toast';

// حمايات المسارات
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحقق من المصادقة...</span>
        </div>
        <p className="mt-3 text-muted">جاري التحقق من المصادقة...</p>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحقق من الصلاحيات...</span>
        </div>
        <p className="mt-3 text-muted">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }
  if (!isAuthenticated || !user?.is_admin) return <Navigate to="/" replace />;
  return children;
};

// محتوى التطبيق
const AppContent = () => {
  return (
    <div className="app-container">
      <Header />

      {/* ✅ نسخة الجوال من سايدبار الأدمن، متاحة بكل الصفحات وتفتح عبر حدث open-admin-overlay */}
      <AdminSidebar mode="mobile" />

      <main className="main-content">
        <Suspense fallback={
          <div className="app-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
          </div>
        }>
          <Routes>
            {/* عامة */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* حسابي (خاص) */}
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

            {/* الأدمن (خاص) + نسخة الديسكتوب داخل الـLayout فقط */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="categories" element={<CategoryManagement />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="brands" element={<BrandManagement />} />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="reviews" element={<ReviewManagement />} />
                      <Route path="content" element={<ContentManagement />} />
                      <Route path="discounts" element={<DiscountManagement />} />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* السلة والتشيك أوت */}
            <Route path="/cart" element={<ShoppingCartPage />} />
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

            {/* الصفحات الثابتة */}
            <Route path="/pages/:slug" element={<StaticPage />} />
            <Route path="/about-us" element={<Navigate to="/pages/about-us" replace />} />
            <Route path="/privacy-policy" element={<Navigate to="/pages/privacy-policy" replace />} />
            <Route path="/terms-of-service" element={<Navigate to="/pages/terms-of-service" replace />} />
            <Route path="/contact-us" element={<Navigate to="/pages/contact-us" replace />} />

            <Route path="/forgot-password" element={
              <div className="container text-center mt-5">
                <p className="text-muted">صفحة نسيت كلمة المرور (قريباً)</p>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      {/* ✅ Auth أولاً، ثم Cart، ثم Toast */}
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;