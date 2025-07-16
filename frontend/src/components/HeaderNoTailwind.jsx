// src/components/HeaderNoTailwind.jsx
import React from 'react';

const HeaderNoTailwind = () => {
  return (
    <header style={{
      backgroundColor: '#f8f9fa',
      padding: '15px 30px',
      borderBottom: '1px solid #e2e6ea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
        متجر الجمال (بدون Tailwind)
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
        <li><a href="#" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '600' }}>الرئيسية</a></li>
        <li><a href="#" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '600' }}>المنتجات</a></li>
        <li><a href="#" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '600' }}>تسجيل الدخول</a></li>
      </ul>
    </header>
  );
};

export default HeaderNoTailwind;
