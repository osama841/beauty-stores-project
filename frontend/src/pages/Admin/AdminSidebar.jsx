// src/pages/Admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin/AdminSidebar.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر

const AdminSidebar = ({ isMobile = false, show = false, onClose = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

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
  ];

  return (
    <nav
      className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark admin-sidebar-container 
                  ${isMobile ? 'admin-sidebar-mobile' : 'd-none d-lg-flex'} 
                  ${isMobile && show ? 'show' : ''}`}
      style={{ width: '280px', backgroundColor: '#343a40', fontFamily: 'Tajawal, Cairo, sans-serif' }} // لون خلفية أغمق للشريط الجانبي
    >
      {isMobile && (
        <div className="d-flex justify-content-end mb-3">
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
        </div>
      )}

      <Link to="/admin/dashboard" className="admin-sidebar-header text-decoration-none d-flex align-items-center mb-3" onClick={onClose}>
        <i className="bi bi-gear-fill fs-4 me-2" style={{ color: '#6a8eec' }}></i> {/* لون أيقونة مميز */}
        <span className="fs-5 fw-bold" style={{ color: '#ffffff' }}>لوحة المسؤول</span>
      </Link>
      <hr style={{ borderColor: '#495057' }} /> {/* لون خط فاصل متناسق */}

      <ul className="nav nav-pills flex-column mb-auto admin-sidebar-nav">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link text-white d-flex align-items-center gap-2 rounded-lg 
                          ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              style={{ 
                backgroundColor: location.pathname.startsWith(item.path) ? '#6a8eec' : 'transparent', // لون نشط
                color: location.pathname.startsWith(item.path) ? '#ffffff' : '#e9ecef', // لون نص نشط وغير نشط
                transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
              }}
              aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
              onClick={onClose}
            >
              <i className={`bi ${item.icon} fs-5`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <hr style={{ borderColor: '#495057' }} />

      <div className="dropdown mt-auto admin-sidebar-user-dropdown">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
          <img src={user?.profile_picture || "https://via.placeholder.com/32/FFFFFF/000000?text=AD"} alt="User" width="32" height="32" className="rounded-circle me-2 border border-light" />
          <strong>{user?.name || "المشرف"}</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1" style={{ backgroundColor: '#495057' }}> {/* خلفية قائمة منسدلة أغمق */}
          <li><Link className="dropdown-item" to="/admin/profile" onClick={onClose} style={{ color: '#e9ecef' }}>الملف الشخصي</Link></li>
          <li><hr className="dropdown-divider" style={{ borderColor: '#6c757d' }} /></li>
          <li><a className="dropdown-item" href="#" onClick={() => { logout(); onClose(); }} style={{ color: '#e74c3c' }}>تسجيل الخروج</a></li> {/* لون تسجيل الخروج */}
        </ul>
      </div>
    </nav>
  );
};

export default AdminSidebar;