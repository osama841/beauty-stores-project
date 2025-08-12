  // src/main.jsx
  // هذا هو ملف نقطة الدخول الرئيسي لتطبيق React عند استخدام Vite.

  import React from 'react';
  import ReactDOM from 'react-dom/client';

/* <<<<<<< Current (Your changes) */
  // استيراد ملفات نظام التصميم الأساسية
  import './styles/tokens.css';
  import './styles/base.css';

  // استيراد نظام التصميم
  import './styles/tokens.css';
  import './styles/base.css';
  import './styles/components/buttons.css';
  import './styles/components/forms.css';
  import './styles/components/product-card.css';
  import './styles/components/skeleton.css';
  import './styles/components/toast.css';
  
  import './styles/global.css';
/* >>>>>>> Incoming (Background Agent changes) */
  import App from './App'; // استيراد المكون الرئيسي App

  // إنشاء جذر React لتطبيقك
  const root = ReactDOM.createRoot(document.getElementById('root'));

  // عرض المكون الرئيسي App داخل وضع React StrictMode
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // ملاحظة: في Vite، عادةً لا يتم استخدام reportWebVitals مباشرةً
  // لأنه يركز على سرعة التطوير وليس بالضرورة قياسات الأداء الأولية بطرق create-react-app.
  // إذا كنت بحاجة إليه، يمكنك إعداده يدويًا.