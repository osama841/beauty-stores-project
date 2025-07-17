// src/components/Admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from "../../pages/Admin/AdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    // تحديد ما إذا كان العرض الحالي يعتبر جوالاً
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 992); // 992px هو breakpoint الـ lg في Bootstrap
    };

    // التحقق عند التحميل وعند تغيير حجم النافذة
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // إضافة/إزالة كلاس 'sidebar-open-mobile' من <body>
    if (showMobileSidebar) {
      document.body.classList.add('sidebar-open-mobile');
    } else {
      document.body.classList.remove('sidebar-open-mobile');
    }

    // تنظيف event listener عند إلغاء تحميل المكون
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      document.body.classList.remove('sidebar-open-mobile');
    };
  }, [showMobileSidebar]);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const closeMobileSidebar = () => {
    setShowMobileSidebar(false);
  };

  return (
    <div className="admin-layout d-flex">
      {/* زر فتح الشريط الجانبي على الجوال (يظهر فقط على الجوال) */}
      {isMobileView && (
        <button
          className="btn btn-primary admin-sidebar-toggler d-lg-none fixed-top m-3"
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-4"></i>
        </button>
      )}

      {/* الشريط الجانبي */}
      <div className={`admin-sidebar-wrapper ${isMobileView ? 'mobile-sidebar' : 'desktop-sidebar'}`}>
        <AdminSidebar 
          isMobile={isMobileView} 
          show={showMobileSidebar} 
          onClose={closeMobileSidebar} 
        />
      </div>

      {/* طبقة التعتيم للجوال (تظهر فقط عند فتح الشريط الجانبي) */}
      {isMobileView && showMobileSidebar && (
        <div 
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="admin-content flex-grow-1 p-3 p-lg-4">
        <div className="container-fluid">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;