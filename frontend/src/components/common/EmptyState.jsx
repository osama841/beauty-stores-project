// ===== src/components/common/EmptyState.jsx =====
import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText,
  onAction,
  variant = 'default', // default, search, error, cart, wishlist, orders
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) => {
  const getEmptyStateClasses = () => {
    const baseClasses = ['empty-state'];
    
    baseClasses.push(`empty-state-${variant}`);
    baseClasses.push(`empty-state-${size}`);
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  const getDefaultContent = () => {
    switch (variant) {
      case 'search':
        return {
          icon: 'bi bi-search',
          title: 'لا توجد نتائج',
          description: 'جرب تغيير كلمات البحث أو إزالة بعض المرشحات'
        };
      
      case 'cart':
        return {
          icon: 'bi bi-bag',
          title: 'سلة التسوق فارغة',
          description: 'أضف بعض المنتجات لتبدأ التسوق',
          actionText: 'تصفح المنتجات'
        };
      
      case 'wishlist':
        return {
          icon: 'bi bi-heart',
          title: 'قائمة الأمنيات فارغة',
          description: 'احفظ المنتجات المفضلة لديك هنا',
          actionText: 'تصفح المنتجات'
        };
      
      case 'orders':
        return {
          icon: 'bi bi-box',
          title: 'لا توجد طلبات',
          description: 'لم تقم بأي طلبات حتى الآن',
          actionText: 'تصفح المنتجات'
        };
      
      case 'error':
        return {
          icon: 'bi bi-exclamation-triangle',
          title: 'حدث خطأ',
          description: 'تعذر تحميل البيانات. يرجى المحاولة مرة أخرى',
          actionText: 'إعادة المحاولة'
        };
      
      default:
        return {
          icon: 'bi bi-inbox',
          title: 'لا توجد بيانات',
          description: 'لا توجد عناصر لعرضها في الوقت الحالي'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayDescription = description || defaultContent.description;
  const displayActionText = actionText || defaultContent.actionText;
  const displayAction = action || (displayActionText && onAction);

  return (
    <div className={getEmptyStateClasses()} {...props}>
      {displayIcon && (
        <div className="empty-state-icon">
          {typeof displayIcon === 'string' ? (
            <i className={displayIcon} aria-hidden="true"></i>
          ) : (
            displayIcon
          )}
        </div>
      )}
      
      {displayTitle && (
        <h3 className="empty-state-title">
          {displayTitle}
        </h3>
      )}
      
      {displayDescription && (
        <p className="empty-state-description">
          {displayDescription}
        </p>
      )}
      
      {displayAction && (
        <div className="empty-state-action">
          {typeof displayAction === 'function' ? (
            <Button
              variant="primary"
              onClick={displayAction}
            >
              {displayActionText}
            </Button>
          ) : (
            displayAction
          )}
        </div>
      )}
    </div>
  );
};

// مكونات مختصرة لحالات شائعة
export const SearchEmptyState = (props) => (
  <EmptyState variant="search" {...props} />
);

export const CartEmptyState = (props) => (
  <EmptyState variant="cart" {...props} />
);

export const WishlistEmptyState = (props) => (
  <EmptyState variant="wishlist" {...props} />
);

export const OrdersEmptyState = (props) => (
  <EmptyState variant="orders" {...props} />
);

export const ErrorEmptyState = (props) => (
  <EmptyState variant="error" {...props} />
);

export default EmptyState;