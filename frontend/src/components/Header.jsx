import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCategories } from '../api/categories';
import { BiUser, BiShoppingBag, BiLogOut, BiLogIn, BiUserPlus, BiMenu, BiX, BiChevronDown } from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';
import './../styles/header.css';// استيراد ملف التصميم الجديد

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchCategoriesForNav = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('فشل تحميل الفئات لشريط التنقل:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesForNav();
  }, [fetchCategoriesForNav]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.');
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header sticky-top">
      <div className="container">
        <nav className="header-nav">
          <Link className="brand-logo" to="/" onClick={closeMenu}>
            لمسة روز
          </Link>

          <div className={`nav-menu ${isMenuOpen ? 'is-open' : ''}`}>
            <button className="close-menu-btn d-lg-none" onClick={closeMenu}><BiX size={30} /></button>
            <ul className="nav-links">
              <li><Link to="/" className="nav-link" onClick={closeMenu}>الرئيسية</Link></li>
              <li><Link to="/products" className="nav-link" onClick={closeMenu}>المنتجات</Link></li>
              {categories.length > 0 && (
                <li className="nav-item-dropdown">
                  <a className="nav-link" href="#">الفئات <BiChevronDown /></a>
                  <ul className="dropdown-content">
                    {categories.map(cat => (
                      <li key={cat.category_id}>
                        <Link to={`/products?category_id=${cat.category_id}`} onClick={closeMenu}>
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li><Link to="/about" className="nav-link" onClick={closeMenu}>عن المتجر</Link></li>
              <li><Link to="/contact" className="nav-link" onClick={closeMenu}>اتصل بنا</Link></li>
            </ul>
             {/* --- User Actions for Mobile --- */}
            <div className="nav-actions-mobile d-lg-none">
              {isAuthenticated ? (
                <>
                  <Link className="btn-action-main" to="/my-account" onClick={closeMenu}><BiUser/> حسابي</Link>
                  <button onClick={() => { handleLogout(); closeMenu(); }} className="btn-action-secondary"><BiLogOut/> تسجيل الخروج</button>
                </>
              ) : (
                <>
                  <Link className="btn-action-main" to="/login" onClick={closeMenu}><BiLogIn/> تسجيل الدخول</Link>
                  <Link className="btn-action-secondary" to="/register" onClick={closeMenu}><BiUserPlus/> حساب جديد</Link>
                </>
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="d-none d-lg-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                   {user?.is_admin && (
                    <Link className="btn-admin" to="/admin" onClick={closeMenu}>
                      <FaUserShield /> <span>لوحة المسؤول</span>
                    </Link>
                  )}
                  <div className="nav-item-dropdown user-dropdown">
                     <a className="nav-link" href="#"><BiUser size={22} /> {user?.username || 'حسابي'} <BiChevronDown/></a>
                     <ul className="dropdown-content">
                        <li><Link to="/my-account" onClick={closeMenu}>لوحة التحكم</Link></li>
                        <li><Link to="/my-account/profile" onClick={closeMenu}>الملف الشخصي</Link></li>
                        <li><Link to="/my-account/orders" onClick={closeMenu}>طلباتي</Link></li>
                        <li><hr/></li>
                        <li><button onClick={() => { handleLogout(); closeMenu(); }}>تسجيل الخروج</button></li>
                     </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link className="btn-action-main" to="/login" onClick={closeMenu}><BiLogIn/> تسجيل الدخول</Link>
                  <Link className="btn-action-secondary" to="/register" onClick={closeMenu}><BiUserPlus/> حساب جديد</Link>
                </>
              )}
            </div>
             <Link to="/cart" className="cart-icon" onClick={closeMenu}>
                <BiShoppingBag size={26} />
                <span className="cart-badge">0</span>
            </Link>
            <button className="menu-toggle d-lg-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <BiMenu size={28} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;