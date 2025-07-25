// src/pages/Admin/BrandManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/brands';
import '../../styles/admin/BrandManagement.css';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // لرسائل الخطأ العامة من API (سلسلة نصية)

  // حالة النموذج (لإضافة وتعديل العلامات التجارية)
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [newBrandLogoFile, setNewBrandLogoFile] = useState(null);
  const [newBrandLogoPreview, setNewBrandLogoPreview] = useState(null); // لمعاينة الشعار
  const [newBrandStatus, setNewBrandStatus] = useState('active');
  const [logoRemoved, setLogoRemoved] = useState(false); // لتتبع إذا تم إزالة الشعار الحالي

  const [editingBrand, setEditingBrand] = useState(null); // لتخزين العلامة التجارية التي يتم تعديلها (null للإضافة)
  const [formError, setFormError] = useState(null); // لأخطاء النموذج العامة
  const [validationErrors, setValidationErrors] = useState({}); // لأخطاء التحقق من Laravel لكل حقل

  const fileInputRef = useRef(null); // مرجع لحقل رفع الملف

  const [showModal, setShowModal] = useState(false); // للتحكم في ظهور نافذة Modal

  // -------------------------------------------------------------------
  // الدوال المساعدة ومنطق جلب البيانات
  // -------------------------------------------------------------------

  // دالة لتوليد الـ Slug من الاسم
  const generateSlug = (name) => {
    return name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // ****** دالة handleNameChange (تم نقلها إلى هنا لتكون معرفة قبل استخدامها) ******
  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewBrandName(name);
    if (!editingBrand) { // فقط قم بتوليد الـ Slug تلقائيًا عند إضافة علامة تجارية جديدة
      setNewBrandSlug(generateSlug(name));
    }
  };
  // ****** نهاية دالة handleNameChange ******

  // جلب العلامات التجارية
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error('فشل تحميل العلامات التجارية. الرجاء المحاولة لاحقاً:', err);
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
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // -------------------------------------------------------------------
  // دوال معالجة النموذج (Add/Edit)
  // -------------------------------------------------------------------

  // دالة لإعادة تعيين النموذج بالكامل
  const resetForm = () => {
    setNewBrandName('');
    setNewBrandSlug('');
    setNewBrandDescription('');
    setNewBrandLogoFile(null);
    setNewBrandLogoPreview(null);
    setNewBrandStatus('active');
    setLogoRemoved(false);
    setEditingBrand(null);
    setFormError(null);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // دالة لفتح Modal للإضافة
  const handleAddBrandClick = () => {
    resetForm(); // إعادة تعيين النموذج قبل الفتح
    setShowModal(true);
  };

  // دالة لبدء تعديل علامة تجارية (تفتح Modal وتملأ البيانات)
  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setNewBrandSlug(brand.slug);
    setNewBrandDescription(brand.description);
    setNewBrandLogoFile(null); // مسح أي ملف تم اختياره مسبقاً
    setNewBrandLogoPreview(brand.logo_url || null); // عرض الشعار الحالي كمعاينة
    setNewBrandStatus(brand.status);
    setLogoRemoved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormError(null);
    setValidationErrors({});
    setShowModal(true); // فتح Modal
  };

  // دالة لإغلاق Modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm(); // إعادة تعيين النموذج عند إغلاق Modal
  };

  // دالة لإرسال النموذج (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const brandData = {
      name: newBrandName,
      slug: newBrandSlug,
      description: newBrandDescription,
      status: newBrandStatus,
    };

    try {
      if (editingBrand) {
        await updateBrand(editingBrand.brand_id, brandData, newBrandLogoFile, logoRemoved);
        alert('تم تحديث العلامة التجارية بنجاح!');
      } else {
        await createBrand(brandData, newBrandLogoFile);
        alert('تم إضافة العلامة التجارية بنجاح!');
      }
      handleCloseModal(); // إغلاق Modal بعد النجاح
      fetchBrands(); // إعادة جلب العلامات التجارية لتحديث القائمة
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

  // دالة لحذف علامة تجارية
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه العلامة التجارية؟')) {
      try {
        await deleteBrand(id);
        alert('تم حذف العلامة التجارية بنجاح!');
        fetchBrands(); // إعادة جلب العلامات التجارية لتحديث القائمة
      } catch (err) {
        console.error('خطأ في حذف العلامة التجارية:', err);
        alert('فشل حذف العلامة التجارية: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  // -------------------------------------------------------------------
  // دوال معالجة الشعار
  // -------------------------------------------------------------------

  // معالجة تغيير ملف الشعار
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBrandLogoFile(file);
      setNewBrandLogoPreview(URL.createObjectURL(file));
      setLogoRemoved(false);
    } else {
      setNewBrandLogoFile(null);
      setNewBrandLogoPreview(null);
    }
  };

  // معالجة إزالة الشعار الحالي
  const handleRemoveLogo = () => {
    setNewBrandLogoFile(null);
    setNewBrandLogoPreview(null);
    setLogoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // -------------------------------------------------------------------
  // عرض حالة التحميل والخطأ
  // -------------------------------------------------------------------

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل العلامات التجارية...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل العلامات التجارية...</p>
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
      <h1 className="mb-4 fw-bold text-primary">إدارة العلامات التجارية</h1>

      {/* زر إضافة علامة تجارية جديدة (يفتح Modal) */}
      <button className="btn btn-primary mb-4" onClick={handleAddBrandClick}>
        <i className="bi bi-plus-circle me-2"></i> إضافة علامة تجارية جديدة
      </button>

      {/* قائمة العلامات التجارية الحالية - تصميم جذاب */}
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-info text-white fw-bold py-3">
          العلامات التجارية الحالية
        </div>
        <div className="card-body p-0">
          {brands.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد علامات تجارية حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>الشعار</th>
                    <th>الاسم</th>
                    <th>الوصف</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.brand_id}>
                      <td>
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="img-thumbnail"
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; }}
                          />
                        ) : (
                          <span className="text-muted small">لا يوجد شعار</span>
                        )}
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold">{brand.name}</h6>
                        <span className="badge bg-light text-dark">{brand.slug}</span>
                      </td>
                      <td>{brand.description || 'لا يوجد وصف'}</td>
                      <td>
                        <span className={`badge ${brand.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {brand.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEditClick(brand)}>
                          <i className="bi bi-pencil-square"></i> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(brand.brand_id)}>
                          <i className="bi bi-trash"></i> حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal لإضافة/تعديل العلامات التجارية */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingBrand ? 'تعديل علامة تجارية موجودة' : 'إضافة علامة تجارية جديدة'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="brandName" className="form-label">اسم العلامة التجارية:</label>
                    <input
                      type="text"
                      id="brandName"
                      className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                      value={newBrandName}
                      onChange={handleNameChange}
                      required
                    />
                    {validationErrors.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="brandSlug" className="form-label">الرابط النظيف (Slug):</label>
                    <input
                      type="text"
                      id="brandSlug"
                      className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                      value={newBrandSlug}
                      onChange={(e) => setNewBrandSlug(e.target.value)}
                      required
                    />
                    {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="brandDescription" className="form-label">الوصف:</label>
                  <textarea
                    id="brandDescription"
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newBrandDescription}
                    onChange={(e) => setNewBrandDescription(e.target.value)}
                    rows="3"
                  ></textarea>
                  {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                </div>

                {/* حقل رفع الشعار ومعاينة */}
                <div className="mb-3">
                  <label htmlFor="brandLogoFile" className="form-label">شعار العلامة التجارية (ملف):</label>
                  <input
                    type="file"
                    id="brandLogoFile"
                    className={`form-control ${validationErrors.logo ? 'is-invalid' : ''}`}
                    onChange={handleLogoChange}
                    ref={fileInputRef}
                    accept="image/*"
                  />
                  {validationErrors.logo && <div className="invalid-feedback">{validationErrors.logo[0]}</div>}
                  {(newBrandLogoPreview || (editingBrand && editingBrand.logo_url && !logoRemoved)) && (
                    <div className="mt-2 text-center border p-2 rounded bg-light">
                      <img
                        src={newBrandLogoPreview || (editingBrand && editingBrand.logo_url)}
                        alt="معاينة الشعار"
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; }}
                      />
                      <p className="small text-muted mt-1">معاينة الشعار</p>
                      {(newBrandLogoPreview || (editingBrand && editingBrand.logo_url)) && (
                          <button type="button" className="btn btn-sm btn-outline-danger mt-1" onClick={handleRemoveLogo}>
                              إزالة الشعار
                          </button>
                      )}
                    </div>
                  )}
                </div>

                {/* حقل الحالة (Status) */}
                <div className="mb-3">
                  <label htmlFor="brandStatus" className="form-label">الحالة:</label>
                  <select
                    id="brandStatus"
                    className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newBrandStatus}
                    onChange={(e) => setNewBrandStatus(e.target.value)}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger">{formError}</div>}
                <button type="submit" className="btn btn-primary me-2">
                  {editingBrand ? 'تحديث العلامة التجارية' : 'إضافة العلامة التجارية'}
                </button>
                {editingBrand && (
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

export default BrandManagement;
