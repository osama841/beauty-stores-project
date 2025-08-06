// src/components/Admin/AdminLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from "../../pages/Admin/AdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // إغلاق الشريط عند تغيير المسار (التنقل)
  const handleRouteChange = useCallback(() => {
    setShowMobileSidebar(false);
  }, []);

  useEffect(() => {
    if (showMobileSidebar) {
      document.body.classList.add('sidebar-open-mobile');
    } else {
      document.body.classList.remove('sidebar-open-mobile');
    }
    return () => {
      document.body.classList.remove('sidebar-open-mobile');
    };
  }, [showMobileSidebar]);

  // إغلاق الشريط عند الضغط على overlay
  const handleOverlayClick = () => {
    setShowMobileSidebar(false);
  };

  // مراقبة تغيّر المسار (react-router)
  useEffect(() => {
    const handlePopState = () => setShowMobileSidebar(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="d-flex admin-layout-root" dir="rtl">
      {/* الشريط الجانبي لسطح المكتب */}
      <div className="d-none d-lg-flex">
        <AdminSidebar isMobile={false} />
      </div>

      {/* زر فتح الشريط الجانبي للجوال */}
      <button
        className="btn btn-primary admin-sidebar-toggler d-lg-none"
        type="button"
        aria-label="فتح القائمة الجانبية"
        onClick={() => setShowMobileSidebar(true)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Overlay للجوال */}
      {showMobileSidebar && (
        <div
          className="admin-sidebar-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
          }}
        ></div>
      )}

      {/* الشريط الجانبي للجوال */}
      {showMobileSidebar && (
        <div
          className="admin-sidebar-mobile d-lg-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '250px',
            height: '100%',
            backgroundColor: '#2c3e50',
            color: '#ecf0f1',
            zIndex: 1100,
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <AdminSidebar isMobile={true} />
        </div>
      )}

      {/* المحتوى */}
      <div className="admin-content-wrapper" style={{ flexGrow: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
