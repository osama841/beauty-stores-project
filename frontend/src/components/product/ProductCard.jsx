// ===== src/components/product/ProductCard.jsx =====
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BiHeart, 
  BiHeartFill, 
  BiShoppingBag,
  BiStar,
  BiStarFill,
  BiStarHalf 
} from 'react-icons/bi';
import { useToast } from '../common/Toast';
import Button from '../common/Button';

const ProductCard = ({ 
  product, 
  variant = 'default', // default, horizontal, compact
  showWishlist = true,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  loading = false
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const toast = useToast();

  // التحقق من صحة بيانات المنتج
  if (!product) {
    return null;
  }

  const {
    product_id,
    name,
    price,
    sale_price,
    image_url,
    brand_name,
    avg_rating,
    review_count,
    stock_quantity,
    is_featured
  } = product;

  // حساب نسبة الخصم
  const hasDiscount = sale_price && sale_price < price;
  const discountPercentage = hasDiscount 
    ? Math.round(((price - sale_price) / price) * 100)
    : 0;

  // السعر النهائي
  const finalPrice = sale_price || price;

  // حالة نفاد المخزون
  const isOutOfStock = stock_quantity === 0;

  // تقييم بالنجوم
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<BiStarFill key={i} />);
    }
    
    if (hasHalfStar) {
      stars.push(<BiStarHalf key="half" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<BiStar key={`empty-${i}`} />);
    }
    
    return stars;
  };

  // إضافة للسلة
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    try {
      if (onAddToCart) {
        await onAddToCart(product);
        toast.success('تمت إضافة المنتج للسلة بنجاح');
      }
    } catch (error) {
      console.error('خطأ في إضافة المنتج للسلة:', error);
      toast.error('فشل في إضافة المنتج للسلة');
    }
  };

  // إضافة/إزالة من قائمة الرغبات
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    
    try {
      if (onToggleWishlist) {
        await onToggleWishlist(product);
        const message = isInWishlist 
          ? 'تمت إزالة المنتج من قائمة الرغبات'
          : 'تمت إضافة المنتج لقائمة الرغبات';
        toast.success(message);
      }
    } catch (error) {
      console.error('خطأ في تحديث قائمة الرغبات:', error);
      toast.error('فشل في تحديث قائمة الرغبات');
    }
  };

  // معالجة خطأ تحميل الصورة
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const cardClasses = [
    'product-card',
    variant !== 'default' && variant,
    isOutOfStock && 'out-of-stock'
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* صورة المنتج */}
      <div className="product-card-image">
        <Link to={`/products/${product_id}`}>
          {imageLoading && !imageError && (
            <div className="skeleton skeleton-product-image" />
          )}
          
          {!imageError ? (
            <img
              src={image_url || '/placeholder-product.jpg'}
              alt={name}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          ) : (
            <div className="product-image-placeholder">
              <span>لا توجد صورة</span>
            </div>
          )}
        </Link>

        {/* شارات المنتج */}
        <div className="product-badges">
          {hasDiscount && (
            <span className="product-badge sale">
              -{discountPercentage}%
            </span>
          )}
          {is_featured && (
            <span className="product-badge new">
              مميز
            </span>
          )}
          {isOutOfStock && (
            <span className="product-badge out-of-stock">
              نفذت الكمية
            </span>
          )}
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="product-card-content">
        {/* العلامة التجارية */}
        {brand_name && (
          <div className="product-brand">{brand_name}</div>
        )}

        {/* التقييم */}
        {avg_rating > 0 && (
          <div className="product-rating">
            <div className="product-stars">
              {renderStars(avg_rating)}
            </div>
            {review_count > 0 && (
              <span className="product-rating-count">
                ({review_count})
              </span>
            )}
          </div>
        )}

        {/* عنوان المنتج */}
        <h3 className="product-card-title">
          <Link to={`/products/${product_id}`}>
            {name}
          </Link>
        </h3>

        {/* الأسعار */}
        <div className="product-price">
          <span className="product-price-current">
            {finalPrice?.toLocaleString('ar-SA')} ر.س
          </span>
          
          {hasDiscount && (
            <>
              <span className="product-price-original">
                {price?.toLocaleString('ar-SA')} ر.س
              </span>
              <span className="product-discount">
                وفر {discountPercentage}%
              </span>
            </>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="product-card-actions">
          <Button
            variant={isOutOfStock ? 'secondary' : 'primary'}
            size="sm"
            className="product-add-to-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            loading={loading}
            icon={<BiShoppingBag />}
            aria-label={`إضافة ${name} للسلة`}
          >
            {isOutOfStock ? 'نفذت الكمية' : 'أضف للسلة'}
          </Button>

          {showWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className={`product-wishlist ${isInWishlist ? 'active' : ''}`}
              onClick={handleToggleWishlist}
              disabled={loading}
              icon={isInWishlist ? <BiHeartFill /> : <BiHeart />}
              aria-label={
                isInWishlist 
                  ? `إزالة ${name} من قائمة الرغبات`
                  : `إضافة ${name} لقائمة الرغبات`
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
