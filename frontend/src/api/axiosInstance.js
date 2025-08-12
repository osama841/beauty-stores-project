// src/api/axiosInstance.js
import axios from 'axios';

// يقرأ رابط الـ API من بيئة Vite (يسقط على localhost للتطوير إذا ما وُجد)
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // لو بتستخدم Laravel Sanctum بالكوكيز بدل التوكن:
  // withCredentials: true,
});

// طلبات: إضافة Authorization Bearer إن وُجد توكن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ردود: التعامل مع 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;

    if (status === 403) {
      console.error('Access denied: You do not have permission to perform this action');
      // إشعار للمستخدم
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            type: 'error',
            message: 'ليس لديك صلاحية للقيام بهذا الإجراء'
          }
        }));
      }
    }

    if (status === 401) {
      console.error('Unauthorized: Please log in again');
      // تنظيف محلي
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // إشعار للمستخدم
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            type: 'warning',
            message: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى'
          }
        }));
      }
      
      // إعادة توجيه لصفحة الدخول
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    // أخطاء الخادم العامة
    if (status >= 500) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            type: 'error',
            message: 'خطأ في الخادم. يرجى المحاولة لاحقاً'
          }
        }));
      }
    }

    // أخطاء الشبكة
    if (!status) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            type: 'error',
            message: 'تحقق من اتصال الإنترنت وحاول مرة أخرى'
          }
        }));
      }
    }

    return Promise.reject(error);
  }
);

export default api;