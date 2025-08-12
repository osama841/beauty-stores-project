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

// ردود: التعامل مع 401/403 والأخطاء العامة مع نظام Toast محسن
api.interceptors.response.use(
  (response) => {
    // معالجة الاستجابات الناجحة مع رسائل خاصة
    if (response.data?.message && response.config?.showSuccessMessage) {
      window.dispatchEvent(new CustomEvent('api-success', {
        detail: {
          type: 'success',
          message: response.data.message
        }
      }));
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.message || error.message;

    // معالجة أخطاء التحقق من الصحة (422)
    if (status === 422) {
      const validationErrors = data?.errors;
      if (validationErrors) {
        // عرض أول خطأ في الحقول
        const firstFieldErrors = Object.values(validationErrors)[0];
        const firstError = Array.isArray(firstFieldErrors) ? firstFieldErrors[0] : firstFieldErrors;
        
        window.dispatchEvent(new CustomEvent('api-error', {
          detail: {
            type: 'warning',
            message: firstError || 'بيانات غير صحيحة'
          }
        }));
      }
      return Promise.reject(error);
    }

    // عدم وجود صلاحية (403)
    if (status === 403) {
      console.error('Access denied:', message);
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          type: 'error',
          message: message || 'ليس لديك صلاحية للقيام بهذا الإجراء'
        }
      }));
      return Promise.reject(error);
    }

    // انتهاء الجلسة (401)
    if (status === 401) {
      console.error('Unauthorized:', message);
      
      // تنظيف البيانات المحلية
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // إشعار المستخدم
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          type: 'warning',
          message: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى'
        }
      }));
      
      // إعادة توجيه بعد وقت قصير
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 2000);
      
      return Promise.reject(error);
    }

    // عدم العثور على المورد (404)
    if (status === 404) {
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          type: 'warning',
          message: message || 'المورد المطلوب غير موجود'
        }
      }));
      return Promise.reject(error);
    }

    // أخطاء الخادم (500+)
    if (status >= 500) {
      console.error('Server error:', message);
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          type: 'error',
          message: 'خطأ في الخادم. يرجى المحاولة لاحقاً'
        }
      }));
      return Promise.reject(error);
    }

    // أخطاء الشبكة (لا توجد استجابة)
    if (!status) {
      console.error('Network error:', error.message);
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: {
          type: 'error',
          message: 'تحقق من اتصال الإنترنت وحاول مرة أخرى'
        }
      }));
      return Promise.reject(error);
    }

    // أخطاء أخرى
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: {
        type: 'error',
        message: message || 'حدث خطأ غير متوقع'
      }
    }));

    return Promise.reject(error);
  }
);

export default api;