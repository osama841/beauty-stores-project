/* <<<<<<< Current (Your changes)
  // src/main.jsx
  // هذا هو ملف نقطة الدخول الرئيسي لتطبيق React عند استخدام Vite.
=======
// src/main.jsx */
// نقطة الدخول الرئيسي لتطبيق React مع Vite
/* >>>>>>> Incoming (Background Agent changes) */

import React from 'react';
import ReactDOM from 'react-dom/client';

// استيراد نظام التصميم بالترتيب الصحيح
import './styles/tokens.css';      // المتغيرات الأساسية
import './styles/base.css';        // الأنماط الأساسية  
import './styles/overrides.css';   // تجاوزات Bootstrap
import './styles/global.css';      // الأنماط العامة

// استيراد مكونات النظام
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/product-card.css';
import './styles/components/skeleton.css';
import './styles/components/toast.css';

import App from './App';

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