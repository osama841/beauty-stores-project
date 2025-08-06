  import React, { useState, useEffect } from 'react';

  /**
   * مكون للتعامل مع أخطاء API وعرض رسائل مناسبة للمستخدم
   * @param {Object} props - خصائص المكون
   * @param {Error} props.error - كائن الخطأ
   * @param {Function} props.onRetry - دالة إعادة المحاولة
   * @param {boolean} props.showRetry - هل تظهر زر إعادة المحاولة
   */
  const ErrorHandler = ({ error, onRetry, showRetry = true }) => {
    const [showError, setShowError] = useState(true);

    useEffect(() => {
      // إخفاء الخطأ تلقائياً بعد 5 ثوانٍ
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    if (!error || !showError) {
      return null;
    }

    const getErrorMessage = (error) => {
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return data.message || 'Bad request. Please check your input.';
          case 401:
            return 'Please log in to continue.';
          case 403:
            return data.message || 'You do not have permission to perform this action.';
          case 404:
            return 'The requested resource was not found.';
          case 422:
            return data.message || 'Validation error. Please check your input.';
          case 429:
            return 'Too many requests. Please try again later.';
          case 500:
            return 'Server error. Please try again later.';
          default:
            return data.message || 'An unexpected error occurred.';
        }
      }
      
      if (error.request) {
        return 'Network error. Please check your connection.';
      }
      
      return error.message || 'An unexpected error occurred.';
    };

    const getErrorType = (error) => {
      if (error.response) {
        const { status } = error.response;
        
        if (status >= 500) return 'danger';
        if (status >= 400) return 'warning';
        return 'info';
      }
      
      return 'danger';
    };

    const errorType = getErrorType(error);
    const errorMessage = getErrorMessage(error);

    return (
      <div className="error-handler" style={{ fontFamily: 'Tajawal, Cairo, sans-serif', backgroundColor: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
        <p style={{ margin: '0', fontSize: '1rem', lineHeight: '1.6' }}>{errorMessage}</p>
        {showRetry && (
          <button
            onClick={onRetry}
            style={{ backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', marginTop: '1rem' }}
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  };

  /**
   * مكون للتعامل مع أخطاء الصلاحيات بشكل خاص
   * @param {Object} props - خصائص المكون
   * @param {Error} props.error - كائن الخطأ
   * @param {Function} props.onLogin - دالة التوجيه لصفحة تسجيل الدخول
   */
  export const PermissionError = ({ error, onLogin }) => {
    if (!error || error.response?.status !== 403) {
      return null;
    }

    return (
      <div className="alert alert-warning" role="alert">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <strong>Access Denied: </strong>
            You don't have permission to perform this action.
          </div>
          {onLogin && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={onLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * مكون للتعامل مع أخطاء المصادقة
   * @param {Object} props - خصائص المكون
   * @param {Error} props.error - كائن الخطأ
   * @param {Function} props.onLogin - دالة التوجيه لصفحة تسجيل الدخول
   */
  export const AuthError = ({ error, onLogin }) => {
    if (!error || error.response?.status !== 401) {
      return null;
    }

    return (
      <div className="alert alert-info" role="alert">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <strong>Authentication Required: </strong>
            Please log in to continue.
          </div>
          {onLogin && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={onLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  };

  export default ErrorHandler;