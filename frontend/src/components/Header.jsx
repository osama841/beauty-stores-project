import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCategories } from '../api/categories';
import { BiUser, BiShoppingBag, BiLogOut, BiLogIn, BiUserPlus, BiSearch } from 'react-icons/bi';
import { FaUserShield } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky-top shadow-sm bg-white">
      {/* Top Bar */}
      <div className="top-bar bg-purple text-white py-2 d-none d-lg-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <a href="tel:+1234567890" className="text-white text-decoration-none small">
              <i className="bi bi-telephone me-2"></i> +123 456 7890
            </a>
            <a href="mailto:info@beautystore.com" className="text-white text-decoration-none small">
              <i className="bi bi-envelope me-2"></i> info@beautystore.com
            </a>
          </div>
          <div className="d-flex gap-3">
            <a href="#" className="text-white"><i className="bi bi-facebook"></i></a>
            <a href="#" className="text-white"><i className="bi bi-instagram"></i></a>
            <a href="#" className="text-white"><i className="bi bi-twitter"></i></a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
        <div className="container">
          {/* Brand and Toggler */}
          <div className="d-flex align-items-center">
            <button
              className="navbar-toggler me-3 border-0"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <Link className="navbar-brand fw-bold fs-3" to="/" style={{ color: '#6f42c1' }}>
              <span className="d-flex align-items-center">
                <i className="bi bi-flower1 me-2"></i> لمسة روز
              </span>
            </Link>
          </div>

          {/* Mobile Quick Icons */}
          <div className="d-lg-none">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-link text-dark p-0" onClick={() => document.getElementById('searchModal').showModal()}>
                <BiSearch size={20} />
              </button>
              <Link to="/cart" className="btn btn-link text-dark position-relative p-0">
                <BiShoppingBag size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  0
                </span>
              </Link>
              {isAuthenticated ? (
                <Link to="/my-account" className="btn btn-link text-dark p-0">
                  <BiUser size={20} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-link text-dark p-0">
                  <BiLogIn size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* Full Menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link px-3" to="/" onClick={() => setIsMenuOpen(false)}>
                  الرئيسية
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/products" onClick={() => setIsMenuOpen(false)}>
                  المنتجات
                </Link>
              </li>
              {categories.length > 0 && (
                <li className="nav-item dropdown">
                  <a className="nav-link px-3 dropdown-toggle" href="#" id="navbarDropdownCategories" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    الفئات
                  </a>
                  <ul className="dropdown-menu shadow-sm border-0" aria-labelledby="navbarDropdownCategories">
                    {categories.map(cat => (
                      <li key={cat.category_id}>
                        <Link 
                          className="dropdown-item py-2" 
                          to={`/products?category_id=${cat.category_id}`} 
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="bi bi-dot me-1"></i> {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link px-3" to="/about" onClick={() => setIsMenuOpen(false)}>
                  عن المتجر
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3" to="/contact" onClick={() => setIsMenuOpen(false)}>
                  اتصل بنا
                </Link>
              </li>
            </ul>

            {/* Right Side Elements */}
            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 ms-lg-3">
              {/* Search Form - Desktop */}
              <form onSubmit={handleSearch} className="d-none d-lg-flex me-2">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-end-0 rounded-pill"
                    placeholder="ابحث عن منتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ minWidth: '250px' }}
                  />
                  <button className="btn btn-purple rounded-pill px-3" type="submit">
                    <BiSearch size={18} />
                  </button>
                </div>
              </form>

              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUserShield /> لوحة التحكم
                    </Link>
                  )}
                  <div className="dropdown">
                    <button 
                      className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center" 
                      id="userDropdown" 
                      data-bs-toggle="dropdown"
                    >
                      <div className="avatar-sm bg-purple-light text-purple rounded-circle d-flex align-items-center justify-content-center me-2">
                        {user?.first_name?.[0] || user?.username?.[0] || user?.email?.[0]}
                      </div>
                      <span className="d-none d-lg-inline">
                        {user?.first_name || user?.username || user?.email}
                      </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                      <li>
                        <Link className="dropdown-item" to="/my-account" onClick={() => setIsMenuOpen(false)}>
                          <i className="bi bi-person me-2"></i> حسابي
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/my-orders" onClick={() => setIsMenuOpen(false)}>
                          <i className="bi bi-bag me-2"></i> طلباتي
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item text-danger" 
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> تسجيل الخروج
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    className="btn btn-outline-purple d-flex align-items-center gap-2"
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BiLogIn /> تسجيل الدخول
                  </Link>
                  <Link
                    className="btn btn-purple d-flex align-items-center gap-2"
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BiUserPlus /> إنشاء حساب
                  </Link>
                </>
              )}
              {/* Shopping Cart - Desktop */}
              <Link
                to="/cart"
                className="btn btn-outline-dark position-relative d-none d-lg-flex align-items-center gap-2"
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

      {/* Mobile Search Modal */}
      <dialog id="searchModal" className="modal fade" style={{ top: '20%' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0">
              <h5 className="modal-title">بحث عن منتجات</h5>
              <button type="button" className="btn-close" onClick={() => document.getElementById('searchModal').close()}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSearch}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ابحث عن منتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-purple" type="submit">
                    <BiSearch size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
};

export default Header;