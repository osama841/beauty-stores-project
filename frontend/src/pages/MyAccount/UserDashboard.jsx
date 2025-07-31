// src/pages/MyAccount/UserDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/user/UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="card shadow-lg border-0 rounded-lg p-4 bg-white">
      <h1 className="mb-4 fw-bold text-primary">مرحباً بك، {user?.first_name || user?.username || 'المستخدم'}!</h1>
      <p className="text-muted lead">من هنا يمكنك إدارة ملفك الشخصي، طلباتك، وعناوينك.</p>

      <div className="row g-4 mt-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm border-0 rounded-lg p-3 text-center">
            <i className="bi bi-person-circle fs-1 text-info mb-3"></i>
            <h5 className="fw-bold mb-2">الملف الشخصي</h5>
            <p className="text-muted small">تعديل معلوماتك الشخصية وكلمة المرور.</p>
            <Link to="/my-account/profile" className="btn btn-info mt-auto">
              تعديل الملف الشخصي
            </Link>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 shadow-sm border-0 rounded-lg p-3 text-center">
            <i className="bi bi-receipt fs-1 text-success mb-3"></i>
            <h5 className="fw-bold mb-2">طلباتي</h5>
            <p className="text-muted small">عرض سجل طلباتك وتتبع حالتها.</p>
            <Link to="/my-account/orders" className="btn btn-success mt-auto">
              عرض الطلبات
            </Link>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 shadow-sm border-0 rounded-lg p-3 text-center">
            <i className="bi bi-geo-alt fs-1 text-warning mb-3"></i>
            <h5 className="fw-bold mb-2">عناويني</h5>
            <p className="text-muted small">إدارة عناوين الشحن والفواتير.</p>
            <Link to="/my-account/addresses" className="btn btn-warning mt-auto">
              إدارة العناوين
            </Link>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 shadow-sm border-0 rounded-lg p-3 text-center">
            <i className="bi bi-heart fs-1 text-danger mb-3"></i>
            <h5 className="fw-bold mb-2">قائمة الرغبات</h5>
            <p className="text-muted small">المنتجات التي ترغب في شرائها لاحقاً.</p>
            <Link to="/my-account/wishlist" className="btn btn-danger mt-auto">
              عرض قائمة الرغبات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
