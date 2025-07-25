// src/pages/Cart/ShoppingCartPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCartItems, updateCartItemQuantity, removeCartItem } from '../../api/cart';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/cart/ShoppingCartPage.css';

const ShoppingCartPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة لجلب عناصر السلة
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCartItems();
      const processedItems = data.cart_items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        product: {
          ...item.product,
          price: parseFloat(item.product.price),
        }
      }));
      setCartItems(processedItems);
      setTotalAmount(parseFloat(data.total_amount));
    } catch (err) {
      console.error('فشل تحميل السلة. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل السلة.';
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [fetchCart, authLoading]);

  // دالة لتغيير كمية منتج في السلة
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setLoading(true);
    try {
      await updateCartItemQuantity(cartItemId, newQuantity);
      await fetchCart();
    } catch (err) {
      console.error('فشل تحديث الكمية:', err);
      alert('فشل تحديث الكمية: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  // دالة لإزالة منتج من السلة
  const handleRemoveItem = async (cartItemId) => {
    // تأكد أن cartItemId له قيمة قبل إرسال الطلب
    if (!cartItemId) {
        console.error("خطأ: معرف عنصر السلة غير معرف (undefined).");
        alert("لا يمكن إزالة المنتج. معرف العنصر غير صالح.");
        return;
    }

    if (window.confirm('هل أنت متأكد أنك تريد إزالة هذا المنتج من السلة؟')) {
      setLoading(true);
      try {
        await removeCartItem(cartItemId);
        await fetchCart();
        alert('تم إزالة المنتج من السلة!');
      } catch (err) {
        console.error('فشل إزالة المنتج:', err);
        alert('فشل إزالة المنتج: ' + (err.message || JSON.stringify(err)));
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل السلة...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل السلة...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-info" role="alert">
          الرجاء <Link to="/login" className="alert-link">تسجيل الدخول</Link> لعرض سلة التسوق الخاصة بك.
        </div>
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

  return (
    <div className="container my-5">
      <h1 className="mb-4 fw-bold text-dark text-center">سلة التسوق</h1>

      {cartItems.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          سلة التسوق الخاصة بك فارغة. <Link to="/products" className="alert-link">ابدأ التسوق الآن!</Link>
        </div>
      ) : (
        <div className="row">
          {/* قائمة عناصر السلة */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header bg-light fw-bold py-3">
                عناصر السلة ({cartItems.length} منتج)
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {cartItems.map((item) => (
                    // ****** استخدام item.cart_item_id كـ key ******
                    <li key={item.cart_item_id} className="list-group-item d-flex align-items-center py-3">
                      <img
                        src={item.product.main_image_url || 'https://placehold.co/80x80/cccccc/333333?text=صورة'}
                        alt={item.product.name}
                        className="img-thumbnail me-3"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/cccccc/333333?text=خطأ"; }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{item.product.name}</h6>
                        <p className="mb-1 text-muted small">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control text-center me-2"
                          style={{ width: '70px' }}
                          value={item.quantity}
                          // ****** تمرير item.cart_item_id إلى handleQuantityChange ******
                          onChange={(e) => handleQuantityChange(item.cart_item_id, parseInt(e.target.value) || 0)}
                          min="0"
                        />
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.cart_item_id)}> {/* ****** تمرير item.cart_item_id هنا ****** */}
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ملخص السلة */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header bg-light fw-bold py-3">
                ملخص الطلب
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>المجموع الفرعي:</span>
                  <span className="fw-bold">${totalAmount.toFixed(2)}</span>
                </div>
                {/* يمكن إضافة رسوم الشحن والضرائب هنا لاحقاً */}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fs-5 fw-bold">المجموع الكلي:</span>
                  <span className="fs-5 fw-bold text-primary">${totalAmount.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn btn-success w-100 py-2 fw-bold">
                  إتمام الشراء <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartPage;
