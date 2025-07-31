// src/pages/Checkout/CheckoutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCartItems } from '../../api/cart';
import { placeOrder } from '../../api/checkout';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/checkout/CheckoutPage.css';

const CheckoutPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // 'user' غير مستخدم حاليًا
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // لخطأ جلب السلة أو حالات عامة

  // حالة نموذج الشحن
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // حالة نموذج الدفع
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const [formError, setFormError] = useState(null); // لأخطاء النموذج العامة بعد الإرسال
  const [validationErrors, setValidationErrors] = useState({}); // لأخطاء التحقق من Laravel

  // جلب عناصر السلة عند تحميل الصفحة
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    setCartItems([]); // **إعادة تعيين للتأكد من أنها مصفوفة فارغة قبل الجلب**
    setTotalAmount(0); // إعادة تعيين المبلغ الإجمالي

    try {
      const data = await getCartItems();

      // **فحص دفاعي: التأكد من أن data و data.cart_items موجودين ومصفوفة**
      if (!data || !Array.isArray(data.cart_items)) {
        console.warn('استجابة API لعناصر سلة التسوق ليست مصفوفة أو فارغة:', data);
        alert('حدث خطأ في استجابة سلة التسوق، الرجاء المحاولة مرة أخرى.');
        setCartItems([]); // التأكد من إعادة تعيينها لمصفوفة فارغة
        setTotalAmount(0);
        navigate('/cart'); // إعادة توجيه إذا كانت البيانات مشوهة
        return;
      }

      if (data.cart_items.length === 0) {
        alert('سلة التسوق الخاصة بك فارغة. الرجاء إضافة منتجات قبل إتمام الشراء.');
        setCartItems([]);
        setTotalAmount(0);
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
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = `خطأ من الخادم: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'لا توجد استجابة من الخادم. الرجاء التحقق من اتصالك بالإنترنت.';
      } else {
        errorMessage = err.message || 'حدث خطأ غير متوقع.';
      }
      setError(errorMessage);
      setCartItems([]); // **حاسم: إعادة تعيين لمصفوفة فارغة عند الخطأ لضمان .map() يعمل**
      setTotalAmount(0); // إعادة تعيين المجموع عند الخطأ
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

    // **ملاحظة: لا ترسل CVV إلى الـ Backend إذا كنت لا تنوي تخزينه بأمان (لا يوصى بتخزينه)**
    // للتجربة، أرسلته سابقًا. للأمان، يجب التعامل مع الدفع عبر خدمة خارجية.
    // للحفاظ على التناسق مع الـ Backend، سأبقيه حاليًا ولكن مع ملاحظة أمنية.
    const orderData = {
      shipping_address: {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        state: state,
        postal_code: postalCode,
        country: country,
        phone_number: phoneNumber,
        address_type: 'shipping',
        is_default: false,
      },
      payment: {
        method: paymentMethod,
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv, // **أمنيًا: لا يوصى بإرسال أو تخزين CVV.**
        status: paymentStatus,
        amount: totalAmount, // **استخدام totalAmount من حالة الـ frontend**
        currency: 'USD',
        transaction_id: 'TRX_' + Math.random().toString(36).substring(2, 15),
        payment_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        gateway_response: 'Simulated response',
        card_number_last_four: cardNumber ? cardNumber.slice(-4) : null,
      },
      notes: '',
      // 'shipping_method' أصبحت اختيارية في الـ Backend، يمكنك إرسالها أو لا
      shipping_method: 'standard', // قيمة افتراضية أو اتركها فارغة إذا لم يتم اختيارها
    };

    setLoading(true);
    try {
      const response = await placeOrder(orderData);
      alert('تم تقديم طلبك بنجاح!');
      navigate(`/order-confirmation/${response.order.order_id}`);
    } catch (err) {
      console.error('فشل تقديم الطلب:', err);
      // معالجة أفضل لرسائل الخطأ من Axios
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          // أخطاء التحقق من صحة Laravel
          setValidationErrors(err.response.data.errors);
          setFormError(err.response.data.message || 'الرجاء التحقق من الحقول المدخلة لتقديم الطلب.');
        } else {
          // أخطاء أخرى من الخادم (مثلاً 500)
          setFormError(err.response.data.message || err.response.data.error || `خطأ في الخادم: ${err.response.status}`);
        }
      } else if (err.request) {
        // الطلب تم إرساله ولكن لم يتم تلقي استجابة
        setFormError('لا توجد استجابة من الخادم. الرجاء التحقق من اتصالك بالإنترنت.');
      } else {
        // خطأ آخر في إعداد الطلب
        setFormError(err.message || 'حدث خطأ غير متوقع أثناء تقديم الطلب.');
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
                {/* هنا تم التأكد من أن cartItems هي دائمًا مصفوفة */}
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