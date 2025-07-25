// src/pages/Checkout/CheckoutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCartItems } from '../../api/cart';
import { placeOrder } from '../../api/checkout';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/checkout/CheckoutPage.css';

const CheckoutPage = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة نموذج الشحن
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // هذا الاسم في الواجهة الأمامية

  // حالة نموذج الدفع
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // حالة الدفع الأولية

  const [formError, setFormError] = useState(null); // لأخطاء النموذج العامة
  const [validationErrors, setValidationErrors] = useState({}); // لأخطاء التحقق من Laravel

  // جلب عناصر السلة عند تحميل الصفحة
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCartItems();
      if (data.cart_items.length === 0) {
        alert('سلة التسوق الخاصة بك فارغة. الرجاء إضافة منتجات قبل إتمام الشراء.');
        navigate('/cart');
        return;
      }
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
      console.error('فشل تحميل السلة لإتمام الشراء:', err);
      let errorMessage = 'حدث خطأ أثناء تحميل السلة لإتمام الشراء.';
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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [fetchCart, authLoading]);

  // دالة لمعالجة إرسال نموذج إتمام الشراء
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const orderData = {
      shipping_address: {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        state: state,
        postal_code: postalCode,
        country: country,
        phone_number: phoneNumber, // ****** هذا الاسم يجب أن يتطابق مع 'phone_number' في Laravel ******
        address_type: 'shipping', // ****** هذا الاسم يجب أن يتطابق مع 'address_type' في Laravel ******
        is_default: false, // ****** هذا الاسم يجب أن يتطابق مع 'is_default' في Laravel ******
      },
      payment: {
        method: paymentMethod, // ****** هذا الاسم يجب أن يتطابق مع 'method' في Laravel ******
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv,
        status: paymentStatus, // ****** هذا الاسم يجب أن يتطابق مع 'status' في Laravel ******
        amount: totalAmount, // ****** هذا الاسم يجب أن يتطابق مع 'amount' في Laravel ******
        currency: 'USD', // ****** هذا الاسم يجب أن يتطابق مع 'currency' في Laravel ******
        transaction_id: 'TRX_' + Math.random().toString(36).substring(2, 15), // ****** هذا الاسم يجب أن يتطابق مع 'transaction_id' في Laravel ******
        payment_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // ****** هذا الاسم يجب أن يتطابق مع 'payment_date' في Laravel ******
        gateway_response: 'Simulated response', // ****** هذا الاسم يجب أن يتطابق مع 'gateway_response' في Laravel ******
        card_number_last_four: cardNumber ? cardNumber.slice(-4) : null, // ****** هذا الاسم يجب أن يتطابق مع 'card_number_last_four' في Laravel ******
      },
      notes: '',
    };

    setLoading(true);
    try {
      const response = await placeOrder(orderData);
      alert('تم تقديم طلبك بنجاح!');
      navigate(`/order-confirmation/${response.order.order_id}`);
    } catch (err) {
      console.error('فشل تقديم الطلب:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(err.message || 'الرجاء التحقق من الحقول المدخلة لتقديم الطلب.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع أثناء تقديم الطلب.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل صفحة إتمام الشراء...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل صفحة إتمام الشراء...</p>
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

  if (!isAuthenticated) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-info" role="alert">
          الرجاء <Link to="/login" className="alert-link">تسجيل الدخول</Link> لإتمام الشراء.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4 fw-bold text-dark text-center">إتمام الشراء</h1>

      <div className="row g-4">
        {/* ملخص الطلب (على اليمين في الشاشات الكبيرة) */}
        <div className="col-lg-4 order-lg-last">
          <div className="card shadow-sm border-0 rounded-lg mb-4">
            <div className="card-header bg-light fw-bold py-3">
              ملخص طلبك
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush mb-3">
                {cartItems.map((item) => (
                  <li key={item.cart_id} className="list-group-item d-flex justify-content-between align-items-center small">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>${(item.quantity * item.product.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between fw-bold mb-2">
                <span>المجموع الفرعي:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              {/* يمكن إضافة رسوم الشحن والضرائب هنا لاحقاً */}
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-bold text-primary">
                <span>المجموع الكلي:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* نموذج إتمام الشراء (على اليسار في الشاشات الكبيرة) */}
        <div className="col-lg-8 order-lg-first">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <h2 className="mb-4 fw-bold text-dark">عنوان الشحن</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="addressLine1" className="form-label">العنوان 1:</label>
                  <input type="text" id="addressLine1" className={`form-control ${validationErrors['shipping_address.address_line1'] ? 'is-invalid' : ''}`} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
                  {validationErrors['shipping_address.address_line1'] && <div className="invalid-feedback">{validationErrors['shipping_address.address_line1'][0]}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="addressLine2" className="form-label">العنوان 2 (اختياري):</label>
                  <input type="text" id="addressLine2" className={`form-control ${validationErrors['shipping_address.address_line2'] ? 'is-invalid' : ''}`} value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                  {validationErrors['shipping_address.address_line2'] && <div className="invalid-feedback">{validationErrors['shipping_address.address_line2'][0]}</div>}
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="city" className="form-label">المدينة:</label>
                  <input type="text" id="city" className={`form-control ${validationErrors['shipping_address.city'] ? 'is-invalid' : ''}`} value={city} onChange={(e) => setCity(e.target.value)} required />
                  {validationErrors['shipping_address.city'] && <div className="invalid-feedback">{validationErrors['shipping_address.city'][0]}</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="state" className="form-label">الولاية/المحافظة (اختياري):</label>
                  <input type="text" id="state" className={`form-control ${validationErrors['shipping_address.state'] ? 'is-invalid' : ''}`} value={state} onChange={(e) => setState(e.target.value)} />
                  {validationErrors['shipping_address.state'] && <div className="invalid-feedback">{validationErrors['shipping_address.state'][0]}</div>}
                </div>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label htmlFor="postalCode" className="form-label">الرمز البريدي:</label>
                  <input type="text" id="postalCode" className={`form-control ${validationErrors['shipping_address.postal_code'] ? 'is-invalid' : ''}`} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                  {validationErrors['shipping_address.postal_code'] && <div className="invalid-feedback">{validationErrors['shipping_address.postal_code'][0]}</div>}
                </div>
                <div className="col-md-4">
                  <label htmlFor="country" className="form-label">البلد:</label>
                  <input type="text" id="country" className={`form-control ${validationErrors['shipping_address.country'] ? 'is-invalid' : ''}`} value={country} onChange={(e) => setCountry(e.target.value)} required />
                  {validationErrors['shipping_address.country'] && <div className="invalid-feedback">{validationErrors['shipping_address.country'][0]}</div>}
                </div>
                <div className="col-md-4">
                  <label htmlFor="phoneNumber" className="form-label">رقم الهاتف (اختياري):</label>
                  <input type="tel" id="phoneNumber" className={`form-control ${validationErrors['shipping_address.phone_number'] ? 'is-invalid' : ''}`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  {validationErrors['shipping_address.phone_number'] && <div className="invalid-feedback">{validationErrors['shipping_address.phone_number'][0]}</div>}
                </div>
              </div>

              <h2 className="mb-4 fw-bold text-dark">طريقة الدفع</h2>
              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="paymentMethod" id="creditCard" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="creditCard">
                    بطاقة ائتمان / خصم
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="paymentMethod" id="paypal" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="paypal">
                    PayPal
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="paymentMethod" id="cashOnDelivery" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="cashOnDelivery">
                    الدفع عند الاستلام
                  </label>
                </div>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="cardNumber" className="form-label">رقم البطاقة:</label>
                    <input type="text" id="cardNumber" className={`form-control ${validationErrors['payment.card_number'] ? 'is-invalid' : ''}`} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required={paymentMethod === 'credit_card'} />
                    {validationErrors['payment.card_number'] && <div className="invalid-feedback">{validationErrors['payment.card_number'][0]}</div>}
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="expiryDate" className="form-label">تاريخ الانتهاء (MM/YY):</label>
                    <input type="text" id="expiryDate" className={`form-control ${validationErrors['payment.expiry_date'] ? 'is-invalid' : ''}`} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YY" required={paymentMethod === 'credit_card'} />
                    {validationErrors['payment.expiry_date'] && <div className="invalid-feedback">{validationErrors['payment.expiry_date'][0]}</div>}
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="cvv" className="form-label">CVV:</label>
                    <input type="text" id="cvv" className={`form-control ${validationErrors['payment.cvv'] ? 'is-invalid' : ''}`} value={cvv} onChange={(e) => setCvv(e.target.value)} required={paymentMethod === 'credit_card'} />
                    {validationErrors['payment.cvv'] && <div className="invalid-feedback">{validationErrors['payment.cvv'][0]}</div>}
                  </div>
                </div>
              )}

              {formError && <div className="alert alert-danger">{formError}</div>}
              <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>
                {loading ? 'جاري تقديم الطلب...' : 'تأكيد الطلب والدفع'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
