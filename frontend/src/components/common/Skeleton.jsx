// ===== src/components/common/Skeleton.jsx =====
import React from 'react';

const Skeleton = ({ 
  variant = 'text', // text, circle, rounded, product-card, list-item
  width,
  height,
  className = '',
  lines = 1,
  animation = 'wave' // wave, pulse, none
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = ['skeleton'];
    
    // نوع الهيكل
    if (variant === 'circle') {
      baseClasses.push('skeleton-circle');
    } else if (variant === 'rounded') {
      baseClasses.push('skeleton-rounded');
    } else if (variant === 'rounded-lg') {
      baseClasses.push('skeleton-rounded-lg');
    } else if (variant === 'text') {
      baseClasses.push('skeleton-text');
    }
    
    // نوع الحركة
    if (animation === 'pulse') {
      baseClasses.push('skeleton-pulse');
    } else if (animation === 'wave') {
      baseClasses.push('skeleton-wave');
    }
    
    // كلاسات إضافية
    if (className) {
      baseClasses.push(className);
    }
    
    return baseClasses.join(' ');
  };

  const getStyle = () => {
    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  };

  // للنص متعدد الأسطر
  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-paragraph">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${getSkeletonClasses()} line-${index + 1}`}
            style={getStyle()}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={getSkeletonClasses()}
      style={getStyle()}
    />
  );
};

// مكون هيكل بطاقة المنتج
export const ProductCardSkeleton = ({ variant = 'default' }) => {
  const cardClasses = [
    'skeleton-product-card',
    variant !== 'default' && variant
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="skeleton-product-image" />
      
      <div className="skeleton-product-content">
        <div className="skeleton-product-rating">
          <Skeleton variant="rounded" width="80px" height="16px" />
          <Skeleton variant="rounded" width="40px" height="14px" />
        </div>
        
        <Skeleton className="skeleton-product-title" />
        <Skeleton className="skeleton-product-title" width="70%" />
        
        <Skeleton className="skeleton-product-brand" />
        
        <div className="skeleton-product-price">
          <Skeleton className="skeleton-product-price-current" />
          <Skeleton className="skeleton-product-price-original" />
        </div>
        
        <div className="skeleton-product-actions">
          <Skeleton className="skeleton-product-button" />
          <Skeleton className="skeleton-product-icon" />
        </div>
      </div>
    </div>
  );
};

// مكون شبكة هياكل المنتجات
export const ProductGridSkeleton = ({ count = 8, columns = 4 }) => {
  const gridClasses = [
    'skeleton-products-grid',
    `grid-${columns}`
  ].join(' ');

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// مكون هيكل قائمة
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-list-item">
          <Skeleton 
            variant="circle" 
            width="48px" 
            height="48px" 
            className="skeleton-list-avatar" 
          />
          <div className="skeleton-list-content">
            <Skeleton className="skeleton-list-title" />
            <Skeleton className="skeleton-list-subtitle" />
          </div>
        </div>
      ))}
    </div>
  );
};

// مكون هيكل جدول
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <table className="skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }, (_, index) => (
            <th key={index}>
              <Skeleton className="skeleton-table-cell short" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <td key={colIndex}>
                <Skeleton 
                  className={`skeleton-table-cell ${
                    colIndex === 0 ? 'short' : 
                    colIndex === columns - 1 ? 'long' : ''
                  }`} 
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// مكون هيكل المقالة
export const ArticleSkeleton = () => {
  return (
    <div className="skeleton-article">
      <Skeleton className="skeleton-article-title" />
      
      <div className="skeleton-article-meta">
        <Skeleton className="skeleton-article-author" />
        <Skeleton className="skeleton-article-date" />
      </div>
      
      <Skeleton className="skeleton-article-image" />
      
      <div className="skeleton-article-paragraph">
        <Skeleton variant="text" lines={4} />
      </div>
      
      <div className="skeleton-article-paragraph">
        <Skeleton variant="text" lines={3} />
      </div>
      
      <div className="skeleton-article-paragraph">
        <Skeleton variant="text" lines={5} />
      </div>
    </div>
  );
};

// مكون هيكل النموذج
export const FormSkeleton = () => {
  return (
    <div className="skeleton-form">
      <div className="skeleton-form-group">
        <Skeleton className="skeleton-form-label" />
        <Skeleton className="skeleton-form-input" />
      </div>
      
      <div className="skeleton-form-group">
        <Skeleton className="skeleton-form-label" />
        <Skeleton className="skeleton-form-input" />
      </div>
      
      <div className="skeleton-form-group">
        <Skeleton className="skeleton-form-label" />
        <Skeleton className="skeleton-form-textarea" />
      </div>
      
      <Skeleton className="skeleton-form-button" />
    </div>
  );
};

// مكون للحالة الفارغة
export const EmptySkeleton = ({ 
  title = "لا توجد بيانات",
  subtitle = "جاري التحميل..."
}) => {
  return (
    <div className="skeleton-empty">
      <Skeleton className="skeleton-empty-icon" variant="circle" />
      <Skeleton className="skeleton-empty-title" />
      <Skeleton className="skeleton-empty-subtitle" />
    </div>
  );
};

export default Skeleton;
