    // src/api/axiosInstance.js
    import axios from 'axios';

    const axiosInstance = axios.create({
      baseURL: 'http://localhost:8000/api', // ****** هام: تأكد من أن هذا هو رابط API Laravel الخاص بك ******
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // إضافة معالج للاستجابات للتعامل مع أخطاء الصلاحيات
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // التعامل مع أخطاء الصلاحيات
          if (error.response.status === 403) {
            console.error('Access denied: You do not have permission to perform this action');
            // يمكن إضافة منطق إضافي هنا مثل إظهار رسالة للمستخدم
          } else if (error.response.status === 401) {
            console.error('Unauthorized: Please log in again');
            // يمكن إضافة منطق لإعادة توجيه المستخدم لصفحة تسجيل الدخول
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    export default axiosInstance;
    