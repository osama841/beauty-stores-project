// src/pages/Admin/DiscountManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../api/discounts';
import '../../styles/admin/DiscountManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('percentage');
  const [newValue, setNewValue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newMinPurchaseAmount, setNewMinPurchaseAmount] = useState('');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [newStatus, setNewStatus] = useState('active');

  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiscounts();
      setDiscounts(data);
    } catch (err) {
      console.error('فشل تحميل الخصومات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل الخصومات.';
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
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const resetForm = () => {
    setNewCode('');
    setNewType('percentage');
    setNewValue('');
    setNewStartDate('');
    setNewEndDate('');
    setNewMinPurchaseAmount('');
    setNewMaxUses('');
    setNewStatus('active');
    setEditingDiscount(null);
    setFormError(null);
    setValidationErrors({});
  };

  const handleAddDiscountClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (discount) => {
    setEditingDiscount(discount);
    setNewCode(discount.code);
    setNewType(discount.type);
    setNewValue(discount.value);
    setNewStartDate(discount.start_date ? new Date(discount.start_date).toISOString().slice(0, 16) : '');
    setNewEndDate(discount.end_date ? new Date(discount.end_date).toISOString().slice(0, 16) : '');
    setNewMinPurchaseAmount(discount.min_purchase_amount);
    setNewMaxUses(discount.max_uses);
    setNewStatus(discount.status);
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const discountData = {
      code: newCode,
      type: newType,
      value: parseFloat(newValue),
      start_date: newStartDate || null,
      end_date: newEndDate || null,
      min_purchase_amount: newMinPurchaseAmount ? parseFloat(newMinPurchaseAmount) : 0,
      max_uses: newMaxUses || null,
      status: newStatus,
    };

    try {
      if (editingDiscount) {
        await updateDiscount(editingDiscount.discount_id, discountData);
        alert('تم تحديث الخصم بنجاح!');
      } else {
        await createDiscount(discountData);
        alert('تم إضافة الخصم بنجاح!');
      }
      handleCloseModal();
      fetchDiscounts();
    } catch (err) {
      console.error('خطأ في العملية:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الخصم؟')) {
      try {
        await deleteDiscount(id);
        alert('تم حذف الخصم بنجاح!');
        fetchDiscounts();
      } catch (err) {
        console.error('خطأ في حذف الخصم:', err);
        alert('فشل حذف الخصم: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الخصومات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الخصومات...</p>
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
      <h1 className="mb-4 fw-bold text-success text-center text-md-start" style={{ color: '#60c78c' }}>إدارة الخصومات</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddDiscountClick} style={{ backgroundColor: '#6a8eec', borderColor: '#6a8eec' }}>
          <FaPlusCircle className="me-2" /> إضافة خصم جديد
        </button>
      </div>

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3 text-center" style={{ backgroundColor: '#60c78c' }}>
          أكواد الخصومات الحالية
        </div>
        <div className="card-body p-0">
          {discounts.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد أكواد خصم حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>كود الخصم</th>
                        <th>النوع</th>
                        <th>القيمة</th>
                        <th>مرات الاستخدام</th>
                        <th>تاريخ الانتهاء</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discounts.map((discount) => (
                        <tr key={discount.discount_id}>
                          <td><h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{discount.code}</h6></td>
                          <td>
                            <span className="badge bg-info text-dark" style={{ backgroundColor: '#81c784', color: '#ffffff' }}>
                              {discount.type === 'percentage' ? 'نسبة مئوية' :
                               discount.type === 'fixed_amount' ? 'مبلغ ثابت' : 'شحن مجاني'}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {discount.type === 'percentage' ? `${discount.value}%` :
                               discount.type === 'fixed_amount' ? `$${parseFloat(discount.value).toFixed(2)}` : 'N/A'}
                            </span>
                          </td>
                          <td><span className="text-muted small">{discount.uses_count}/{discount.max_uses || 'بلا حد'}</span></td>
                          <td><span className="text-muted small">{discount.end_date ? new Date(discount.end_date).toLocaleDateString('ar-SA') : 'بلا تاريخ'}</span></td>
                          <td>
                            <span className={`badge ${discount.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: discount.status === 'active' ? '#60c78c' : '#e74c3c' }}>
                              {discount.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => handleEditClick(discount)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(discount.discount_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
                              <FaTrashAlt /> حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* عرض القائمة للشاشات الصغيرة */}
              <div className="d-lg-none p-3">
                {discounts.map((discount) => (
                  <div key={discount.discount_id} className="card mb-3 shadow-sm border-0 rounded-lg">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-1" style={{ color: '#343a40' }}>{discount.code}</h5>
                      <p className="card-text small text-muted mb-1">
                        <span className="badge bg-info text-dark" style={{ backgroundColor: '#81c784', color: '#ffffff' }}>
                          {discount.type === 'percentage' ? 'نسبة مئوية' :
                           discount.type === 'fixed_amount' ? 'مبلغ ثابت' : 'شحن مجاني'}
                        </span>
                        <span className="ms-2">القيمة: {discount.type === 'percentage' ? `${discount.value}%` : `$${parseFloat(discount.value).toFixed(2)}`}</span>
                      </p>
                      <p className="card-text small text-muted mb-1">
                        مرات الاستخدام: {discount.uses_count}/{discount.max_uses || 'بلا حد'}
                      </p>
                      <p className="card-text small text-muted mb-3">
                        تاريخ الانتهاء: {discount.end_date ? new Date(discount.end_date).toLocaleDateString('ar-SA') : 'بلا تاريخ'}
                      </p>
                      <span className={`badge ${discount.status === 'active' ? 'bg-success' : 'bg-danger'} mb-3`} style={{ backgroundColor: discount.status === 'active' ? '#60c78c' : '#e74c3c' }}>
                        {discount.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <button className="btn btn-sm btn-info text-white shadow-sm" onClick={() => handleEditClick(discount)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                          <FaPencilAlt /> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(discount.discount_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
                          <FaTrashAlt /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal لإضافة/تعديل الخصومات */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-lg shadow-lg" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
            <div className="modal-header bg-success text-white py-3" style={{ backgroundColor: '#60c78c' }}>
              <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem' }}>{editingDiscount ? 'تعديل خصم' : 'إضافة خصم'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="discountCode" className="form-label small text-muted">كود الخصم:</label>
                  <input
                    type="text"
                    id="discountCode"
                    className={`form-control form-control-sm ${validationErrors.code ? 'is-invalid' : ''}`}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.code && <div className="invalid-feedback">{validationErrors.code[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountType" className="form-label small text-muted">النوع:</label>
                  <select
                    id="discountType"
                    className={`form-select form-select-sm ${validationErrors.type ? 'is-invalid' : ''}`}
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed_amount">مبلغ ثابت</option>
                    <option value="free_shipping">شحن مجاني</option>
                  </select>
                  {validationErrors.type && <div className="invalid-feedback">{validationErrors.type[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountValue" className="form-label small text-muted">القيمة:</label>
                  <input
                    type="number"
                    id="discountValue"
                    className={`form-control form-control-sm ${validationErrors.value ? 'is-invalid' : ''}`}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    step="0.01"
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.value && <div className="invalid-feedback">{validationErrors.value[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountStartDate" className="form-label small text-muted">تاريخ البداية (اختياري):</label>
                  <input
                    type="datetime-local"
                    id="discountStartDate"
                    className={`form-control form-control-sm ${validationErrors.start_date ? 'is-invalid' : ''}`}
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.start_date && <div className="invalid-feedback">{validationErrors.start_date[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountEndDate" className="form-label small text-muted">تاريخ الانتهاء (اختياري):</label>
                  <input
                    type="datetime-local"
                    id="discountEndDate"
                    className={`form-control form-control-sm ${validationErrors.end_date ? 'is-invalid' : ''}`}
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.end_date && <div className="invalid-feedback">{validationErrors.end_date[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountMinPurchaseAmount" className="form-label small text-muted">الحد الأدنى للشراء:</label>
                  <input
                    type="number"
                    id="discountMinPurchaseAmount"
                    className={`form-control form-control-sm ${validationErrors.min_purchase_amount ? 'is-invalid' : ''}`}
                    value={newMinPurchaseAmount}
                    onChange={(e) => setNewMinPurchaseAmount(e.target.value)}
                    step="0.01"
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.min_purchase_amount && <div className="invalid-feedback">{validationErrors.min_purchase_amount[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountMaxUses" className="form-label small text-muted">أقصى عدد مرات للاستخدام (اختياري):</label>
                  <input
                    type="number"
                    id="discountMaxUses"
                    className={`form-control form-control-sm ${validationErrors.max_uses ? 'is-invalid' : ''}`}
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.max_uses && <div className="invalid-feedback">{validationErrors.max_uses[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="discountStatus" className="form-label small text-muted">الحالة:</label>
                  <select
                    id="discountStatus"
                    className={`form-select form-select-sm ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger small">{formError}</div>}
                
                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-success btn-sm shadow-sm" disabled={loading} style={{ backgroundColor: '#60c78c', borderColor: '#60c78c' }}>
                    {editingDiscount ? 'تحديث' : 'إضافة'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm shadow-sm" onClick={handleCloseModal} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
                    إغلاق
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagement;