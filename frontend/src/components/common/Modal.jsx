// ===== src/components/common/Modal.jsx =====
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl, full
  centered = true,
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
  const modalRef = useRef(null);
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

  // منع التمرير عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // التركيز على المودال عند الفتح
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) {
      onClose && onClose();
    }
  };

  const getModalClasses = () => {
    const baseClasses = ['modal-dialog'];
    
    baseClasses.push(`modal-${size}`);
    if (centered) baseClasses.push('modal-centered');
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  const getBackdropClasses = () => {
    const baseClasses = ['modal-backdrop'];
    
    if (isOpen) baseClasses.push('show');
    if (backdropClassName) baseClasses.push(backdropClassName);
    
    return baseClasses.join(' ');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={getBackdropClasses()}
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={getModalClasses()}
        ref={modalRef}
        tabIndex={-1}
        {...props}
      >
        <div className="modal-content">
          {showHeader && (
            <div className="modal-header">
              {title && (
                <h3 id="modal-title" className="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="modal-close"
                  onClick={onClose}
                  icon="bi bi-x-lg"
                  aria-label="إغلاق"
                />
              )}
            </div>
          )}
          
          <div className="modal-body">
            {children}
          </div>
          
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // إنشاء المودال في نهاية body
  return createPortal(modalContent, document.body);
};

// مكونات مختصرة لحالات شائعة
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد العملية",
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  ...props
}) => {
  const footer = (
    <div className="modal-actions">
      <Button variant="ghost" onClick={onClose}>
        {cancelText}
      </Button>
      <Button
        variant={variant}
        onClick={() => {
          onConfirm && onConfirm();
          onClose && onClose();
        }}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      {...props}
    >
      <p className="text-center">{message}</p>
    </Modal>
  );
};

export default Modal;