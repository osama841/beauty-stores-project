// src/pages/Admin/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrderById, updateOrderStatus } from '../../api/orders'; // استيراد دوال API الطلبات
import '../../styles/admin/OrderManagement.css'; // استيراد ملف CSS الخاص بإدارة الطلبات

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // لرسائل الخطأ العامة من API (سلسلة نصية)
  const [selectedOrder, setSelectedOrder] = useState(null); // لعرض تفاصيل طلب معين في Modal
  const [showDetailModal, setShowDetailModal] = useState(false); // للتحكم في ظهور Modal التفاصيل
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState(''); // لتصفية الطلبات حسب الحالة

  // -------------------------------------------------------------------
  // دوال جلب البيانات
  // -------------------------------------------------------------------

  // دالة لجلب الطلبات
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, status: filterStatus };
      const data = await getOrders(params);
      // Laravel paginate object يُرجع المنتجات في `data` property
      // ونحتاج لتحويل القيم الرقمية إذا لم يتم تحويلها في Laravel
      const processedOrders = data.data.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount),
        // يمكن إضافة تحويلات أخرى هنا إذا كانت هناك حقول رقمية أخرى
      }));
      setOrders(processedOrders);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
    } catch (err) {
      console.error('فشل تحميل الطلبات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل البيانات.';
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
  }, [currentPage, filterStatus]); // أعد جلب الطلبات عند تغيير الصفحة أو حالة التصفية

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // -------------------------------------------------------------------
  // دوال معالجة الطلبات
  // -------------------------------------------------------------------

  // دالة لفتح Modal تفاصيل الطلب
  const handleViewDetails = async (orderId) => {
    setLoading(true); // يمكن وضع تحميل خاص بالـ Modal
    try {
      const orderDetails = await getOrderById(orderId);
      // تحويل القيم الرقمية في تفاصيل الطلب
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

  // دالة لتحديث حالة الطلب
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (window.confirm(`هل أنت متأكد أنك تريد تغيير حالة الطلب إلى "${newStatus}"؟`)) {
      try {
        await updateOrderStatus(orderId, newStatus);
        alert('تم تحديث حالة الطلب بنجاح!');
        fetchOrders(); // إعادة جلب الطلبات لتحديث القائمة
      } catch (err) {
        console.error('فشل تحديث حالة الطلب:', err);
        alert('فشل تحديث حالة الطلب: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  // دالة للتنقل بين الصفحات
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // -------------------------------------------------------------------
  // عرض حالة التحميل والخطأ
  // -------------------------------------------------------------------

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

  // -------------------------------------------------------------------
  // عرض المكون الرئيسي
  // -------------------------------------------------------------------

  return (
    <div className="container-fluid">
      <h1 className="mb-4 fw-bold text-success">إدارة الطلبات</h1>

      {/* شريط التصفية */}
      <div className="mb-4">
        <label htmlFor="filterStatus" className="form-label">تصفية حسب الحالة:</label>
        <select
          id="filterStatus"
          className="form-select w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">جميع الحالات</option>
          <option value="pending">معلق</option>
          <option value="processing">قيد المعالجة</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغي</option>
          <option value="refunded">مسترد</option>
        </select>
      </div>

      {/* قائمة الطلبات الحالية */}
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          الطلبات الحالية
        </div>
        <div className="card-body p-0">
          {orders.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد طلبات حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>معرف الطلب</th>
                    <th>المستخدم</th>
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
                      <td>{order.user ? order.user.username : 'غير معروف'}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>${parseFloat(order.total_amount).toFixed(2)}</td>
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
                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleViewDetails(order.order_id)}>
                          <i className="bi bi-eye"></i> تفاصيل
                        </button>
                        <div className="dropdown d-inline-block">
                          <button className="btn btn-sm btn-secondary dropdown-toggle" type="button" id={`dropdownStatus${order.order_id}`} data-bs-toggle="dropdown" aria-expanded="false">
                            تغيير الحالة
                          </button>
                          <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${order.order_id}`}>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'pending')}>معلق</a></li>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'processing')}>قيد المعالجة</a></li>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'shipped')}>تم الشحن</a></li>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'delivered')}>تم التسليم</a></li>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'cancelled')}>ملغي</a></li>
                            <li><a className="dropdown-item" href="#" onClick={() => handleUpdateStatus(order.order_id, 'refunded')}>مسترد</a></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Order pagination" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                السابق
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                التالي
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal لعرض تفاصيل الطلب */}
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
                    <strong>المبلغ الإجمالي:</strong> ${parseFloat(selectedOrder.total_amount).toFixed(2)}
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
                              <small className="text-muted">الكمية: {item.quantity} x ${parseFloat(item.price_at_purchase).toFixed(2)}</small>
                            </>
                          ) : (
                            <strong>منتج غير معروف (ID: {item.product_id})</strong>
                          )}
                        </div>
                        <span className="fw-bold">${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</span>
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

export default OrderManagement;
