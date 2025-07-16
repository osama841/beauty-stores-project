// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// استيراد الصفحات الأساسية للمستخدم
import Homepage from './pages/Homepage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
// import ProductListingPage from './pages/Products/ProductListingPage'; // تم إزالة استيراد صفحة المنتجات

// استيراد مكونات الهيكل الأساسي
import Header from './components/Header';
import Footer from './components/Footer';

// استيراد سياق المصادقة
import { AuthProvider, useAuth } from './contexts/AuthContext';

// استيراد صفحات ومكونات لوحة تحكم المسؤول
import AdminDashboard from './pages/Admin/AdminDashboard';
import CategoryManagement from './pages/Admin/CategoryManagement';
import ProductManagement from './pages/Admin/ProductManagement'; // ****** استيراد صفحة إدارة المنتجات ******
import AdminLayout from './components/Admin/AdminLayout';


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
          {/* <Route path="/products" element={<ProductListingPage />} /> */}

          {/* مسارات المستخدم المحمية */}
          <Route
            path="/my-account"
            element={
              <PrivateRoute>
                <div className="container text-center mt-5">
                  <h2 className="mb-3">مرحباً بك في حسابك، {user?.first_name || user?.username || user?.email}!</h2>
                  <p className="text-muted">هذه صفحة محمية، مرئية فقط للمستخدمين المصادق عليهم.</p>
                </div>
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
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="products" element={<ProductManagement />} /> {/* ****** إضافة مسار إدارة المنتجات ****** */}
                    {/* أضف مسارات لوحة تحكم المسؤول الأخرى هنا: */}
                    {/* <Route path="orders" element={<OrderManagement />} /> */}
                    {/* <Route path="users" element={<UserManagement />} /> */}
                    {/* <Route path="brands" element={<BrandManagement />} /> */}
                    {/* <Route path="reviews" element={<ReviewManagement />} /> */}
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* مسارات الصفحات الأخرى (قريباً) */}
          <Route path="/products/:id" element={<div className="container text-center mt-5"><p className="text-muted">صفحة تفاصيل المنتج (قريباً)</p></div>} />
          <Route path="/cart" element={<div className="container text-center mt-5"><p className="text-muted">صفحة سلة التسوق (قريباً)</p></div>} />
          <Route path="/checkout" element={<PrivateRoute><div className="container text-center mt-5"><p className="text-muted">صفحة إتمام الشراء (قريباً)</p></div></PrivateRoute>} />
          <Route path="/about-us" element={<div className="container text-center mt-5"><p className="text-muted">صفحة من نحن (قريباً)</p></div>} />
          <Route path="/privacy-policy" element={<div className="container text-center mt-5"><p className="text-muted">صفحة سياسة الخصوصية (قريباً)</p></div>} />
          <Route path="/terms-of-service" element={<div className="container text-center mt-5"><p className="text-muted">صفحة شروط الاستخدام (قريباً)</p></div>} />
          <Route path="/contact-us" element={<div className="container text-center mt-5"><p className="text-muted">صفحة اتصل بنا (قريباً)</p></div>} />
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
