// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuthenticatedUser, logoutUser } from '../api/auth'; // استيراد دوال المصادقة

// إنشاء الـ Context
const AuthContext = createContext(null);

// مزود الـ Context (Provider) الذي سيحتوي على حالة المصادقة والمنطق
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // لتخزين بيانات المستخدم المصادق عليه
  const [loading, setLoading] = useState(true); // للإشارة إلى أننا نتحقق من حالة المصادقة

  // useEffect: يتم تشغيله مرة واحدة عند تحميل التطبيق للتحقق مما إذا كان المستخدم مسجلاً للدخول بالفعل (عبر الـ Token المخزن)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken'); // جلب الـ Token
      if (token) {
        try {
          const authenticatedUser = await getAuthenticatedUser(); // محاولة جلب بيانات المستخدم باستخدام الـ Token
          setUser(authenticatedUser); // إذا نجح، قم بتعيين المستخدم
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('authToken'); // إذا فشل (مثل Token غير صالح)، قم بإزالة الـ Token
          setUser(null); // تعيين المستخدم إلى null
        }
      }
      setLoading(false); // تم الانتهاء من التحقق
    };

    checkAuth();
  }, []); // [] يعني تشغيل مرة واحدة عند تركيب المكون

  // دالة لتسجيل دخول المستخدم في الـ Context
  const login = (userData) => {
    setUser(userData);
  };

  // دالة لتسجيل خروج المستخدم من الـ Context و الـ API
  const logout = async () => {
    await logoutUser(); // استدعاء دالة الـ logout من الـ API (التي ستحذف الـ Token من localStorage)
    setUser(null); // تعيين المستخدم إلى null
  };

  // القيمة التي ستُقدم لجميع المكونات التي تستهلك هذا الـ Context
  const contextValue = {
    user,
    isAuthenticated: !!user, // هل المستخدم مصادق عليه؟ (true إذا كان user ليس null)
    loading, // حالة التحميل الأولية
    login, // دالة تسجيل الدخول
    logout, // دالة تسجيل الخروج
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children} {/* مكونات التطبيق الأخرى ستكون هنا */}
    </AuthContext.Provider>
  );
};

// Hook مخصص لسهولة استهلاك الـ Context في أي مكون
export const useAuth = () => useContext(AuthContext);