// frontend/src/components/dashboard/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
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
        const response = await axiosInstance.get('/user');
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
      await axiosInstance.post('/logout');
      setUser(null); // مسح بيانات المستخدم من الحالة
      navigate('/login'); // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <div>حدث خطأ: {error}</div>
          <button onClick={() => navigate('/login')} className="btn btn-sm btn-primary">اذهب لتسجيل الدخول</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container text-center my-5">
        <p className="text-muted">إعادة التوجيه إلى تسجيل الدخول...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 text-center p-4">
            <h2 className="h3 fw-bold mb-2">مرحبًا، {user.username}!</h2>
            <p className="text-muted mb-4">هذه هي لوحة التحكم الخاصة بك.</p>

            <div className="d-grid gap-3 mb-4">
              <Link to="/beauty-advisor" className="btn btn-primary btn-lg">
                الذهاب إلى مستشار الجمال الذكي ✨
              </Link>
            </div>

            <button onClick={handleLogout} className="btn btn-outline-danger">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
