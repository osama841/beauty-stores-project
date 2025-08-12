// ===== src/components/header/HeaderNav.jsx =====
import React from 'react';
import { NavLink } from 'react-router-dom';

const HeaderNav = ({ isDesktop = true, onNavigate }) => {
  const navItems = [
    { to: '/', label: 'الرئيسية', end: true },
    { to: '/products', label: 'المنتجات' },
    { to: '/pages/about-us', label: 'عن المتجر' },
    { to: '/pages/contact-us', label: 'اتصل بنا' }
  ];

  return (
    <ul 
      className={`nav-links ${isDesktop ? 'd-none d-lg-flex' : ''}`} 
      role="list"
    >
      {navItems.map((item) => (
        <li key={item.to}>
          <NavLink 
            to={item.to}
            end={item.end}
            className="nav-link"
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default HeaderNav;
