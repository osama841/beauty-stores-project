// ===== src/components/header/HeaderLogo.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = ({ onNavigate }) => {
  return (
    <Link 
      className="brand-logo" 
      to="/" 
      onClick={onNavigate}
      aria-label="الصفحة الرئيسية - لمسة روز"
    >
      لمسة روز
    </Link>
  );
};

export default HeaderLogo;
