// src/components/Admin/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', name: 'لوحة القيادة', icon: 'bi-speedometer2' },
    { path: '/admin/categories', name: 'إدارة الأقسام', icon: 'bi-tags' },
    { path: '/admin/products', name: 'إدارة المنتجات', icon: 'bi-box-seam' }, // ****** إضافة رابط المنتجات ******
    { path: '/admin/orders', name: 'إدارة الطلبات', icon: 'bi-receipt' },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: 'bi-people' },
    { path: '/admin/brands', name: 'إدارة العلامات التجارية', icon: 'bi-badge-ad' },
    { path: '/admin/reviews', name: 'إدارة المراجعات', icon: 'bi-star' },
    { path: '/admin/content', name: 'إدارة المحتوى', icon: 'bi-file-earmark-text' },
    { path: '/admin/settings', name: 'إعدادات المتجر', icon: 'bi-gear' },
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white vh-100" style={{ width: '280px' }}>
      <Link to="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <i className="bi bi-gear-fill me-2 fs-4"></i>
        <span className="fs-5 fw-bold">لوحة المسؤول</span>
      </Link>
      <hr className="bg-secondary" />
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link text-white ${location.pathname === item.path ? 'active bg-primary' : 'bg-dark'}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <hr className="bg-secondary" />
      <div className="dropdown">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
          <strong>المشرف</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li><Link className="dropdown-item" to="/my-account">الملف الشخصي</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li><a className="dropdown-item" href="#" onClick={() => {/* دالة تسجيل الخروج */}}>تسجيل الخروج</a></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
