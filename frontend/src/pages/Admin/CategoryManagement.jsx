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
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الأقسام...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الأقسام...</p>
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
      <h1 className="mb-4 fw-bold text-primary text-center text-md-start">إدارة الأقسام</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddClick}>
          <FaPlusCircle className="me-2" /> إضافة قسم جديد
        </button>
      </div>
      
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white fw-bold py-3 text-center">
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
                                className="img-thumbnail rounded thumb-50"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; }}
                              />
                            ) : (
                              <span className="text-muted small">لا يوجد صورة</span>
                            )}
                          </td>
                          <td>
                            <h6 className="mb-0 fw-bold">{category.name}</h6>
                            <span className="badge bg-light text-dark">{category.slug}</span>
                          </td>
                          <td><span className="text-muted small">{category.description || 'لا يوجد وصف'}</span></td>
                          <td>
                            {category.parent ? (
                              <span className="badge bg-secondary text-white">{category.parent.name}</span>
                            ) : (
                              <span className="text-muted">لا يوجد</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {category.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-success text-white me-2 shadow-sm" onClick={() => handleEditClick(category)}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(category.category_id)}>
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
              {/* عرض هرمي للأقسام على الجوال: قائمة عمودية مع طيّ الفروع */}
              <div className="d-lg-none p-3">
                <ul className="list-group">
                  {categories
                    .filter(c => !c.parent_id)
                    .map(parent => (
                      <li key={parent.category_id} className="list-group-item">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            {parent.image_url && (
                              <img src={parent.image_url} alt={parent.name} className="img-thumbnail me-2 rounded thumb-50" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/50x50/cccccc/333333?text=خطأ'; }} />
                            )}
                            <div>
                              <h6 className="mb-0 fw-bold">{parent.name}</h6>
                              <small className="text-muted">{parent.slug}</small>
                            </div>
                          </div>
                          <button className="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target={`#sub-${parent.category_id}`}>
                            عرض الأقسام الفرعية
                          </button>
                        </div>
                        <div id={`sub-${parent.category_id}`} className="collapse mt-2">
                          <ul className="list-group list-group-flush">
                            {categories.filter(c => c.parent_id === parent.category_id).map(child => (
                              <li key={child.category_id} className="list-group-item d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="mb-0">{child.name}</h6>
                                  <small className="text-muted">{child.slug}</small>
                                </div>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-success" onClick={() => handleEditClick(child)}><FaPencilAlt/> تعديل</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(child.category_id)}><FaTrashAlt/> حذف</button>
                                </div>
                              </li>
                            ))}
                            {categories.filter(c => c.parent_id === parent.category_id).length === 0 && (
                              <li className="list-group-item text-muted small">لا توجد أقسام فرعية</li>
                            )}
                          </ul>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal لإضافة/تعديل الأقسام */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        {showModal && <div className="modal-backdrop-custom" />}
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header bg-primary text-white py-3">
              <h5 className="modal-title fw-bold">{editingCategory ? 'تعديل قسم' : 'إضافة قسم'}</h5>
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
                  />
                  {validationErrors.image && <div className="invalid-feedback">{validationErrors.image[0]}</div>}
                  {(newCategoryImagePreview || (editingCategory && editingCategory.image_url && !imageRemoved)) && (
                    <div className="mt-2 text-center border p-2 rounded bg-light preview-box">
                      <img
                        src={newCategoryImagePreview || (editingCategory && editingCategory.image_url)}
                        alt="معاينة الصورة"
                        className="img-thumbnail thumb-100"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; }}
                      />
                      <p className="small text-muted mt-1">معاينة الصورة</p>
                      {(newCategoryImagePreview || (editingCategory && editingCategory.image_url)) && (
                          <button type="button" className="btn btn-sm btn-outline-danger mt-1" onClick={handleRemoveImage}>
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
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger small">{formError}</div>}
                
                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-primary btn-sm shadow-sm">
                    {editingCategory ? 'تحديث' : 'إضافة'}
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

export default CategoryManagement;