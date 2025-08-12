// ===== src/components/header/MobileMenu.jsx =====
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BiX, 
  BiUser, 
  BiLogOut, 
  BiLogIn, 
  BiUserPlus 
} from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';
import HeaderNav from './HeaderNav';

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  isAuthenticated, 
  user, 
  onLogout 
}) => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (window.innerWidth < 992) {
      // على الجوال: إطلاق حدث لفتح سايدبار الأدمن
      window.dispatchEvent(new CustomEvent("open-admin-overlay"));
    } else {
      // على الديسكتوب: انتقال عادي
      navigate("/admin/dashboard");
    }
  };

  return (
    <div
      id="mobileMenu"
      className={`nav-menu d-lg-none ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      {/* زر الإغلاق */}
      <button
        className="close-menu-btn"
        onClick={onClose}
        aria-label="إغلاق القائمة"
      >
        <BiX size={30} />
      </button>

      {/* روابط التنقل */}
      <HeaderNav isDesktop={false} onNavigate={onClose} />

      {/* أزرار المصادقة والحساب (للجوال فقط) */}
      <div className="nav-actions-mobile">
        {isAuthenticated ? (
          <>
            {user?.is_admin && (
              <button
                type="button"
                className="btn-admin"
                onClick={handleAdminClick}
              >
                <FaUserShield /> <span>لوحة المسؤول</span>
              </button>
            )}

            <Link
              className="btn-action-main"
              to="/my-account"
              onClick={onClose}
            >
              <BiUser /> حسابي
            </Link>
            
            <button
              type="button"
              onClick={onLogout}
              className="btn-action-secondary"
            >
              <BiLogOut /> تسجيل الخروج
            </button>
          </>
        ) : (
          <>
            <Link
              className="btn-action-main"
              to="/login"
              onClick={onClose}
            >
              <BiLogIn /> تسجيل الدخول
            </Link>
            
            <Link
              className="btn-action-secondary"
              to="/register"
              onClick={onClose}
            >
              <BiUserPlus /> حساب جديد
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
