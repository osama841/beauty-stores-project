// ===== src/components/header/UserDropdown.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';
import { BiUser, BiChevronDown } from 'react-icons/bi';

const UserDropdown = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="nav-item-dropdown user-dropdown">
      <button
        className="nav-link btn btn-link p-0"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <BiUser size={22} /> {user?.username || "حسابي"}{" "}
        <BiChevronDown />
      </button>
      
      <ul className="dropdown-content" role="menu">
        <li>
          <Link to="/my-account" onClick={onNavigate}>
            لوحة التحكم
          </Link>
        </li>
        <li>
          <Link to="/my-account/profile" onClick={onNavigate}>
            الملف الشخصي
          </Link>
        </li>
        <li>
          <Link to="/my-account/orders" onClick={onNavigate}>
            طلباتي
          </Link>
        </li>
        <li>
          <Link to="/my-account/addresses" onClick={onNavigate}>
            عناويني
          </Link>
        </li>
        <li>
          <Link to="/my-account/wishlist" onClick={onNavigate}>
            قائمة الرغبات
          </Link>
        </li>
        {user?.is_admin && (
          <li>
            <hr />
            <Link to="/admin" onClick={onNavigate}>
              لوحة المسؤول
            </Link>
          </li>
        )}
        <li>
          <hr />
        </li>
        <li>
          <button onClick={onLogout}>تسجيل الخروج</button>
        </li>
      </ul>
    </div>
  );
};

export default UserDropdown;
