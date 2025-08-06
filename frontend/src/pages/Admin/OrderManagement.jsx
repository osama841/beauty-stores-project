// src/pages/Admin/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrderById, updateOrderStatus } from '../../api/orders';
import '../../styles/admin/OrderManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaEye, FaSyncAlt } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, status: filterStatus };
      const data = await getOrders(params);
      const processedOrders = data.data.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount),
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
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = async (orderId) => {
    setLoading(true);
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (window.confirm(`هل أنت متأكد أنك تريد تغيير حالة الطلب إلى "${newStatus}"؟`)) {
      try {
        await updateOrderStatus(orderId, newStatus);
        alert('تم تحديث حالة الطلب بنجاح!');
        fetchOrders();
      } catch (err) {
        console.error('فشل تحديث حالة الطلب:', err);
        alert('فشل تحديث حالة الطلب: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      default:
        return 'bg-danger';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      case 'refunded':
        return 'مسترد';
      default:
        return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الطلبات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ fontFamily: 'Tajawal, Cairo, sans-serif', backgroundColor: '#f8f9fa' }}>
      <h1 className="mb-4 fw-bold text-primary text-center text-md-start" style={{ color: '#6a8eec' }}>إدارة الطلبات</h1>

      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="w-100 mb-3 mb-md-0">
          <label htmlFor="filterStatus" className="form-label small text-muted">تصفية حسب الحالة:</label>
          <select
            id="filterStatus"
            className="form-select form-select-sm w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
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
        <button className="btn btn-sm btn-outline-primary d-flex align-items-center shadow-sm" onClick={fetchOrders} style={{ color: '#6a8eec', borderColor: '#6a8eec' }}>
          <FaSyncAlt className="me-2" />
          تحديث القائمة
        </button>
      </div>

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3 text-center" style={{ backgroundColor: '#6a8eec' }}>
          الطلبات الحالية
        </div>
        <div className="card-body p-0">
          {orders.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد طلبات حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
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
                          <td><span className="text-muted small">{order.order_id}</span></td>
                          <td><span className="text-muted small">{order.user ? order.user.username : 'غير معروف'}</span></td>
                          <td><span className="text-muted small">{new Date(order.order_date).toLocaleDateString('ar-SA')}</span></td>
                          <td><span className="fw-bold" style={{ color: '#343a40' }}>${parseFloat(order.total_amount).toFixed(2)}</span></td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ backgroundColor: getStatusBadgeClass(order.status) === 'bg-warning text-dark' ? '#ffc107' : getStatusBadgeClass(order.status) === 'bg-info' ? '#81c784' : getStatusBadgeClass(order.status) === 'bg-primary' ? '#6a8eec' : getStatusBadgeClass(order.status) === 'bg-success' ? '#60c78c' : '#e74c3c' }}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => handleViewDetails(order.order_id)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaEye /> تفاصيل
                            </button>
                            <div className="dropdown d-inline-block">
                              <button className="btn btn-sm btn-secondary dropdown-toggle shadow-sm" type="button" id={`dropdownStatus${order.order_id}`} data-bs-toggle="dropdown" aria-expanded="false" style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
                                تغيير الحالة
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${order.order_id}`} style={{ backgroundColor: '#ffffff' }}>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'pending')} style={{ color: '#343a40' }}>معلق</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'processing')} style={{ color: '#343a40' }}>قيد المعالجة</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'shipped')} style={{ color: '#343a40' }}>تم الشحن</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'delivered')} style={{ color: '#343a40' }}>تم التسليم</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'cancelled')} style={{ color: '#343a40' }}>ملغي</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'refunded')} style={{ color: '#343a40' }}>مسترد</a></li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* عرض Accordion للشاشات الصغيرة */}
              <div className="d-lg-none p-3">
                <div className="accordion" id="orderAccordion">
                  {orders.map((order) => (
                    <div key={order.order_id} className="accordion-item mb-2 rounded-lg shadow-sm border" style={{ borderColor: '#dee2e6' }}>
                      <h2 className="accordion-header" id={`heading${order.order_id}`}>
                        <button 
                          className="accordion-button collapsed py-3" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${order.order_id}`} 
                          aria-expanded="false" 
                          aria-controls={`collapse${order.order_id}`}
                          style={{ backgroundColor: '#ffffff', color: '#343a40' }}
                        >
                          <div className="d-flex align-items-center w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>طلب #{order.order_id}</h6>
                              <p className="text-muted small mb-0">{order.user ? order.user.username : 'غير معروف'}</p>
                            </div>
                            <span className={`badge ms-2 ${getStatusBadgeClass(order.status)}`} style={{ backgroundColor: getStatusBadgeClass(order.status) === 'bg-warning text-dark' ? '#ffc107' : getStatusBadgeClass(order.status) === 'bg-info' ? '#81c784' : getStatusBadgeClass(order.status) === 'bg-primary' ? '#6a8eec' : getStatusBadgeClass(order.status) === 'bg-success' ? '#60c78c' : '#e74c3c' }}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse${order.order_id}`} className="accordion-collapse collapse" aria-labelledby={`heading${order.order_id}`} data-bs-parent="#orderAccordion">
                        <div className="accordion-body" style={{ backgroundColor: '#f8f9fa', color: '#343a40' }}>
                          <p className="text-muted small mb-1"><strong>التاريخ:</strong> {new Date(order.order_date).toLocaleDateString('ar-SA')}</p>
                          <p className="text-muted small mb-1"><strong>المبلغ الإجمالي:</strong> <span className="fw-bold">${parseFloat(order.total_amount).toFixed(2)}</span></p>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-sm btn-info text-white shadow-sm" onClick={() => handleViewDetails(order.order_id)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaEye /> تفاصيل
                            </button>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-secondary dropdown-toggle shadow-sm" type="button" id={`dropdownStatus${order.order_id}-mobile`} data-bs-toggle="dropdown" aria-expanded="false" style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
                                تغيير الحالة
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownStatus${order.order_id}-mobile`} style={{ backgroundColor: '#ffffff' }}>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'pending')} style={{ color: '#343a40' }}>معلق</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'processing')} style={{ color: '#343a40' }}>قيد المعالجة</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'shipped')} style={{ color: '#343a40' }}>تم الشحن</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'delivered')} style={{ color: '#343a40' }}>تم التسليم</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'cancelled')} style={{ color: '#343a40' }}>ملغي</a></li>
                                <li><a className="dropdown-item small" href="#" onClick={() => handleUpdateStatus(order.order_id, 'refunded')} style={{ color: '#343a40' }}>مسترد</a></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Order pagination" className="mt-4">
          <ul className="pagination justify-content-center pagination-sm">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} style={{ color: '#6a8eec', borderColor: '#6a8eec' }}>
                السابق
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page)} style={{ backgroundColor: currentPage === page ? '#6a8eec' : '#ffffff', color: currentPage === page ? '#ffffff' : '#6a8eec', borderColor: '#6a8eec' }}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} style={{ color: '#6a8eec', borderColor: '#6a8eec' }}>
                التالي
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal لعرض تفاصيل الطلب */}
      {selectedOrder && (
        <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDetailModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-lg shadow-lg" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
              <div className="modal-header bg-primary text-white py-3" style={{ backgroundColor: '#6a8eec' }}>
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem' }}>تفاصيل الطلب #{selectedOrder.order_id}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="card shadow-sm mb-3 border-0 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-body p-3">
                    <p className="mb-1 small text-muted"><strong>المستخدم:</strong> <span style={{ color: '#343a40' }}>{selectedOrder.user ? selectedOrder.user.username : 'غير معروف'}</span></p>
                    <p className="mb-1 small text-muted"><strong>البريد:</strong> <span style={{ color: '#343a40' }}>{selectedOrder.user ? selectedOrder.user.email : 'غير معروف'}</span></p>
                    <p className="mb-1 small text-muted"><strong>التاريخ:</strong> <span style={{ color: '#343a40' }}>{new Date(selectedOrder.order_date).toLocaleString('ar-SA')}</span></p>
                    <p className="mb-1 small text-muted"><strong>المبلغ الإجمالي:</strong> <span className="fw-bold" style={{ color: '#60c78c' }}>${parseFloat(selectedOrder.total_amount).toFixed(2)}</span></p>
                    <p className="mb-0 small text-muted"><strong>الحالة:</strong> <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`} style={{ backgroundColor: getStatusBadgeClass(selectedOrder.status) === 'bg-warning text-dark' ? '#ffc107' : getStatusBadgeClass(selectedOrder.status) === 'bg-info' ? '#81c784' : getStatusBadgeClass(selectedOrder.status) === 'bg-primary' ? '#6a8eec' : getStatusBadgeClass(selectedOrder.status) === 'bg-success' ? '#60c78c' : '#e74c3c' }}>{getStatusText(selectedOrder.status)}</span></p>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 mt-4" style={{ color: '#6a8eec' }}>عناصر الطلب:</h6>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <ul className="list-group mb-3 rounded-lg overflow-hidden">
                    {selectedOrder.order_items.map((item) => (
                      <li key={item.order_item_id} className="list-group-item d-flex justify-content-between align-items-center py-2" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
                        <div>
                          {item.product ? (
                            <>
                              <strong className="d-block" style={{ color: '#343a40' }}>{item.product.name}</strong>
                              <small className="text-muted">الكمية: {item.quantity} x ${parseFloat(item.price_at_purchase).toFixed(2)}</small>
                            </>
                          ) : (
                            <strong className="d-block" style={{ color: '#343a40' }}>منتج غير معروف (ID: {item.product_id})</strong>
                          )}
                        </div>
                        <span className="fw-bold" style={{ color: '#343a40' }}>${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small">لا توجد عناصر في هذا الطلب.</p>
                )}

                <h6 className="fw-bold mb-3 mt-4" style={{ color: '#6a8eec' }}>عنوان الشحن:</h6>
                <div className="card shadow-sm mb-3 border-0 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-body p-3">
                    {selectedOrder.shipping_address ? (
                      <>
                        <p className="mb-1 small text-muted">{selectedOrder.shipping_address.address_line1}, {selectedOrder.shipping_address.address_line2}</p>
                        <p className="mb-1 small text-muted">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}, {selectedOrder.shipping_address.postal_code}</p>
                        <p className="mb-0 small text-muted">{selectedOrder.shipping_address.country}</p>
                      </>
                    ) : (
                      <p className="text-muted small mb-0">لا يوجد عنوان شحن.</p>
                    )}
                  </div>
                </div>

                <h6 className="fw-bold mb-3 mt-4" style={{ color: '#6a8eec' }}>تفاصيل الدفع:</h6>
                <div className="card shadow-sm mb-3 border-0 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="card-body p-3">
                    {selectedOrder.payment ? (
                      <>
                        <p className="mb-1 small text-muted"><strong>طريقة الدفع:</strong> <span style={{ color: '#343a40' }}>{selectedOrder.payment.method}</span></p>
                        <p className="mb-1 small text-muted"><strong>حالة الدفع:</strong> <span className={`badge ${selectedOrder.payment.status === 'completed' ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: selectedOrder.payment.status === 'completed' ? '#60c78c' : '#e74c3c' }}>{selectedOrder.payment.status}</span></p>
                        <p className="mb-0 small text-muted"><strong>معرف المعاملة:</strong> <span style={{ color: '#343a40' }}>{selectedOrder.payment.transaction_id || 'N/A'}</span></p>
                      </>
                    ) : (
                      <p className="text-muted small mb-0">لا توجد تفاصيل دفع.</p>
                    )}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <>
                    <h6 className="fw-bold mb-3 mt-4" style={{ color: '#6a8eec' }}>ملاحظات:</h6>
                    <p className="text-muted small">{selectedOrder.notes}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm shadow-sm" onClick={() => setShowDetailModal(false)} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 