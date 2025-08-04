// src/components/User/UserSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/user/UserSidebar.css';

const UserSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/my-account', name: 'لوحة التحكم', icon: 'bi-speedometer2' },
    { path: '/my-account/profile', name: 'الملف الشخصي', icon: 'bi-person-circle' },
    { path: '/my-account/orders', name: 'طلباتي', icon: 'bi-receipt' },
    { path: '/my-account/addresses', name: 'عناويني', icon: 'bi-geo-alt' },
    { path: '/my-account/wishlist', name: 'قائمة الرغبات', icon: 'bi-heart' }, // ****** إضافة رابط قائمة الرغبات ******
    { path: '/my-account/reviews', name: 'مراجعاتي', icon: 'bi-star' },
  ];

  return (
    <div className="card shadow-sm border-0 rounded-lg p-3 bg-white">
      <div className="text-center mb-4">
        <img src="https://github.com/mdo.png" alt="User Avatar" width="80" height="80" className="rounded-circle mb-2 border border-primary p-1" />
        <h5 className="fw-bold mb-0">{user?.first_name || user?.username || 'المستخدم'}</h5>
        <p className="text-muted small">{user?.email}</p>
      </div>
      <ul className="nav nav-pills flex-column">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active bg-primary text-white' : 'text-dark'}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSidebar;
