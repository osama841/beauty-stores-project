// src/pages/Products/ProductDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../api/products';
import { getReviewsByProductId, addReview } from '../../api/reviews';
// ⛔️ حُذف: import { addProductToCart } from '../../api/cart';
import { addProductToWishlist } from '../../api/wishlist';
import ReviewForm from '../../components/ReviewForm';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';   // ✅ ربط بسياق السلة
import '../../styles/products/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { add } = useCart();                           // ✅ دالة الإضافة من السياق

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [mainDisplayImage, setMainDisplayImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productData = await getProductById(id);
      const processedProduct = {
        ...productData,
        price: parseFloat(productData.price),
        compare_at_price: productData.compare_at_price ? parseFloat(productData.compare_at_price) : null,
        cost_price: productData.cost_price ? parseFloat(productData.cost_price) : null,
        stock_quantity: parseInt(productData.stock_quantity),
        weight: productData.weight ? parseFloat(productData.weight) : null,
        length: productData.length ? parseFloat(productData.length) : null,
        width: productData.width ? parseFloat(productData.width) : null,
        height: productData.height ? parseFloat(productData.height) : null,
      };
      setProduct(processedProduct);
      setMainDisplayImage(processedProduct.main_image_url || 'https://placehold.co/600x400/cccccc/333333?text=لا+توجد+صورة');

      const productReviews = await getReviewsByProductId(id);
      setReviews(productReviews);
    } catch (err) {
      console.error('فشل تحميل تفاصيل المنتج. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل تفاصيل المنتج.';
      if (err && typeof err === 'object') {
        if (err.message) errorMessage = err.message;
        if (err.errors) errorMessage = Object.values(err.errors).flat().join(' ');
        else if (err.error) errorMessage = err.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('الرجاء تسجيل الدخول لإضافة منتجات إلى السلة.');
      return;
    }
    if (product.stock_quantity === 0) {
      alert('عذراً، هذا المنتج نفد من المخزون.');
      return;
    }
    if (quantity <= 0 || quantity > product.stock_quantity) {
      alert(`الرجاء إدخال كمية صالحة بين 1 و ${product.stock_quantity}.`);
      return;
    }

    try {
      // ✅ عبر سياق السلة — يحدّث العدّاد فورًا
      await add(product.product_id, quantity);
      alert(`${quantity} من ${product.name} تم إضافتها إلى السلة بنجاح!`);
    } catch (err) {
      console.error('فشل إضافة المنتج إلى السلة:', err);
      alert('فشل إضافة المنتج إلى السلة: ' + (err.message || JSON.stringify(err)));
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      alert('الرجاء تسجيل الدخول لإضافة منتجات إلى قائمة الرغبات.');
      return;
    }
    try {
      await addProductToWishlist(product.product_id);
      alert(`${product.name} تم إضافته إلى قائمة الرغبات بنجاح!`);
    } catch (err) {
      console.error('فشل إضافة المنتج إلى قائمة الرغبات:', err);
      alert('فشل إضافة المنتج إلى قائمة الرغبات: ' + (err.message || JSON.stringify(err)));
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const newReview = await addReview({ ...reviewData, product_id: id });
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setShowReviewForm(false);
      alert('تم إرسال مراجعتك بنجاح! ستظهر بعد مراجعة المسؤول.');
    } catch (err) {
      console.error('خطأ في إرسال المراجعة:', err);
      throw err;
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل تفاصيل المنتج...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-warning" role="alert">
          المنتج المطلوب غير موجود.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        {/* معرض الصور */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="card shadow-lg border-0 rounded-lg p-3">
            <img
              src={mainDisplayImage}
              alt={product.name}
              className="img-fluid rounded mb-3 product-main-image"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/333333?text=لا+توجد+صورة"; }}
            />
            {(product.images && product.images.length > 0) && (
              <div className="d-flex flex-wrap justify-content-center gap-2 product-additional-images">
                {product.main_image_url && (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="img-thumbnail"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onClick={() => setMainDisplayImage(product.main_image_url)}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/cccccc/333333?text=خطأ"; }}
                  />
                )}
                {product.images.map((image) => (
                  <img
                    key={image.image_id}
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    className="img-thumbnail product-thumb"
                    onClick={() => setMainDisplayImage(image.image_url)}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/cccccc/333333?text=خطأ"; }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="col-md-6">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <h1 className="mb-3 fw-bold text-dark">{product.name}</h1>
            <p className="lead text-primary fs-3 fw-bold mb-3">${product.price.toFixed(2)}</p>
            {product.compare_at_price && (
              <p className="text-muted small mb-3">
                <del>${product.compare_at_price.toFixed(2)}</del>
                <span className="ms-2 text-success fw-bold">وفر ${(product.compare_at_price - product.price).toFixed(2)}</span>
              </p>
            )}

            <div className="d-flex align-items-center mb-3">
              <div className="review-rating me-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className={`bi ${i < calculateAverageRating() ? 'bi-star-fill' : 'bi-star'}`}></i>
                ))}
              </div>
              <span className="text-muted small">({reviews.length} مراجعة)</span>
            </div>

            <p className="mb-4 text-muted">{product.short_description}</p>
            <p className="mb-4">{product.description}</p>

            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>الفئة:</strong>
                <span>{product.category ? product.category.name : 'غير محدد'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>العلامة التجارية:</strong>
                <span>{product.brand ? product.brand.name : 'غير محدد'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <strong>الكمية المتوفرة:</strong>
                <span className={product.stock_quantity > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} في المخزون` : 'نفد المخزون'}
                </span>
              </li>
              {product.sku && (
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <strong>SKU:</strong>
                  <span>{product.sku}</span>
                </li>
              )}
              {product.attributes && product.attributes.length > 0 && (
                <li className="list-group-item">
                  <strong>السمات:</strong>
                  <ul className="list-unstyled mb-0 mt-2">
                    {product.attributes.map((attr, index) => (
                      <li key={index} className="small text-muted">{attr.attribute_name}: {attr.attribute_value}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center mb-3">
              <label htmlFor="productQuantity" className="form-label me-2 mb-0">الكمية:</label>
              <input
                type="number"
                id="productQuantity"
                className="form-control w-auto me-3"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock_quantity}
                disabled={product.stock_quantity === 0}
              />
              <div className="d-flex w-100 gap-2">
                <button
                  className="btn btn-warning btn-lg w-100 fw-bold shadow-sm"
                  disabled={product.stock_quantity === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock_quantity > 0 ? 'أضف إلى السلة' : 'نفد المخزون'}
                </button>
                <button
                  className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center"
                  onClick={handleAddToWishlist}
                >
                  <i className="bi bi-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم المراجعات */}
      <div className="mt-5 p-4 bg-white rounded shadow-lg">
        <h2 className="mb-4 fw-bold text-dark">مراجعات العملاء</h2>
        {isAuthenticated ? (
          <button
            className="btn btn-outline-primary mb-4"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <i className="bi bi-pencil-square me-2"></i> {showReviewForm ? 'إلغاء المراجعة' : 'اكتب مراجعة'}
          </button>
        ) : (
          <p className="text-muted mb-4">الرجاء <Link to="/login" className="text-decoration-none fw-bold">تسجيل الدخول</Link> لكتابة مراجعة.</p>
        )}

        {showReviewForm && (
          <ReviewForm onSubmit={handleReviewSubmit} product_id={product.product_id} user={user} />
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-muted fs-5 mt-4">لا توجد مراجعات لهذا المنتج حتى الآن. كن أول من يراجع!</p>
        ) : (
          <div className="reviews-list mt-4">
            {reviews.map((review) => (
              <div key={review.review_id} className="review-item mb-4 pb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="review-rating me-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                    ))}
                  </div>
                  <span className="fw-bold text-dark">{review.title}</span>
                </div>
                <p className="mb-2 text-muted">{review.comment}</p>
                <p className="text-end small text-secondary mb-0">
                  بواسطة {review.user ? review.user.username : 'مستخدم غير معروف'} في {new Date(review.review_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;