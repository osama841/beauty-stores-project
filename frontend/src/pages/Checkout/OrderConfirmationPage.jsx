    // src/pages/Checkout/OrderConfirmationPage.jsx
    import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { getOrderById } from '../../api/orders'; // لجلب تفاصيل الطلب
    import '../../styles/checkout/OrderConfirmationPage.css';

    const OrderConfirmationPage = () => {
      const { orderId } = useParams(); // جلب معرف الطلب من الـ URL
      const [order, setOrder] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const fetchOrderDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getOrderById(orderId);
          // تحويل القيم الرقمية في تفاصيل الطلب
          const processedOrder = {
            ...data,
            total_amount: parseFloat(data.total_amount),
            order_items: data.order_items.map(item => ({
              ...item,
              price_at_purchase: parseFloat(item.price_at_purchase),
            })),
          };
          setOrder(processedOrder);
        } catch (err) {
          console.error('فشل تحميل تفاصيل الطلب:', err);
          let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل تفاصيل الطلب.';
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
      }, [orderId]);

      useEffect(() => {
        fetchOrderDetails();
      }, [fetchOrderDetails]);

      if (loading) {
        return (
          <div className="container text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري تحميل تأكيد الطلب...</span>
            </div>
            <p className="mt-3 text-muted">جاري تحميل تأكيد الطلب...</p>
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

      if (!order) {
        return (
          <div className="container text-center my-5">
            <div className="alert alert-warning" role="alert">
              الطلب غير موجود أو لا يمكن الوصول إليه.
            </div>
          </div>
        );
      }

      return (
        <div className="container my-5">
          <div className="card shadow-lg border-0 rounded-lg p-5 text-center">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
            <h1 className="mb-3 fw-bold text-success mt-4">تم تأكيد طلبك بنجاح!</h1>
            <p className="lead text-muted mb-4">شكراً لك على تسوقك معنا. سيتم معالجة طلبك قريباً.</p>

            <div className="row justify-content-center mb-4">
              <div className="col-md-8">
                <ul className="list-group list-group-flush text-start mb-4">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>معرف الطلب:</strong>
                    <span>#{order.order_id}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>التاريخ:</strong>
                    <span>{new Date(order.order_date).toLocaleString()}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>المبلغ الإجمالي:</strong>
                    <span className="text-primary fw-bold">${order.total_amount.toFixed(2)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <strong>حالة الدفع:</strong>
                    <span className={`badge ${order.payment?.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {order.payment?.status || 'غير معروف'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
              <Link to="/" className="btn btn-primary btn-lg">
                العودة إلى الرئيسية <i className="bi bi-house-door-fill"></i>
              </Link>
              <Link to="/my-account" className="btn btn-outline-secondary btn-lg">
                عرض طلباتي <i className="bi bi-box-seam"></i>
              </Link>
            </div>
          </div>
        </div>
      );
    };

    export default OrderConfirmationPage;
    