// ===== src/components/common/Button.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  rounded = false,
  outline = false,
  ghost = false,
  to,
  href,
  onClick,
  className = '',
  startIcon,
  endIcon,
  fullWidth = false,
  ...props
}) => {
  // تحديد النوع الأساسي للزر
  const getBaseClasses = () => {
    let classes = ['btn'];
    
    // النوع الأساسي
    if (ghost) {
      classes.push('btn-ghost');
    } else if (outline) {
      classes.push(`btn-outline-${variant}`);
    } else {
      classes.push(`btn-${variant}`);
    }
    
    // الحجم
    if (size === 'sm') classes.push('btn-sm');
    if (size === 'lg') classes.push('btn-lg');
    
    // الشكل
    if (rounded) classes.push('btn-rounded');
    
    // الحالات
    if (fullWidth) classes.push('w-100');
    if (loading) classes.push('loading');
    
    return classes.join(' ');
  };

  const finalClassName = `${getBaseClasses()} ${className}`.trim();

  // المحتوى مع الأيقونات والتحميل
  const buttonContent = (
    <>
      {loading && (
        <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      )}
      {!loading && startIcon && <span className="btn-start-icon">{startIcon}</span>}
      <span className="btn-text">{children}</span>
      {!loading && endIcon && <span className="btn-end-icon">{endIcon}</span>}
    </>
  );

  // الخصائص المشتركة
  const commonProps = {
    className: finalClassName,
    disabled: disabled || loading,
    'aria-disabled': disabled || loading,
    ...props
  };

  // رابط خارجي
  if (href) {
    return (
      <a
        href={href}
        role="button"
        {...commonProps}
        onClick={disabled || loading ? undefined : onClick}
      >
        {buttonContent}
      </a>
    );
  }

  // رابط داخلي
  if (to) {
    return (
      <Link
        to={to}
        role="button"
        {...commonProps}
        onClick={disabled || loading ? undefined : onClick}
      >
        {buttonContent}
      </Link>
    );
  }

  // زر عادي
  return (
    <button
      type={type}
      {...commonProps}
      onClick={disabled || loading ? undefined : onClick}
    >
      {buttonContent}
    </button>
  );
};

// مكونات مساعدة سريعة
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;
export const InfoButton = (props) => <Button variant="info" {...props} />;
export const LightButton = (props) => <Button variant="light" {...props} />;
export const DarkButton = (props) => <Button variant="dark" {...props} />;
export const OutlineButton = (props) => <Button outline {...props} />;
export const GhostButton = (props) => <Button ghost {...props} />;
export const RoundedButton = (props) => <Button rounded {...props} />;

export default Button;
