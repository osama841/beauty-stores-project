// src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container-fluid">
      <h1 className="mb-4 fw-bold text-primary">لوحة القيادة</h1>
      <p className="text-muted">مرحباً بك في لوحة تحكم المسؤول. من هنا يمكنك إدارة جميع جوانب متجرك.</p>

      <div className="row g-4 mt-4">
        {/* بطاقة إحصائيات بسيطة */}
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3 shadow-sm">
            <div className="card-header">إجمالي المبيعات</div>
            <div className="card-body">
              <h5 className="card-title fs-3">$12,345.00</h5>
              <p className="card-text">زيادة 15% عن الشهر الماضي.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3 shadow-sm">
            <div className="card-header">الطلبات الجديدة</div>
            <div className="card-body">
              <h5 className="card-title fs-3">50</h5>
              <p className="card-text">تم معالجة 10 طلبات اليوم.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info mb-3 shadow-sm">
            <div className="card-header">المستخدمون الجدد</div>
            <div className="card-body">
              <h5 className="card-title fs-3">25</h5>
              <p className="card-text">مستخدمون جدد هذا الأسبوع.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-5 mb-4 fw-bold">إدارة سريعة</h2>
      <div className="row g-3">
        <div className="col-md-4">
          <Link to="/admin/products" className="btn btn-outline-info w-100 py-3 shadow-sm">
            <i className="bi bi-box-seam me-2"></i> إدارة المنتجات
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/categories" className="btn btn-outline-success w-100 py-3 shadow-sm">
            <i className="bi bi-tags me-2"></i> إدارة الأقسام
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/orders" className="btn btn-outline-warning w-100 py-3 shadow-sm">
            <i className="bi bi-receipt me-2"></i> إدارة الطلبات
          </Link>
        </div>
      </div>

      {/* يمكنك إضافة المزيد من الإحصائيات أو الرسوم البيانية هنا */}
    </div>
  );
};

export default AdminDashboard;
