// ===== src/components/common/Toast.jsx =====
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  BiCheckCircle, 
  BiErrorCircle, 
  BiInfoCircle, 
  BiX,
  BiError 
} from 'react-icons/bi';

// === سياق الإشعارات ===
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// === مزود الإشعارات ===
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
      actions: options.actions,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // إزالة تلقائية بعد المدة المحددة
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  };

  // الاستماع لأحداث API
  useEffect(() => {
    const handleApiError = (event) => {
      const { type, message } = event.detail;
      addToast(message, type);
    };

    const handleApiSuccess = (event) => {
      const { type, message } = event.detail;
      addToast(message, type);
    };

    window.addEventListener('api-error', handleApiError);
    window.addEventListener('api-success', handleApiSuccess);
    
    return () => {
      window.removeEventListener('api-error', handleApiError);
      window.removeEventListener('api-success', handleApiSuccess);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // دوال مساعدة
  const success = (message, options) => addToast(message, 'success', options);
  const error = (message, options) => addToast(message, 'error', options);
  const warning = (message, options) => addToast(message, 'warning', options);
  const info = (message, options) => addToast(message, 'info', options);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  };

  // تعيين المرجع العام للاستخدام خارج السياق
  useEffect(() => {
    setGlobalToastRef(value);
    return () => setGlobalToastRef(null);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// === مكون الإشعار الواحد ===
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // إظهار الإشعار
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // شريط التقدم
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration / 50));
          return Math.max(0, newProgress);
        });
      }, 50);

      return () => {
        clearTimeout(showTimer);
        clearInterval(interval);
      };
    }

    return () => clearTimeout(showTimer);
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 250);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <BiCheckCircle />;
      case 'error':
        return <BiErrorCircle />;
      case 'warning':
        return <BiError />;
      case 'info':
      default:
        return <BiInfoCircle />;
    }
  };

  return (
    <div 
      className={`toast ${toast.type} ${isVisible ? 'show' : ''} ${toast.title ? '' : 'no-title'}`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        {toast.title && (
          <div className="toast-title">{toast.title}</div>
        )}
        <div className="toast-message">{toast.message}</div>
        
        {toast.actions && (
          <div className="toast-actions">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                className={`toast-action ${action.primary ? 'primary' : ''}`}
                onClick={() => {
                  action.onClick && action.onClick();
                  if (action.closeOnClick !== false) {
                    handleRemove();
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button 
        className="toast-close"
        onClick={handleRemove}
        aria-label="إغلاق الإشعار"
      >
        <BiX />
      </button>
      
      {toast.duration > 0 && (
        <div 
          className="toast-progress" 
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
};

// === حاوي الإشعارات ===
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// === دوال مساعدة للاستخدام السريع ===
export const toast = {
  success: (message, options) => {
    // للاستخدام خارج السياق - يتطلب إعداد إضافي
    console.warn('استخدم useToast() hook بدلاً من دوال toast المباشرة');
  },
  error: (message, options) => {
    console.warn('استخدم useToast() hook بدلاً من دوال toast المباشرة');
  },
  warning: (message, options) => {
    console.warn('استخدم useToast() hook بدلاً من دوال toast المباشرة');
  },
  info: (message, options) => {
    console.warn('استخدم useToast() hook بدلاً من دوال toast المباشرة');
  }
};

export default ToastItem;
