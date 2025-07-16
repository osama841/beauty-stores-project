    // src/pages/Auth/LoginPage.jsx
    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { loginUser } from '../../api/auth';
    import { useAuth } from '../../contexts/AuthContext';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const { login } = useAuth();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          const response = await loginUser({ email, password });
          console.log('Login successful:', response);
          login(response.user);
          navigate('/');
        } catch (err) {
          console.error('Login error:', err);
          if (err && typeof err === 'object' && err.errors) {
            setError(Object.values(err.errors).flat().join(' ') || err.message || 'الرجاء التحقق من الحقول المدخلة.');
          } else if (err && typeof err === 'object' && err.message) {
            setError(err.message);
          } else {
            setError(err || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.');
          }
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 rounded-lg">
                <div className="card-body p-4 p-md-5">
                  <h2 className="card-title text-center mb-4 fw-bold">تسجيل الدخول إلى حسابك</h2>
                  <form onSubmit={handleSubmit}>
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
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">كلمة المرور:</label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-control"
                        disabled={loading}
                      />
                    </div>
                    {error && <p className="text-danger text-center mb-3">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2 fw-bold"
                    >
                      {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                  </form>
                  <p className="text-center text-muted mt-4 mb-0">
                    ليس لديك حساب؟{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      سجل هنا
                    </Link>
                  </p>
                  <p className="text-center text-muted mt-2 mb-0">
                    <Link to="/forgot-password" className="text-decoration-none fw-bold">
                      نسيت كلمة المرور؟
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default LoginPage;
    