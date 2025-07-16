// frontend/src/components/dashboard/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosConfig'; // استيراد مثيل Axios
import { useNavigate, Link } from 'react-router-dom'; // للتنقل وإنشاء الروابط

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // جلب بيانات المستخدم المصادق عليه
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/user'); // مسار API لجلب بيانات المستخدم
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        // إذا كان هناك خطأ في جلب بيانات المستخدم، يمكننا عرض رسالة خطأ    
        
        setError('Failed to load user data. Please log in again.');

        // إذا فشل جلب المستخدم، فمن المحتمل أن تكون الجلسة قد انتهت أو لم يتم المصادقة
        navigate('/login'); // إعادة توجيه إلى صفحة تسجيل الدخول
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]); // إعادة تشغيل التأثير إذا تغيرت دالة navigate

  // دالة لتسجيل الخروج
  const handleLogout = async () => {
    try {
      await apiClient.post('/logout'); // إرسال طلب تسجيل الخروج إلى API
      setUser(null); // مسح بيانات المستخدم من الحالة
      navigate('/login'); // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading user dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button onClick={() => navigate('/login')} className="ml-4 text-blue-700 hover:underline">Go to Login</button>
        </div>
      </div>
    );
  }

  if (!user) {
    // إذا لم يكن هناك مستخدم بعد التحميل، أعد التوجيه إلى صفحة تسجيل الدخول
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Redirecting to login...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {user.username}!
        </h2>
        <p className="text-gray-600 mb-6">This is your personalized dashboard.</p>

        <div className="space-y-4 mb-6">
          <Link
            to="/beauty-advisor"
            className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-md"
          >
            Go to AI Beauty Advisor ✨
          </Link>
          {/* يمكنك إضافة روابط أخرى هنا لصفحات المتجر */}
          {/* <Link to="/products" className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-md">
            View Products
          </Link> */}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;
