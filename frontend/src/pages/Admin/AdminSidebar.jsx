// src/pages/Admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // ****** استيراد useAuth ******

const AdminSidebar = ({ isMobile = false, show = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useAuth(); // ****** جلب user و logout من السياق ******

  // قائمة عناصر التنقل في الشريط الجانبي
  const navItems = [
    { path: '/admin/dashboard', name: 'لوحة القيادة', icon: 'bi-speedometer2' },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: 'bi-people' },
    { path: '/admin/products', name: 'إدارة المنتجات', icon: 'bi-box-seam' },
    { path: '/admin/categories', name: 'إدارة الأقسام', icon: 'bi-tags' },
    { path: '/admin/brands', name: 'إدارة العلامات التجارية', icon: 'bi-badge-ad' },
    { path: '/admin/orders', name: 'إدارة الطلبات', icon: 'bi-receipt' },
    { path: '/admin/reviews', name: 'إدارة المراجعات', icon: 'bi-star' },
    { path: '/admin/content', name: 'إدارة المحتوى', icon: 'bi-file-earmark-text' },
    { path: '/admin/discounts', name: 'إدارة الخصومات', icon: 'bi-percent' },
    // { path: '/admin/settings', name: 'إعدادات المتجر', icon: 'bi-gear' },
  ];

  return (
    <nav
      className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark admin-sidebar-container 
                  ${isMobile ? 'admin-sidebar-mobile' : 'd-none d-lg-flex'} 
                  ${isMobile && show ? 'show' : ''}`}
      style={{ width: '280px' }} 
    >
      {/* زر الإغلاق للشريط الجانبي على الجوال */}
      {isMobile && (
        <div className="d-flex justify-content-end mb-3">
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
        </div>
      )}

      {/* رأس الشريط الجانبي - لوحة المسؤول */}
      <Link to="/admin/dashboard" className="admin-sidebar-header" onClick={onClose}>
        <i className="bi bi-gear-fill fs-4 me-2"></i>
        <span className="fs-5 fw-bold">لوحة المسؤول</span>
      </Link>
      <hr />

      {/* قائمة الروابط الرئيسية */}
      <ul className="nav nav-pills flex-column mb-auto admin-sidebar-nav">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              // استخدم startsWith لتنشيط الرابط لجميع المسارات الفرعية (مثل /admin/products/create)
              // إزالة bg-dark من هنا، ودع CSS يتحكم في لون الخلفية الافتراضي للروابط غير النشطة
              className={`nav-link text-white d-flex align-items-center gap-2 ${location.pathname.startsWith(item.path) ? 'active bg-primary' : ''}`}
              aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
              onClick={onClose}
            >
              <i className={`bi ${item.icon} fs-5`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <hr />

      {/* قسم المستخدم في الأسفل (القائمة المنسدلة) */}
      <div className="dropdown mt-auto admin-sidebar-user-dropdown"> {/* أضفنا فئة هنا */}
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
          {/* صورة المستخدم الفعلي */}
          <img src={user?.profile_picture || "https://via.placeholder.com/32/FFFFFF/000000?text=AD"} alt="User" width="32" height="32" className="rounded-circle me-2" />
          <strong>{user?.name || "المشرف"}</strong> {/* اسم المستخدم الفعلي */}
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          {/* رابط الملف الشخصي للمسؤول */}
          <li><Link className="dropdown-item" to="/admin/profile" onClick={onClose}>الملف الشخصي</Link></li>
          <li><hr className="dropdown-divider" /></li>
          {/* دالة تسجيل الخروج الفعلية */}
          <li><a className="dropdown-item" href="#" onClick={() => { logout(); onClose(); }}>تسجيل الخروج</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminSidebar;