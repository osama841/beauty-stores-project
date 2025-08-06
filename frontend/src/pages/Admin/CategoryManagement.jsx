// src/pages/Admin/CategoryManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import '../../styles/admin/CategoryManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState('');
  const [newCategoryImageFile, setNewCategoryImageFile] = useState(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState(null);
  const [newCategoryStatus, setNewCategoryStatus] = useState('active');
  const [imageRemoved, setImageRemoved] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef(null);

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
    setNewCategoryName(name);
    if (!editingCategory) {
      setNewCategorySlug(generateSlug(name));
    }
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      const sortedCategories = data.sort((a, b) => {
        if (a.parent_id === null && b.parent_id !== null) return -1;
        if (a.parent_id !== null && b.parent_id === null) return 1;
        return a.name.localeCompare(b.name);
      });
      setCategories(sortedCategories);
    } catch (err) {
      console.error('فشل تحميل الأقسام. الرجاء المحاولة لاحقاً:', err);
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
    fetchCategories();
  }, [fetchCategories]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategoryImageFile(file);
      setNewCategoryImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    } else {
      setNewCategoryImageFile(null);
      setNewCategoryImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategorySlug('');
    setNewCategoryDescription('');
    setNewCategoryParentId('');
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setNewCategoryStatus('active');
    setEditingCategory(null);
    setImageRemoved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormError(null);
    setValidationErrors({});
  };

  const handleAddClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategorySlug(category.slug);
    setNewCategoryDescription(category.description);
    setNewCategoryParentId(category.parent_id || '');
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(category.image_url || null);
    setNewCategoryStatus(category.status);
    setImageRemoved(false);
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

    const categoryData = {
      name: newCategoryName,
      slug: newCategorySlug,
      description: newCategoryDescription,
      parent_id: newCategoryParentId === '' ? null : newCategoryParentId,
      status: newCategoryStatus,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.category_id, categoryData, newCategoryImageFile, imageRemoved);
        alert('تم تحديث القسم بنجاح!');
      } else {
        await createCategory(categoryData, newCategoryImageFile);
        alert('تم إضافة القسم بنجاح!');
      }
      handleCloseModal();
      fetchCategories();
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
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا القسم؟')) {
      try {
        await deleteCategory(id);
        alert('تم حذف القسم بنجاح!');
        fetchCategories();
      } catch (err) {
        console.error('خطأ في حذف القسم:', err);
        alert('فشل حذف القسم: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الأقسام...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الأقسام...</p>
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
      <h1 className="mb-4 fw-bold text-success text-center text-md-start" style={{ color: '#60c78c' }}>إدارة الأقسام</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddClick} style={{ backgroundColor: '#6a8eec', borderColor: '#6a8eec' }}>
          <FaPlusCircle className="me-2" /> إضافة قسم جديد
        </button>
      </div>
      
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3 text-center" style={{ backgroundColor: '#60c78c' }}>
          الأقسام الحالية
        </div>
        <div className="card-body p-0">
          {categories.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد أقسام حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>الصورة</th>
                        <th>الاسم</th>
                        <th>الوصف</th>
                        <th>الفئة الأم</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.category_id}>
                          <td>
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="img-thumbnail rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid #dee2e6' }}
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; }}
                              />
                            ) : (
                              <span className="text-muted small">لا يوجد صورة</span>
                            )}
                          </td>
                          <td>
                            <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{category.name}</h6>
                            <span className="badge bg-light text-dark" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>{category.slug}</span>
                          </td>
                          <td><span className="text-muted small">{category.description || 'لا يوجد وصف'}</span></td>
                          <td>
                            {category.parent ? (
                              <span className="badge bg-secondary" style={{ backgroundColor: '#6c757d', color: '#ffffff' }}>{category.parent.name}</span>
                            ) : (
                              <span className="text-muted">لا يوجد</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: category.status === 'active' ? '#60c78c' : '#e74c3c' }}>
                              {category.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => handleEditClick(category)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(category.category_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
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
                <div className="accordion" id="categoryAccordion">
                  {categories.map((category) => (
                    <div key={category.category_id} className="accordion-item mb-2 rounded-lg shadow-sm border" style={{ borderColor: '#dee2e6' }}>
                      <h2 className="accordion-header" id={`heading${category.category_id}`}>
                        <button 
                          className="accordion-button collapsed py-3" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${category.category_id}`} 
                          aria-expanded="false" 
                          aria-controls={`collapse${category.category_id}`}
                          style={{ backgroundColor: '#ffffff', color: '#343a40' }}
                        >
                          <div className="d-flex align-items-center w-100">
                            {category.image_url && (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="img-thumbnail me-3 rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid #dee2e6' }}
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; }}
                              />
                            )}
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{category.name}</h6>
                              {category.parent && (
                                <span className="badge bg-secondary mt-1" style={{ backgroundColor: '#6c757d', color: '#ffffff' }}>{category.parent.name}</span>
                              )}
                            </div>
                            <span className={`badge ms-2 ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ backgroundColor: category.status === 'active' ? '#60c78c' : '#e74c3c' }}>
                              {category.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse${category.category_id}`} className="accordion-collapse collapse" aria-labelledby={`heading${category.category_id}`} data-bs-parent="#categoryAccordion">
                        <div className="accordion-body" style={{ backgroundColor: '#f8f9fa', color: '#343a40' }}>
                          <p className="text-muted small mb-1"><strong>الوصف:</strong> {category.description || 'لا يوجد وصف'}</p>
                          <p className="text-muted small mb-3"><strong>الرابط:</strong> {category.slug}</p>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-sm btn-info text-white shadow-sm" onClick={() => handleEditClick(category)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(category.category_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
                              <FaTrashAlt /> حذف
                            </button>
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

      {/* Modal لإضافة/تعديل الأقسام */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-lg shadow-lg" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
            <div className="modal-header bg-success text-white py-3" style={{ backgroundColor: '#60c78c' }}>
              <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem' }}>{editingCategory ? 'تعديل قسم' : 'إضافة قسم'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label small text-muted">اسم القسم:</label>
                  <input
                    type="text"
                    id="categoryName"
                    className={`form-control form-control-sm ${validationErrors.name ? 'is-invalid' : ''}`}
                    value={newCategoryName}
                    onChange={handleNameChange}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="categorySlug" className="form-label small text-muted">الرابط النظيف (Slug):</label>
                  <input
                    type="text"
                    id="categorySlug"
                    className={`form-control form-control-sm ${validationErrors.slug ? 'is-invalid' : ''}`}
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label small text-muted">الوصف:</label>
                  <textarea
                    id="categoryDescription"
                    className={`form-control form-control-sm ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows="3"
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  ></textarea>
                  {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryParent" className="form-label small text-muted">الفئة الأم:</label>
                  <select
                    id="categoryParent"
                    className={`form-select form-select-sm ${validationErrors.parent_id ? 'is-invalid' : ''}`}
                    value={newCategoryParentId}
                    onChange={(e) => setNewCategoryParentId(e.target.value)}
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  >
                    <option value="">لا يوجد فئة أم</option>
                    {categories.filter(cat => cat.category_id !== (editingCategory ? editingCategory.category_id : null)).map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.parent_id && <div className="invalid-feedback">{validationErrors.parent_id[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryImageFile" className="form-label small text-muted">صورة القسم:</label>
                  <input
                    type="file"
                    id="categoryImageFile"
                    className={`form-control form-control-sm ${validationErrors.image ? 'is-invalid' : ''}`}
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.image && <div className="invalid-feedback">{validationErrors.image[0]}</div>}
                  {(newCategoryImagePreview || (editingCategory && editingCategory.image_url && !imageRemoved)) && (
                    <div className="mt-2 text-center border p-2 rounded bg-light" style={{ borderColor: '#e9ecef', backgroundColor: '#f8f9fa' }}>
                      <img
                        src={newCategoryImagePreview || (editingCategory && editingCategory.image_url)}
                        alt="معاينة الصورة"
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', border: '1px solid #dee2e6' }}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; }}
                      />
                      <p className="small text-muted mt-1">معاينة الصورة</p>
                      {(newCategoryImagePreview || (editingCategory && editingCategory.image_url)) && (
                          <button type="button" className="btn btn-sm btn-outline-danger mt-1" onClick={handleRemoveImage} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                              إزالة الصورة
                          </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryStatus" className="form-label small text-muted">الحالة:</label>
                  <select
                    id="categoryStatus"
                    className={`form-select form-select-sm ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newCategoryStatus}
                    onChange={(e) => setNewCategoryStatus(e.target.value)}
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
                  <button type="submit" className="btn btn-success btn-sm shadow-sm" style={{ backgroundColor: '#60c78c', borderColor: '#60c78c' }}>
                    {editingCategory ? 'تحديث' : 'إضافة'}
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

export default CategoryManagement;