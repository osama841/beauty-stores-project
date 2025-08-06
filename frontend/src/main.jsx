// src/main.jsx
// هذا هو ملف نقطة الدخول الرئيسي لتطبيق React عند استخدام Vite.

import React from 'react';
import ReactDOM from 'react-dom/client';

// استيراد ملف CSS العام الذي يحتوي على إعدادات Tailwind
import './styles/global.css'; // استيراد ملف الـ CSS العام الذي أنشأناه
import App from './App'; // استيراد المكون الرئيسي App

// إنشاء جذر React لتطبيقك
const root = ReactDOM.createRoot(document.getElementById('root'));

// عرض المكون الرئيسي App داخل وضع React StrictMode
root.render(
  <React.StrictMode>
    <div style={{ fontFamily: 'Tajawal, Cairo, sans-serif', direction: 'rtl', backgroundColor: '#f6f7fb', color: '#23272f' }}>
      <App />
    </div>
  </React.StrictMode>
);

// ملاحظة: في Vite، عادةً لا يتم استخدام reportWebVitals مباشرةً
// لأنه يركز على سرعة التطوير وليس بالضرورة قياسات الأداء الأولية بطرق create-react-app.
// إذا كنت بحاجة إليه، يمكنك إعداده يدويًا.