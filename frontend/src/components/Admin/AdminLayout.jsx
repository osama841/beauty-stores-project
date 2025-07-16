// src/components/Admin/AdminLayout.jsx
import React from 'react';
import AdminSidebar from '../../pages/Admin/AdminSidebar'; // استيراد الشريط الجانبي

const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <AdminSidebar /> {/* الشريط الجانبي */}
      <div className="flex-grow-1 p-4 bg-light"> {/* المحتوى الرئيسي */}
        {children} {/* هنا سيتم عرض صفحات المسؤول الفعلية (مثل AdminDashboard, CategoryManagement) */}
      </div>
    </div>
  );
};

export default AdminLayout;
