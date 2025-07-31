// src/pages/MyAccount/UserOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrderById } from '../../api/orders'; // دوال API للطلبات
import { useAuth } from '../../contexts/AuthContext'; // لجلب user_id
import '../../styles/user/UserOrders.css';

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // لعرض تفاصيل طلب معين في Modal
  const [showDetailModal, setShowDetailModal] = useState(false); // للتحكم في ظهور Modal التفاصيل

  // جلب طلبات المستخدم
  const fetchUserOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // نرسل user_id لجلب طلبات المستخدم المصادق عليه فقط
      const params = { user_id: user.user_id };
      const data = await getOrders(params);
      const processedOrders = data.data.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount),
      }));
      setOrders(processedOrders);
    } catch (err) {
      console.error('فشل تحميل الطلبات:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل الطلبات.';
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
    if (user) { // جلب الطلبات فقط إذا كان المستخدم موجوداً
      fetchUserOrders();
    }
  }, [user, fetchUserOrders]);

  // دالة لفتح Modal تفاصيل الطلب
  const handleViewDetails = async (orderId) => {
    setLoading(true); // يمكن وضع تحميل خاص بالـ Modal
    try {
      const orderDetails = await getOrderById(orderId);
      const processedOrderDetails = {
        ...orderDetails,
        total_amount: parseFloat(orderDetails.total_amount),
        order_items: orderDetails.order_items.map(item => ({
          ...item,
          price_at_purchase: parseFloat(item.price_at_purchase),
        })),
      };
      setSelectedOrder(processedOrderDetails);
      setShowDetailModal(true);
    } catch (err) {
      console.error('فشل جلب تفاصيل الطلب:', err);
      alert('فشل جلب تفاصيل الطلب: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الطلبات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الطلبات...</p>
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
      <h1 className="mb-4 fw-bold text-primary">طلباتي السابقة</h1>

      {orders.length === 0 ? (
        <p className="text-center text-muted py-4 mb-0">لم تقم بتقديم أي طلبات حتى الآن.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>معرف الطلب</th>
                <th>التاريخ</th>
                <th>المبلغ الإجمالي</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'pending' ? 'bg-warning text-dark' :
                      order.status === 'processing' ? 'bg-info' :
                      order.status === 'shipped' ? 'bg-primary' :
                      order.status === 'delivered' ? 'bg-success' :
                      'bg-danger'
                    }`}>
                      {order.status === 'pending' ? 'معلق' :
                       order.status === 'processing' ? 'قيد المعالجة' :
                       order.status === 'shipped' ? 'تم الشحن' :
                       order.status === 'delivered' ? 'تم التسليم' :
                       order.status === 'cancelled' ? 'ملغي' : 'مسترد'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-info text-white" onClick={() => handleViewDetails(order.order_id)}>
                      <i className="bi bi-eye"></i> تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal لعرض تفاصيل الطلب (نفس Modal في OrderManagement) */}
      {selectedOrder && (
        <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDetailModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-info text-white py-3">
                <h5 className="modal-title fw-bold">تفاصيل الطلب #{selectedOrder.order_id}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>المستخدم:</strong> {selectedOrder.user ? selectedOrder.user.username : 'غير معروف'}
                  </div>
                  <div className="col-md-6">
                    <strong>البريد الإلكتروني:</strong> {selectedOrder.user ? selectedOrder.user.email : 'غير معروف'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>التاريخ:</strong> {new Date(selectedOrder.order_date).toLocaleString()}
                  </div>
                  <div className="col-md-6">
                    <strong>المبلغ الإجمالي:</strong> ${selectedOrder.total_amount.toFixed(2)}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>الحالة:</strong>{' '}
                  <span className={`badge ${
                    selectedOrder.status === 'pending' ? 'bg-warning text-dark' :
                    selectedOrder.status === 'processing' ? 'bg-info' :
                    selectedOrder.status === 'shipped' ? 'bg-primary' :
                    selectedOrder.status === 'delivered' ? 'bg-success' :
                    'bg-danger'
                  }`}>
                    {selectedOrder.status === 'pending' ? 'معلق' :
                     selectedOrder.status === 'processing' ? 'قيد المعالجة' :
                     selectedOrder.status === 'shipped' ? 'تم الشحن' :
                     selectedOrder.status === 'delivered' ? 'تم التسليم' :
                     selectedOrder.status === 'cancelled' ? 'ملغي' : 'مسترد'}
                  </span>
                </div>

                <hr />
                <h6 className="fw-bold mb-3">عناصر الطلب:</h6>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <ul className="list-group mb-3">
                    {selectedOrder.order_items.map((item) => (
                      <li key={item.order_item_id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          {item.product ? (
                            <>
                              <strong>{item.product.name}</strong>
                              <br />
                              <small className="text-muted">الكمية: {item.quantity} x ${item.price_at_purchase.toFixed(2)}</small>
                            </>
                          ) : (
                            <strong>منتج غير معروف (ID: {item.product_id})</strong>
                          )}
                        </div>
                        <span className="fw-bold">${(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">لا توجد عناصر في هذا الطلب.</p>
                )}

                <h6 className="fw-bold mb-3">عنوان الشحن:</h6>
                {selectedOrder.shipping_address ? (
                  <div>
                    <p className="mb-1">{selectedOrder.shipping_address.address_line1}, {selectedOrder.shipping_address.address_line2}</p>
                    <p className="mb-1">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}, {selectedOrder.shipping_address.postal_code}</p>
                    <p className="mb-1">{selectedOrder.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="text-muted">لا يوجد عنوان شحن.</p>
                )}

                <h6 className="fw-bold mb-3">تفاصيل الدفع:</h6>
                {selectedOrder.payment ? (
                  <div>
                    <p className="mb-1"><strong>طريقة الدفع:</strong> {selectedOrder.payment.method}</p>
                    <p className="mb-1"><strong>حالة الدفع:</strong> <span className={`badge ${selectedOrder.payment.status === 'completed' ? 'bg-success' : 'bg-danger'}`}>{selectedOrder.payment.status}</span></p>
                    <p className="mb-1"><strong>معرف المعاملة:</strong> {selectedOrder.payment.transaction_id || 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-muted">لا توجد تفاصيل دفع.</p>
                )}

                {selectedOrder.notes && (
                  <>
                    <h6 className="fw-bold mb-3">ملاحظات:</h6>
                    <p className="text-muted">{selectedOrder.notes}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
