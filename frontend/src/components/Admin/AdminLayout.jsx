import React from 'react';
import AdminSidebar from "../../pages/Admin/AdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout-root d-flex" dir="rtl">
      {/* Desktop sidebar only */}
      <aside className="d-none d-lg-block">
        <AdminSidebar isMobile={false} />
      </aside>

      {/* Page content */}
      <main className="admin-content-wrapper flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;