// src/pages/MyAccount/UserProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAuthenticatedUser, updateUser } from '../../api/auth'; // استخدام دوال auth API
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/user/UserProfile.css';

const UserProfile = () => {
  const { user, login } = useAuth(); // جلب المستخدم الحالي ودالة login لتحديث السياق
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState(''); // لتغيير كلمة المرور
  const [confirmPassword, setConfirmPassword] = useState(''); // لتأكيد كلمة المرور

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setValidationErrors({});
    setSuccessMessage(null);

    if (password && password !== confirmPassword) {
      setFormError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      setLoading(false);
      return;
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      email: email,
      phone_number: phoneNumber,
    };

    if (password) {
      userData.password = password;
    }

    try {
      // نرسل user_id للمستخدم الحالي لتحديث ملفه الشخصي
      const response = await updateUser(user.user_id, userData);
      login(response.user); // تحديث بيانات المستخدم في السياق
      setSuccessMessage('تم تحديث ملفك الشخصي بنجاح!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('فشل تحديث الملف الشخصي:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(Object.values(err.errors).flat().join(' ') || err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع أثناء تحديث الملف الشخصي.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-0 rounded-lg p-4 bg-white">
      <h1 className="mb-4 fw-bold text-primary">الملف الشخصي</h1>
      <p className="text-muted">تعديل معلوماتك الشخصية وكلمة المرور.</p>

      <form onSubmit={handleSubmit}>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {formError && <div className="alert alert-danger">{formError}</div>}

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">الاسم الأول:</label>
            <input type="text" id="firstName" className={`form-control ${validationErrors.first_name ? 'is-invalid' : ''}`} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            {validationErrors.first_name && <div className="invalid-feedback">{validationErrors.first_name[0]}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">اسم العائلة:</label>
            <input type="text" id="lastName" className={`form-control ${validationErrors.last_name ? 'is-invalid' : ''}`} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            {validationErrors.last_name && <div className="invalid-feedback">{validationErrors.last_name[0]}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="username" className="form-label">اسم المستخدم:</label>
          <input type="text" id="username" className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`} value={username} onChange={(e) => setUsername(e.target.value)} required />
          {validationErrors.username && <div className="invalid-feedback">{validationErrors.username[0]}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">البريد الإلكتروني:</label>
          <input type="email" id="email" className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} required />
          {validationErrors.email && <div className="invalid-feedback">{validationErrors.email[0]}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">رقم الهاتف (اختياري):</label>
          <input type="tel" id="phoneNumber" className={`form-control ${validationErrors.phone_number ? 'is-invalid' : ''}`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          {validationErrors.phone_number && <div className="invalid-feedback">{validationErrors.phone_number[0]}</div>}
        </div>

        <hr className="my-4" />
        <h5 className="mb-3 fw-bold text-secondary">تغيير كلمة المرور</h5>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">كلمة المرور الجديدة (اختياري):</label>
          <input type="password" id="password" className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="اتركه فارغاً لعدم التغيير" />
          {validationErrors.password && <div className="invalid-feedback">{validationErrors.password[0]}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور الجديدة:</label>
          <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          {loading ? 'جاري التحديث...' : 'تحديث الملف الشخصي'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
