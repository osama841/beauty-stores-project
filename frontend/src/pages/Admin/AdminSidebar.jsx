// ===== src/pages/Admin/AdminSidebar.jsx =====
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin/AdminSidebar.css';

const AdminSidebar = ({ mode = 'desktop' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', name: 'لوحة القيادة', icon: 'bi-speedometer2' },
    { path: '/admin/users', name: 'إدارة المستخدمين', icon: 'bi-people' },
    { path: '/admin/products', name: 'إدارة المنتجات', icon: 'bi-box-seam' },
    { path: '/admin/categories', name: 'إدارة الأقسام', icon: 'bi-tags' },
    { path: '/admin/brands', name: 'إدارة العلامات التجارية', icon: 'bi-badge-ad' },
    { path: '/admin/orders', name: 'إدارة الطلبات', icon: 'bi-receipt' },
    { path: '/admin/reviews', name: 'إدارة المراجعات', icon: 'bi-star' },
    { path: '/admin/content', name: 'إدارة المحتوى', icon: 'bi-file-earmark-text' },
    { path: '/admin/discounts', name: 'إدارة الخصومات', icon: 'bi-percent' },
  ];

  // للجوال فقط
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (mode !== 'mobile') return; // لا تركب المستمعين إلا إذا كنا في وضع الجوال
    const open = () => setMobileOpen(true);
    const close = () => setMobileOpen(false);
    window.addEventListener('open-admin-overlay', open);
    window.addEventListener('close-admin-overlay', close);
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('open-admin-overlay', open);
      window.removeEventListener('close-admin-overlay', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'mobile') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, mode]);

  const go = (to) => { setMobileOpen(false); navigate(to); };

  return (
    <>
      {/* Desktop ONLY */}
      {mode === 'desktop' && (
        <nav className="admin-sidebar d-none d-lg-flex" aria-label="شريط تنقل لوحة التحكم">
          <div className="admin-sidebar__inner">
            <NavLink to="/admin/dashboard" className="admin-sidebar__brand text-decoration-none">
              <i className="bi bi-gear-fill"></i><span>لوحة المسؤول</span>
            </NavLink>

            <ul className="admin-sidebar__nav" role="list">
              {navItems.map((item) => (
                <li key={item.path} className="admin-sidebar__item">
                  <NavLink to={item.path}
                    className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
                    end={false}>
                    <i className={`bi ${item.icon}`}></i><span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="admin-sidebar__user dropdown mt-auto">
              <button className="admin-sidebar__userbtn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={user?.profile_picture || 'https://via.placeholder.com/32/FFFFFF/000000?text=AD'} alt="User" width="32" height="32" className="rounded-circle border" />
                <strong>{user?.name || 'المشرف'}</strong>
              </button>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow admin-sidebar__dropdown">
                <li><NavLink className="dropdown-item" to="/admin/profile">الملف الشخصي</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={logout}>تسجيل الخروج</button></li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile drawer ONLY */}
      {mode === 'mobile' && (
        <>
          <div
            className={`admin-backdrop d-lg-none ${mobileOpen ? 'show' : ''}`}
            onClick={() => setMobileOpen(false)}
            aria-hidden={!mobileOpen}
          />
          <aside
            className={`admin-sidebar admin-sidebar--mobile d-lg-none ${mobileOpen ? 'is-open' : ''}`}
            role="dialog" aria-modal="true" aria-label="قائمة لوحة المسؤول"
          >
            <button className="admin-sidebar__close d-lg-none" onClick={() => setMobileOpen(false)} aria-label="إغلاق">
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="admin-sidebar__inner">
              <div className="admin-sidebar__brand text-decoration-none">
                <i className="bi bi-gear-fill"></i><span>لوحة المسؤول</span>
              </div>

              <ul className="admin-sidebar__nav" role="list">
                {navItems.map((item) => (
                  <li key={item.path} className="admin-sidebar__item">
                    <button className="admin-sidebar__link" onClick={() => go(item.path)}>
                      <i className={`bi ${item.icon}`}></i><span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="admin-sidebar__user mt-auto">
                <button className="admin-sidebar__userbtn" onClick={() => go('/admin/profile')}>
                  <img src={user?.profile_picture || 'https://via.placeholder.com/32/FFFFFF/000000?text=AD'} alt="User" width="32" height="32" className="rounded-circle border" />
                  <strong>{user?.name || 'المشرف'}</strong>
                </button>
                <button className="admin-sidebar__link text-danger mt-2" onClick={() => { setMobileOpen(false); logout(); }}>
                  <i className="bi bi-box-arrow-right"></i><span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default AdminSidebar;
