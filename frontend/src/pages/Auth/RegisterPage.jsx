    // src/pages/Auth/RegisterPage.jsx
    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { registerUser } from '../../api/auth';
    import { useAuth } from '../../contexts/AuthContext';

    const RegisterPage = () => {
      const [first_name, setFirstName] = useState('');
      const [last_name, setLastName] = useState('');
      const [username, setUsername] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [password_confirmation, setPasswordConfirmation] = useState('');
      const [phone_number, setPhoneNumber] = useState('');
      const [error, setError] = useState(null);
      const [validationErrors, setValidationErrors] = useState({});
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const { login } = useAuth();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setValidationErrors({});

        try {
          const response = await registerUser({
            first_name,
            last_name,
            username,
            email,
            password,
            password_confirmation,
            phone_number,
          });
          console.log('Registration successful:', response);
          login(response.user);
          navigate('/');
        } catch (err) {
          console.error('Registration error:', err);
          if (err && typeof err === 'object' && err.errors) {
            setValidationErrors(err.errors);
            setError(err.message || 'الرجاء التحقق من الحقول المدخلة.');
          } else if (err && typeof err === 'object' && err.message) {
            setError(err.message);
          } else {
            setError(err || 'حدث خطأ غير متوقع أثناء التسجيل.');
          }
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-7">
              <div className="card shadow-lg border-0 rounded-lg">
                <div className="card-body p-4 p-md-5">
                  <h2 className="card-title text-center mb-4 fw-bold">إنشاء حساب جديد</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label htmlFor="first_name" className="form-label">الاسم الأول:</label>
                        <input
                          type="text"
                          id="first_name"
                          value={first_name}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="form-control"
                          disabled={loading}
                        />
                        {validationErrors.first_name && <div className="text-danger small mt-1">{validationErrors.first_name[0]}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="last_name" className="form-label">اسم العائلة:</label>
                        <input
                          type="text"
                          id="last_name"
                          value={last_name}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="form-control"
                          disabled={loading}
                        />
                        {validationErrors.last_name && <div className="text-danger small mt-1">{validationErrors.last_name[0]}</div>}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">اسم المستخدم:</label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="form-control"
                        disabled={loading}
                      />
                      {validationErrors.username && <div className="text-danger small mt-1">{validationErrors.username[0]}</div>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                        disabled={loading}
                      />
                      {validationErrors.email && <div className="text-danger small mt-1">{validationErrors.email[0]}</div>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">كلمة المرور:</label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        min="8"
                        className="form-control"
                        disabled={loading}
                      />
                      {validationErrors.password && <div className="text-danger small mt-1">{validationErrors.password[0]}</div>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password_confirmation" className="form-label">تأكيد كلمة المرور:</label>
                      <input
                        type="password"
                        id="password_confirmation"
                        value={password_confirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        className="form-control"
                        disabled={loading}
                      />
                      {validationErrors.password_confirmation && <div className="text-danger small mt-1">{validationErrors.password_confirmation[0]}</div>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="phone_number" className="form-label">رقم الهاتف (اختياري):</label>
                      <input
                        type="text"
                        id="phone_number"
                        value={phone_number}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="form-control"
                        disabled={loading}
                      />
                      {validationErrors.phone_number && <div className="text-danger small mt-1">{validationErrors.phone_number[0]}</div>}
                    </div>
                    {error && <p className="text-danger text-center mb-3">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-success w-100 py-2 fw-bold"
                    >
                      {loading ? 'جاري التسجيل...' : 'تسجيل'}
                    </button>
                  </form>
                  <p className="text-center text-muted mt-4 mb-0">
                    هل لديك حساب بالفعل؟{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      سجل الدخول هنا
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default RegisterPage;
    