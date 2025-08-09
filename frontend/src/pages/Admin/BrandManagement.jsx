// src/pages/Admin/BrandManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/brands';
import '../../styles/admin/BrandManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandDescription, setNewBrandDescription] = useState('');
  const [newBrandLogoFile, setNewBrandLogoFile] = useState(null);
  const [newBrandLogoPreview, setNewBrandLogoPreview] = useState(null);
  const [newBrandStatus, setNewBrandStatus] = useState('active');
  const [logoRemoved, setLogoRemoved] = useState(false);

  const [editingBrand, setEditingBrand] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const fileInputRef = useRef(null);

  const [showModal, setShowModal] = useState(false);

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

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewBrandName(name);
    if (!editingBrand) {
      setNewBrandSlug(generateSlug(name));
    }
  };

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

  const handleAddBrandClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setNewBrandSlug(brand.slug);
    setNewBrandDescription(brand.description);
    setNewBrandLogoFile(null);
    setNewBrandLogoPreview(brand.logo_url || null);
    setNewBrandStatus(brand.status);
    setLogoRemoved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      handleCloseModal();
      fetchBrands();
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
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه العلامة التجارية؟')) {
      try {
        await deleteBrand(id);
        alert('تم حذف العلامة التجارية بنجاح!');
        fetchBrands();
      } catch (err) {
        console.error('خطأ في حذف العلامة التجارية:', err);
        alert('فشل حذف العلامة التجارية: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

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

  const handleRemoveLogo = () => {
    setNewBrandLogoFile(null);
    setNewBrandLogoPreview(null);
    setLogoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4 fw-bold text-primary text-center text-md-start">إدارة العلامات التجارية</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddBrandClick}>
          <FaPlusCircle className="me-2" /> إضافة علامة تجارية جديدة
        </button>
      </div>

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white fw-bold py-3 text-center">
          العلامات التجارية الحالية
        </div>
        <div className="card-body p-0">
          {brands.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد علامات تجارية حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
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
                                className="img-thumbnail rounded"
                                width={50}
                                height={50}
                                style={{ objectFit: 'contain' }}
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
                          <td><span className="text-muted small">{brand.description || 'لا يوجد وصف'}</span></td>
                          <td>
                            <span className={`badge ${brand.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {brand.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-success text-white me-2 shadow-sm" onClick={() => handleEditClick(brand)}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(brand.brand_id)}>
                              <FaTrashAlt /> حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* عرض البطاقات للشاشات الصغيرة */}
              <div className="d-lg-none p-3">
                {brands.map((brand) => (
                  <div key={brand.brand_id} className="card mb-3 shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="img-thumbnail me-3 rounded"
                            width={60}
                            height={60}
                            style={{ objectFit: 'contain' }}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/60x60/cccccc/333333?text=خطأ"; }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <h5 className="card-title fw-bold mb-1">{brand.name}</h5>
                          <span className="badge bg-light text-dark">{brand.slug}</span>
                        </div>
                        <span className={`badge ms-auto ${brand.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: brand.status === 'active' ? '#60c78c' : '#e74c3c' }}>
                          {brand.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                      <p className="card-text text-muted small">
                        {brand.description || 'لا يوجد وصف'}
                      </p>
                      <div className="d-flex justify-content-end mt-3 gap-2">
                        <button className="btn btn-sm btn-success text-white shadow-sm" onClick={() => handleEditClick(brand)}>
                          <FaPencilAlt /> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(brand.brand_id)}>
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

      {/* Modal لإضافة/تعديل العلامات التجارية */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        {showModal && <div className="modal-backdrop-custom" />}
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingBrand ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="brandName" className="form-label small text-muted">اسم العلامة التجارية:</label>
                  <input
                    type="text"
                    id="brandName"
                    className={`form-control form-control-sm ${validationErrors.name ? 'is-invalid' : ''}`}
                    value={newBrandName}
                    onChange={handleNameChange}
                    required
                  />
                  {validationErrors.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="brandSlug" className="form-label small text-muted">الرابط النظيف (Slug):</label>
                  <input
                    type="text"
                    id="brandSlug"
                    className={`form-control form-control-sm ${validationErrors.slug ? 'is-invalid' : ''}`}
                    value={newBrandSlug}
                    onChange={(e) => setNewBrandSlug(e.target.value)}
                    required
                  />
                  {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="brandDescription" className="form-label small text-muted">الوصف:</label>
                  <textarea
                    id="brandDescription"
                    className={`form-control form-control-sm ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newBrandDescription}
                    onChange={(e) => setNewBrandDescription(e.target.value)}
                    rows="3"
                  ></textarea>
                  {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="brandLogoFile" className="form-label small text-muted">شعار العلامة التجارية (ملف):</label>
                  <input
                    type="file"
                    id="brandLogoFile"
                    className={`form-control form-control-sm ${validationErrors.logo ? 'is-invalid' : ''}`}
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
                        width={100}
                        height={100}
                        style={{ objectFit: 'contain' }}
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

                <div className="mb-3">
                  <label htmlFor="brandStatus" className="form-label small text-muted">الحالة:</label>
                  <select
                    id="brandStatus"
                    className={`form-select form-select-sm ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newBrandStatus}
                    onChange={(e) => setNewBrandStatus(e.target.value)}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger small">{formError}</div>}
                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-primary btn-sm shadow-sm">
                    {editingBrand ? 'تحديث' : 'إضافة'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm shadow-sm" onClick={handleCloseModal}>
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

export default BrandManagement;