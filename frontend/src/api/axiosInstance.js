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

    if (status === 403) {
      console.error('Access denied: You do not have permission to perform this action');
      // TODO: تقدر تعرض Toast هنا لو تحب
    }

    if (status === 401) {
      console.error('Unauthorized: Please log in again');
      // تنظيف محلي
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // إعادة توجيه لصفحة الدخول
      window.location.href = '/login';
      // لو تبغى بدون إعادة تحميل الصفحة:
      // window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    }

    return Promise.reject(error);
  }
);

export default api;