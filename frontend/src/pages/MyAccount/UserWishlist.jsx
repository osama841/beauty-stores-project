// src/pages/MyAccount/UserWishlist.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getWishlistItems, removeProductFromWishlist } from '../../api/wishlist';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/ProductCard';
import '../../styles/user/UserWishlist.css';

const UserWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlistItems();
      setWishlistItems(data);
    } catch (err) {
      console.error('فشل تحميل قائمة الرغبات:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل قائمة الرغبات.';
      if (err && typeof err === 'object') {
          if (err.message) {
              errorMessage = err.message;
          }
          if (err.errors) {
              errorMessage = Object.values(err.errors).flat().join(' ');
          } else if (err.error) {
              errorMessage = err.error;
          }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    if (window.confirm('هل أنت متأكد أنك تريد إزالة هذا المنتج من قائمة الرغبات؟')) {
      try {
        await removeProductFromWishlist(productId);
        alert('تمت إزالة المنتج بنجاح من قائمة الرغبات!');
        fetchWishlist();
      } catch (err) {
        console.error('فشل إزالة المنتج من قائمة الرغبات:', err);
        alert('فشل إزالة المنتج من قائمة الرغبات: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل قائمة الرغبات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل قائمة الرغبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg border-0 rounded-lg p-4 bg-white">
      <h1 className="mb-4 fw-bold text-primary">قائمة الرغبات</h1>
      {wishlistItems.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          قائمة الرغبات الخاصة بك فارغة. <Link to="/products" className="alert-link">تصفح منتجاتنا الآن!</Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {wishlistItems.map((item) => (
            <div className="col" key={item.wishlist_id}>
              {/* Card Product */}
              {item.product ? (
                <div className="card h-100 shadow-sm border-0 rounded-lg">
                  <Link to={`/products/${item.product.product_id}`} className="text-decoration-none text-dark">
                    <img
                      src={item.product.main_image_url || 'https://placehold.co/300x200/ADD8E6/000000?text=صورة+المنتج'}
                      alt={item.product.name}
                      className="card-img-top p-3 rounded-top"
                      style={{ objectFit: 'contain', height: '200px' }}
                      loading="lazy" // ****** إضافة Lazy Loading ******
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=خطأ"; }}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title fw-bold mb-2">{item.product.name}</h5>
                      <p className="card-text text-primary fs-5 fw-bold mb-3">${item.product.price ? parseFloat(item.product.price).toFixed(2) : '0.00'}</p>
                    </div>
                  </Link>
                  <div className="card-footer bg-transparent border-top-0 text-center">
                    <button
                      className="btn btn-danger w-100 fw-bold"
                      onClick={() => handleRemoveFromWishlist(item.product.product_id)}
                    >
                      <i className="bi bi-trash"></i> إزالة من القائمة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  المنتج المرتبط بهذا العنصر غير موجود.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
