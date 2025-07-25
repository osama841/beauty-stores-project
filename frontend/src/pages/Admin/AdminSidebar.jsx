// src/components/Admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminSidebar.css';

const AdminSidebar = ({ isMobile = false, show = false, onClose = () => {} }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', name: 'لوحة القيادة', icon: 'bi-speedometer2' },
    { path: '/admin/categories', name: 'إدارة الأقسام', icon: 'bi-tags' },
    { path: '/admin/products', name: 'إدارة المنتجات', icon: 'bi-box-seam' },
    { path: '/admin/orders', name: 'إدارة الطلبات', icon: 'bi-receipt' },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: 'bi-people' }, // ****** إضافة رابط إدارة المستخدمين ******
    { path: '/admin/brands', name: 'إدارة العلامات التجارية', icon: 'bi-badge-ad' },
    { path: '/admin/reviews', name: 'إدارة المراجعات', icon: 'bi-star' },
    { path: '/admin/content', name: 'إدارة المحتوى', icon: 'bi-file-earmark-text' },
    { path: '/admin/settings', name: 'إعدادات المتجر', icon: 'bi-gear' },
  ];

  return (
    <div
      className={`admin-sidebar-container ${isMobile ? 'admin-sidebar-mobile' : ''} ${isMobile && show ? 'show' : ''}`}
    >
      {isMobile && (
        <div className="d-flex justify-content-end mb-3">
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
        </div>
      )}
      <Link to="/admin" className="admin-sidebar-header" onClick={onClose}>
        <i className="bi bi-gear-fill"></i>
        <span>لوحة المسؤول</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto admin-sidebar-nav">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link text-white ${location.pathname === item.path ? 'active bg-primary' : 'bg-dark'}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              onClick={onClose}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <hr />
      <div className="dropdown mt-auto">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
          <strong>المشرف</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li><Link className="dropdown-item" to="/my-account" onClick={onClose}>الملف الشخصي</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li><a className="dropdown-item" href="#" onClick={() => {/* دالة تسجيل الخروج */ onClose()}}>تسجيل الخروج</a></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
