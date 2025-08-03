// src/components/Admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from "../../pages/Admin/AdminSidebar.jsx"; // ****** المسار الصحيح الآن بناءً على مكان ملفك ******
/* import '../../styles/admin/AdminSidebar.css'; */
const AdminLayout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    // إضافة/إزالة كلاس 'sidebar-open-mobile' من <body>
    if (showMobileSidebar) {
      document.body.classList.add('sidebar-open-mobile');
    } else {
      document.body.classList.remove('sidebar-open-mobile');
    }
    // دالة تنظيف لإزالة الكلاس عند إلغاء تحميل المكون
    return () => {
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
    <div className="d-flex">
      {/* الشريط الجانبي لسطح المكتب (يظهر فقط على lg فأكبر) */}
      <div className="d-none d-lg-flex">
        <AdminSidebar isMobile={false} /> {/* AdminSidebar بدون خصائص الجوال */}
      </div>

      {/* زر فتح الشريط الجانبي على الجوال (يظهر فقط على أقل من lg) */}
      <button
        className="btn btn-primary admin-sidebar-toggler d-lg-none" // تطبيق أنماط زر التبديل
        type="button"
        onClick={toggleMobileSidebar}
      >
        <i className="bi bi-list"></i> {/* أيقونة همبرغر */}
      </button>

      {/* الشريط الجانبي للجوال (يتم التحكم فيه بواسطة الحالة) */}
      <AdminSidebar isMobile={true} show={showMobileSidebar} onClose={closeMobileSidebar} />

      {/* المحتوى الرئيسي للوحة التحكم (سيتم دفعه بواسطة CSS) */}
      <div className="flex-grow-1 p-4 bg-light admin-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
