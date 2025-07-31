// src/pages/MyAccount/UserAddresses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/addresses'; // دوال API للعناوين
import { useAuth } from '../../contexts/AuthContext'; // لجلب user_id
import '../../styles/user/UserAddresses.css';

const UserAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة النموذج
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressType, setAddressType] = useState('shipping');
  const [isDefault, setIsDefault] = useState(false);

  const [editingAddress, setEditingAddress] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // جلب العناوين
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // نرسل user_id لضمان جلب عناوين المستخدم المصادق عليه فقط
      const data = await getAddresses({ user_id: user.user_id });
      setAddresses(data);
    } catch (err) {
      console.error('فشل تحميل العناوين:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل العناوين.';
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
    if (user) { // جلب العناوين فقط إذا كان المستخدم موجوداً
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  // إعادة تعيين النموذج
  const resetForm = () => {
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('');
    setPhoneNumber('');
    setAddressType('shipping');
    setIsDefault(false);
    setEditingAddress(null);
    setFormError(null);
    setValidationErrors({});
  };

  // فتح Modal للإضافة
  const handleAddAddressClick = () => {
    resetForm();
    setShowModal(true);
  };

  // فتح Modal للتعديل
  const handleEditClick = (address) => {
    setEditingAddress(address);
    setAddressLine1(address.address_line1);
    setAddressLine2(address.address_line2 || '');
    setCity(address.city);
    setState(address.state || '');
    setPostalCode(address.postal_code);
    setCountry(address.country);
    setPhoneNumber(address.phone_number || '');
    setAddressType(address.address_type);
    setIsDefault(address.is_default);
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  // إغلاق Modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // إرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const addressData = {
      user_id: user.user_id, // ربط العنوان بالمستخدم الحالي
      address_type: addressType,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city: city,
      state: state,
      postal_code: postalCode,
      country: country,
      phone_number: phoneNumber,
      is_default: isDefault,
    };

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.address_id, addressData);
        alert('تم تحديث العنوان بنجاح!');
      } else {
        await createAddress(addressData);
        alert('تم إضافة العنوان بنجاح!');
      }
      handleCloseModal();
      fetchAddresses(); // إعادة جلب العناوين لتحديث القائمة
    } catch (err) {
      console.error('خطأ في العملية:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(Object.values(err.errors).flat().join(' ') || err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع.');
      }
    }
  };

  // حذف عنوان
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا العنوان؟')) {
      try {
        await deleteAddress(id);
        alert('تم حذف العنوان بنجاح!');
        fetchAddresses();
      } catch (err) {
        console.error('خطأ في حذف العنوان:', err);
        alert('فشل حذف العنوان: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل العناوين...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل العناوين...</p>
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
      <h1 className="mb-4 fw-bold text-primary">إدارة العناوين</h1>

      <button className="btn btn-primary mb-4" onClick={handleAddAddressClick}>
        <i className="bi bi-plus-circle me-2"></i> إضافة عنوان جديد
      </button>

      {addresses.length === 0 ? (
        <p className="text-center text-muted py-4 mb-0">لا توجد عناوين محفوظة حتى الآن.</p>
      ) : (
        <div className="row g-3">
          {addresses.map((address) => (
            <div className="col-md-6" key={address.address_id}>
              <div className="card h-100 shadow-sm border-0 rounded-lg p-3">
                <h5 className="fw-bold mb-2">{address.address_type === 'shipping' ? 'عنوان الشحن' : 'عنوان الفاتورة'}</h5>
                <p className="mb-1">{address.address_line1}</p>
                {address.address_line2 && <p className="mb-1">{address.address_line2}</p>}
                <p className="mb-1">{address.city}, {address.state && `${address.state}, `}{address.postal_code}</p>
                <p className="mb-1">{address.country}</p>
                {address.phone_number && <p className="mb-1">الهاتف: {address.phone_number}</p>}
                {address.is_default && <span className="badge bg-success mb-2">افتراضي</span>}
                <div className="mt-auto pt-3 border-top">
                  <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEditClick(address)}>
                    <i className="bi bi-pencil-square"></i> تعديل
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(address.address_id)}>
                    <i className="bi bi-trash"></i> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal لإضافة/تعديل العنوان */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingAddress ? 'تعديل عنوان موجود' : 'إضافة عنوان جديد'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="addressType" className="form-label">نوع العنوان:</label>
                  <select id="addressType" className={`form-select ${validationErrors.address_type ? 'is-invalid' : ''}`} value={addressType} onChange={(e) => setAddressType(e.target.value)} required>
                    <option value="shipping">شحن</option>
                    <option value="billing">فاتورة</option>
                  </select>
                  {validationErrors.address_type && <div className="invalid-feedback">{validationErrors.address_type[0]}</div>}
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="addressLine1" className="form-label">العنوان 1:</label>
                    <input type="text" id="addressLine1" className={`form-control ${validationErrors.address_line1 ? 'is-invalid' : ''}`} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
                    {validationErrors.address_line1 && <div className="invalid-feedback">{validationErrors.address_line1[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="addressLine2" className="form-label">العنوان 2 (اختياري):</label>
                    <input type="text" id="addressLine2" className={`form-control ${validationErrors.address_line2 ? 'is-invalid' : ''}`} value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                    {validationErrors.address_line2 && <div className="invalid-feedback">{validationErrors.address_line2[0]}</div>}
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">المدينة:</label>
                    <input type="text" id="city" className={`form-control ${validationErrors.city ? 'is-invalid' : ''}`} value={city} onChange={(e) => setCity(e.target.value)} required />
                    {validationErrors.city && <div className="invalid-feedback">{validationErrors.city[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">الولاية/المحافظة (اختياري):</label>
                    <input type="text" id="state" className={`form-control ${validationErrors.state ? 'is-invalid' : ''}`} value={state} onChange={(e) => setState(e.target.value)} />
                    {validationErrors.state && <div className="invalid-feedback">{validationErrors.state[0]}</div>}
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label htmlFor="postalCode" className="form-label">الرمز البريدي:</label>
                    <input type="text" id="postalCode" className={`form-control ${validationErrors.postal_code ? 'is-invalid' : ''}`} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                    {validationErrors.postal_code && <div className="invalid-feedback">{validationErrors.postal_code[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="country" className="form-label">البلد:</label>
                    <input type="text" id="country" className={`form-control ${validationErrors.country ? 'is-invalid' : ''}`} value={country} onChange={(e) => setCountry(e.target.value)} required />
                    {validationErrors.country && <div className="invalid-feedback">{validationErrors.country[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="phoneNumber" className="form-label">رقم الهاتف (اختياري):</label>
                    <input type="tel" id="phoneNumber" className={`form-control ${validationErrors.phone_number ? 'is-invalid' : ''}`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    {validationErrors.phone_number && <div className="invalid-feedback">{validationErrors.phone_number[0]}</div>}
                  </div>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="isDefault" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                  <label className="form-check-label" htmlFor="isDefault">
                    تعيين كعنوان افتراضي
                  </label>
                </div>

                {formError && <div className="alert alert-danger">{formError}</div>}
                <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                  {editingAddress ? 'تحديث العنوان' : 'إضافة العنوان'}
                </button>
                {editingAddress && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    إلغاء التعديل
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAddresses;
