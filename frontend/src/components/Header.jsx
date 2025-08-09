// ===== src/components/Header.jsx (REPLACE FILE) =====
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCategories } from '../api/categories';
import { BiUser, BiShoppingBag, BiLogOut, BiLogIn, BiUserPlus, BiMenu, BiX, BiChevronDown } from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './../styles/header.css';


const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openMobileParent, setOpenMobileParent] = useState(null); // toggle children on mobile

  const fetchCategoriesForNav = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('فشل تحميل الفئات لشريط التنقل:', err);
    }
  }, []);

  useEffect(() => { fetchCategoriesForNav(); }, [fetchCategoriesForNav]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('تم تسجيل الخروج بنجاح!');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.');
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const parents = categories.filter(c => !c.parent_id);
  const childrenOf = (pid) => categories.filter(c => c.parent_id === pid);

  return (
    <header className="site-header sticky-top w-100">
      <div className="container-fluid px-3">
        <nav className="header-nav">
          <Link className="brand-logo" to="/" onClick={closeMenu}>لمسة روز</Link>

          {/* Mobile slide-in main menu (pages/auth) */}
          <div className={`nav-menu ${isMenuOpen ? 'is-open' : ''}`}>
            <button className="close-menu-btn d-lg-none" onClick={closeMenu} aria-label="إغلاق القائمة"><BiX size={30} /></button>

            <ul className="nav-links">
              <li><Link to="/" className="nav-link" onClick={closeMenu}>الرئيسية</Link></li>
              <li><Link to="/products" className="nav-link" onClick={closeMenu}>المنتجات</Link></li>
              <li><Link to="/pages/about-us" className="nav-link" onClick={closeMenu}>عن المتجر</Link></li>
              <li><Link to="/pages/contact-us" className="nav-link" onClick={closeMenu}>اتصل بنا</Link></li>
            </ul>

            {/* === Mobile auth/admin actions (VISIBLE only when menu is open) === */}
            <div className="nav-actions-mobile d-lg-none">
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link className="btn-admin mb-2" to="/admin" onClick={closeMenu}>
                      <FaUserShield /> <span>لوحة المسؤول</span>
                    </Link>
                  )}
                  <Link className="btn-action-main" to="/my-account" onClick={closeMenu}>
                    <BiUser /> حسابي
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleLogout(); closeMenu(); }}
                    className="btn-action-secondary"
                  >
                    <BiLogOut /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn-action-main" to="/login" onClick={closeMenu}>
                    <BiLogIn /> تسجيل الدخول
                  </Link>
                  <Link className="btn-action-secondary" to="/register" onClick={closeMenu}>
                    <BiUserPlus /> حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side actions */}
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
                    <button className="nav-link btn btn-link p-0" type="button"><BiUser size={22} /> {user?.username || 'حسابي'} <BiChevronDown/></button>
                    <ul className="dropdown-content">
                      <li><Link to="/my-account" onClick={closeMenu}>لوحة التحكم</Link></li>
                      <li><Link to="/my-account/profile" onClick={closeMenu}>الملف الشخصي</Link></li>
                      <li><Link to="/my-account/orders" onClick={closeMenu}>طلباتي</Link></li>
                      <li><Link to="/my-account/addresses" onClick={closeMenu}>عناويني</Link></li>
                      <li><Link to="/my-account/wishlist" onClick={closeMenu}>قائمة الرغبات</Link></li>
                      {user?.is_admin && (<li><hr/><Link to="/admin" onClick={closeMenu}>لوحة المسؤول</Link></li>)}
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
            <button className="menu-toggle d-lg-none" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen} aria-controls="mobileMenu">
              <BiMenu size={28} />
            </button>
          </div>
        </nav>
      </div>

      {/* Categories navigation bar — visible on all sizes */}
      <div className="category-nav border-top bg-white">
        <div className="container-fluid px-3">
          <ul className="category-list">
            {parents.map(parent => (
              <li key={parent.category_id} className="category-item" aria-haspopup="true">
                <Link to={`/products?category_id=${parent.category_id}`} className="category-link">{parent.name}</Link>

                {/* Desktop mega-menu */}
                <div className="mega-menu d-none d-lg-block" role="menu" aria-label={`أبناء ${parent.name}`}>
                  <div className="row g-3">
                    {childrenOf(parent.category_id).map(child => (
                      <div key={child.category_id} className="col-6 col-xl-3">
                        <Link className="mega-link" to={`/products?category_id=${child.category_id}`}>{child.name}</Link>
                      </div>
                    ))}
                    {childrenOf(parent.category_id).length === 0 && (
                      <div className="col-12 text-muted small">لا توجد أقسام فرعية</div>
                    )}
                  </div>
                </div>

                {/* Mobile children (tap to toggle) */}
                <button
                  type="button"
                  className="btn btn-link p-0 ms-1 d-inline d-lg-none align-middle"
                  aria-label="إظهار الأقسام الفرعية"
                  aria-expanded={openMobileParent === parent.category_id}
                  onClick={() => setOpenMobileParent(p => p === parent.category_id ? null : parent.category_id)}
                >
                  <BiChevronDown />
                </button>
                <div className={`mobile-children d-lg-none ${openMobileParent === parent.category_id ? 'show' : ''}`}>
                  <div className="row g-2">
                    {childrenOf(parent.category_id).map(child => (
                      <div key={child.category_id} className="col-6">
                        <Link className="mega-link" to={`/products?category_id=${child.category_id}`}>{child.name}</Link>
                      </div>
                    ))}
                    {childrenOf(parent.category_id).length === 0 && (
                      <div className="col-12 text-muted small">لا توجد أقسام فرعية</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop-only Admin sidebar shell (if you still use it) */}
   
    </header>
  );
};

export default Header;
