// ===== src/components/common/Button.jsx =====
import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, ghost, danger, outline
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'start', // start, end
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const getButtonClasses = () => {
    const baseClasses = ['btn'];
    
    // نوع الزر
    baseClasses.push(`btn-${variant}`);
    
    // حجم الزر
    baseClasses.push(`btn-${size}`);
    
    // حالات خاصة
    if (disabled || loading) baseClasses.push('btn-disabled');
    if (loading) baseClasses.push('btn-loading');
    if (icon && !children) baseClasses.push('btn-icon-only');
    
    // كلاسات إضافية
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  const renderIcon = (position) => {
    if (!icon || iconPosition !== position) return null;
    
    if (loading && position === 'start') {
      return (
        <span className="btn-spinner" aria-hidden="true">
          <i className="bi bi-arrow-clockwise"></i>
        </span>
      );
    }
    
    return (
      <span className="btn-icon" aria-hidden="true">
        {typeof icon === 'string' ? <i className={icon}></i> : icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderIcon('start')}
      {children && <span className="btn-text">{children}</span>}
      {renderIcon('end')}
    </button>
  );
};

// مكونات مختصرة لحالات شائعة
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;

export default Button;