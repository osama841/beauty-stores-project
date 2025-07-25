// src/components/Header.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCategories } from '../api/categories';
import { BiUser, BiShoppingBag, BiLogOut, BiLogIn, BiUserPlus } from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky-top shadow-sm">
      {/* شريط الهيدر الرئيسي */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          {/* العلامة التجارية وزر القائمة */}
          <div className="d-flex align-items-center">
            <button
              className="navbar-toggler me-3 border-0"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <Link className="navbar-brand fw-bold text-primary fs-4" to="/">
              متجر الجمال
            </Link>
          </div>

          {/* أيقونات الجوال السريعة */}
          <div className="d-lg-none">
            <div className="d-flex align-items-center">
              <Link to="/cart" className="btn btn-link text-dark position-relative me-2">
                <BiShoppingBag size={24} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                </span>
              </Link>
              {isAuthenticated ? (
                <Link to="/my-account" className="btn btn-link text-dark">
                  <BiUser size={24} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-link text-dark">
                  <BiLogIn size={24} />
                </Link>
              )}
            </div>
          </div>

          {/* القائمة الكاملة */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => setIsMenuOpen(false)}>
                  الرئيسية
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products" onClick={() => setIsMenuOpen(false)}>
                  المنتجات
                </Link>
              </li>
              {categories.length > 0 && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownCategories" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    الفئات
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdownCategories">
                    {categories.map(cat => (
                      <li key={cat.category_id}>
                        <Link className="dropdown-item" to={`/products?category_id=${cat.category_id}`} onClick={() => setIsMenuOpen(false)}>
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link" to="/about" onClick={() => setIsMenuOpen(false)}>
                  عن المتجر
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact" onClick={() => setIsMenuOpen(false)}>
                  اتصل بنا
                </Link>
              </li>
            </ul>

            {/* عناصر الجانب الأيمن */}
            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUserShield /> لوحة المسؤول
                    </Link>
                  )}
                  <div className="d-flex align-items-center gap-2">
                    <BiUser className="text-primary" />
                    <span className="text-muted">
                      {user?.first_name || user?.username || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2"
                  >
                    <BiLogOut /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="btn btn-primary d-flex align-items-center gap-2"
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BiLogIn /> تسجيل الدخول
                  </Link>
                  <Link
                    className="btn btn-success d-flex align-items-center gap-2"
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BiUserPlus /> التسجيل
                  </Link>
                </>
              )}
              {/* زر سلة التسوق للشاشات الكبيرة */}
              <Link
                to="/cart"
                className="btn btn-warning position-relative d-none d-lg-flex align-items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BiShoppingBag /> سلة التسوق
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
