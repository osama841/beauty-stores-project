// frontend/src/components/auth/Login.jsx

import React, { useState } from 'react';
import AuthLayout from './AuthLayout'; // استيراد مكون التخطيط المشترك
import apiClient from '../../api/axiosInstance'; // استيراد مثيل Axios
import { Link, useNavigate } from 'react-router-dom'; // لإنشاء الروابط والتنقل

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook للتنقل برمجياً

  // دالة لمعالجة التغييرات في حقول النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // دالة لمعالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault(); // منع السلوك الافتراضي للنموذج (إعادة تحميل الصفحة)
    setError(null); // مسح أي أخطاء سابقة
    setLoading(true); // تفعيل حالة التحميل

    try {
      // إرسال طلب POST إلى API تسجيل الدخول (مسار /login)
      const response = await apiClient.post('/login', formData);
      console.log('Login successful:', response.data);

      // هنا يمكنك تخزين بيانات المستخدم أو رمز المصادقة (token) إذا كنت تستخدمه
      // لكن مع Sanctum، الكوكيز يتم التعامل معها تلقائيًا.
      // يمكننا إعادة توجيه المستخدم إلى لوحة التحكم أو الصفحة الرئيسية بعد تسجيل الدخول
      navigate('/dashboard'); // سنقوم بإنشاء هذا المسار والمكون لاحقًا
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        // رسالة خطأ عامة من الـ API (مثال: بيانات اعتماد غير صحيحة)
        setError(err.response.data.message);
      } else {
        // خطأ غير متوقع
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false); // تعطيل حالة التحميل
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
      {loading && <div className="text-center text-blue-500 mb-4">Logging in...</div>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* حقل البريد الإلكتروني */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* حقل كلمة المرور */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* زر تسجيل الدخول */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 w-full"
            disabled={loading} // تعطيل الزر أثناء التحميل
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </div>
      </form>
      <p className="text-center text-gray-600 text-sm mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 hover:text-blue-700 font-bold">
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
}
// ... (الكود السابق)

// دالة لمعالجة إرسال النموذج
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const response = await apiClient.post('/login', formData);
    console.log('Login successful:', response.data);

    // إعادة توجيه المستخدم إلى لوحة التحكم بعد تسجيل الدخول الناجح
    navigate('/dashboard'); // تم التغيير من '/beauty-advisor' إلى '/dashboard'
  } catch (err) {
    console.error('Login error:', err);
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

// ... (بقية الكود)


export default Login;
