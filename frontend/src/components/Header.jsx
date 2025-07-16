// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">متجر الجمال</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">الرئيسية</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">المنتجات</Link>
            </li>
            {isAuthenticated ? (
              <>
                {user?.is_admin && ( // ****** إظهار رابط لوحة تحكم المسؤول إذا كان المستخدم مسؤولاً ******
                  <li className="nav-item">
                    <Link className="nav-link text-danger fw-bold" to="/admin">
                      لوحة المسؤول
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/my-account">
                    حسابي ({user?.first_name || user?.username || user?.email})
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger ms-lg-3"
                  >
                    تسجيل الخروج
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-primary me-2" to="/login">
                    تسجيل الدخول
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-success" to="/register">
                    التسجيل
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                سلة التسوق
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
