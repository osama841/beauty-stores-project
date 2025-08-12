// ===== src/components/common/Drawer.jsx =====
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Drawer = ({
  isOpen = false,
  onClose,
  position = 'right', // right, left, top, bottom
  title,
  children,
  size = 'md', // sm, md, lg, full
  closable = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  showHeader = true,
  showCloseButton = true,
  footer,
  className = '',
  backdropClassName = '',
  ...props
}) => {
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  // إغلاق بـ ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // منع التمرير عند فتح الدرج
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // التركيز على الدرج عند الفتح
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) {
      onClose && onClose();
    }
  };

  const getDrawerClasses = () => {
    const baseClasses = ['drawer'];
    
    baseClasses.push(`drawer-${position}`);
    baseClasses.push(`drawer-${size}`);
    if (isOpen) baseClasses.push('drawer-open');
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  const getBackdropClasses = () => {
    const baseClasses = ['drawer-backdrop'];
    
    if (isOpen) baseClasses.push('show');
    if (backdropClassName) baseClasses.push(backdropClassName);
    
    return baseClasses.join(' ');
  };

  if (!isOpen) return null;

  const drawerContent = (
    <div className="drawer-wrapper">
      <div
        className={getBackdropClasses()}
        ref={backdropRef}
        onClick={handleBackdropClick}
      />
      
      <div
        className={getDrawerClasses()}
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        {...props}
      >
        <div className="drawer-content">
          {showHeader && (
            <div className="drawer-header">
              {title && (
                <h3 id="drawer-title" className="drawer-title">
                  {title}
                </h3>
              )}
              {showCloseButton && closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="drawer-close"
                  onClick={onClose}
                  icon="bi bi-x-lg"
                  aria-label="إغلاق"
                />
              )}
            </div>
          )}
          
          <div className="drawer-body">
            {children}
          </div>
          
          {footer && (
            <div className="drawer-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // إنشاء الدرج في نهاية body
  return createPortal(drawerContent, document.body);
};

// مكون درج الفلاتر (للجوال)
export const FilterDrawer = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  hasFilters = false,
  ...props
}) => {
  const footer = (
    <div className="drawer-filter-actions">
      <Button
        variant="ghost"
        onClick={onReset}
        disabled={!hasFilters}
        className="flex-1"
      >
        مسح الكل
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          onApply && onApply();
          onClose && onClose();
        }}
        className="flex-1"
      >
        تطبيق
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="تصفية المنتجات"
      position="bottom"
      size="lg"
      footer={footer}
      {...props}
    >
      {children}
    </Drawer>
  );
};

export default Drawer;