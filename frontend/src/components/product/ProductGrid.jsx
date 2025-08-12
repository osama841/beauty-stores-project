// ===== src/components/product/ProductGrid.jsx =====
import React from 'react';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';

const ProductGrid = ({
  products = [],
  loading = false,
  error = null,
  emptyStateVariant = 'search',
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  columns = 'auto', // auto, 2, 3, 4, 5, 6
  gap = 'md', // sm, md, lg
  className = '',
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  ...props
}) => {
  const getGridClasses = () => {
    const baseClasses = ['products-grid'];
    
    if (columns !== 'auto') {
      baseClasses.push(`grid-${columns}`);
    }
    
    baseClasses.push(`gap-${gap}`);
    
    if (className) baseClasses.push(className);
    
    return baseClasses.join(' ');
  };

  // حالة التحميل
  if (loading) {
    return (
      <div className={getGridClasses()}>
        <ProductGridSkeleton count={8} columns={columns === 'auto' ? 4 : columns} />
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <EmptyState
        variant="error"
        title="خطأ في تحميل المنتجات"
        description={error.message || "تعذر تحميل المنتجات. يرجى المحاولة مرة أخرى"}
        action={emptyStateAction}
      />
    );
  }

  // حالة عدم وجود منتجات
  if (!products || products.length === 0) {
    return (
      <EmptyState
        variant={emptyStateVariant}
        title={emptyStateTitle}
        description={emptyStateDescription}
        action={emptyStateAction}
      />
    );
  }

  // التحقق من وجود المنتج في قائمة الرغبات
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => 
      item.product_id === productId || item.id === productId
    );
  };

  return (
    <div className={getGridClasses()} {...props}>
      {products.map((product) => (
        <ProductCard
          key={product.product_id || product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist(product.product_id || product.id)}
        />
      ))}
    </div>
  );
};

// مكون شبكة منتجات مع ترقيم الصفحات
export const PaginatedProductGrid = ({
  products,
  loading,
  error,
  pagination,
  onPageChange,
  ...gridProps
}) => {
  return (
    <div className="paginated-product-grid">
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        {...gridProps}
      />
      
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-wrapper">
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

// مكون شبكة منتجات مميزة
export const FeaturedProductGrid = ({
  title = "منتجات مميزة",
  subtitle,
  viewAllLink,
  viewAllText = "عرض الكل",
  ...gridProps
}) => {
  return (
    <section className="featured-products-section">
      <div className="section-header">
        <div className="section-titles">
          <h2 className="section-title">{title}</h2>
          {subtitle && (
            <p className="section-subtitle">{subtitle}</p>
          )}
        </div>
        
        {viewAllLink && (
          <a href={viewAllLink} className="section-link">
            {viewAllText}
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
          </a>
        )}
      </div>
      
      <ProductGrid {...gridProps} />
    </section>
  );
};

// مكون مساعد للترقيم البسيط
const Pagination = ({ current, total, onChange }) => {
  const pages = [];
  const showPages = 5; // عدد الصفحات المرئية
  
  let startPage = Math.max(1, current - Math.floor(showPages / 2));
  let endPage = Math.min(total, startPage + showPages - 1);
  
  // تعديل النطاق إذا كان قريباً من النهاية
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <nav className="pagination" aria-label="ترقيم الصفحات">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="الصفحة السابقة"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
      
      {startPage > 1 && (
        <>
          <button
            className="pagination-btn"
            onClick={() => onChange(1)}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="pagination-ellipsis">...</span>
          )}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          className={`pagination-btn ${page === current ? 'active' : ''}`}
          onClick={() => onChange(page)}
          aria-current={page === current ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {endPage < total && (
        <>
          {endPage < total - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            className="pagination-btn"
            onClick={() => onChange(total)}
          >
            {total}
          </button>
        </>
      )}
      
      <button
        className="pagination-btn pagination-next"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="الصفحة التالية"
      >
        <i className="bi bi-chevron-left"></i>
      </button>
    </nav>
  );
};

export default ProductGrid;