// src/pages/Admin/CategoryManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';

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

  // توليد الـ Slug من الاسم
  const generateSlug = (name) => {
    if (!name) return '';
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

  // معالجة تغيير اسم القسم وتوليد الـ Slug تلقائيًا
  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewCategoryName(name);
    if (!editingCategory) {
      setNewCategorySlug(generateSlug(name));
    }
  };

  // جلب الأقسام من API
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
      let errorMessage = 'فشل تحميل الأقسام. الرجاء المحاولة لاحقاً.';
      if (err && typeof err === 'object') {
        if (err.message) errorMessage = err.message;
        if (err.errors) errorMessage = Object.values(err.errors).flat().join(' ');
      }
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // معالجة تغيير صورة القسم
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
        return;
      }
      setNewCategoryImageFile(file);
      setNewCategoryImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    }
  };

  // إزالة الصورة المحددة
  const handleRemoveImage = () => {
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setNewCategoryName('');
    setNewCategorySlug('');
    setNewCategoryDescription('');
    setNewCategoryParentId('');
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(null);
    setNewCategoryStatus('active');
    setImageRemoved(false);
    setEditingCategory(null);
    setFormError(null);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // فتح النافذة المنبثقة للإضافة
  const handleAddCategory = () => {
    resetForm();
    setShowModal(true);
  };

  // فتح النافذة المنبثقة للتعديل
  const handleEdit = (category) => {
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

  // إغلاق النافذة المنبثقة
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // إرسال النموذج (إضافة/تعديل)
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
        await updateCategory(
          editingCategory.category_id,
          categoryData,
          newCategoryImageFile,
          imageRemoved
        );
        alert('تم تحديث القسم بنجاح!');
      } else {
        await createCategory(categoryData, newCategoryImageFile);
        alert('تم إضافة القسم بنجاح!');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('خطأ في العملية:', err);
      if (err?.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setFormError(err.response.data.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err.message || 'حدث خطأ غير متوقع.');
      }
    }
  };

  // حذف قسم
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا القسم؟ سيتم حذف جميع الأقسام الفرعية التابعة له أيضاً.')) {
      try {
        await deleteCategory(id);
        alert('تم حذف القسم بنجاح!');
        fetchCategories();
      } catch (err) {
        console.error('خطأ في حذف القسم:', err);
        alert('فشل حذف القسم: ' + (err.message || 'حدث خطأ غير متوقع'));
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
        <button className="btn btn-primary mt-3" onClick={fetchCategories}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="mb-4 fw-bold text-success">إدارة الأقسام</h1>

      {/* زر إضافة قسم جديد */}
      <button 
        className="btn btn-success mb-4"
        onClick={handleAddCategory}
      >
        <i className="bi bi-plus-circle me-2"></i> إضافة قسم جديد
      </button>

      {/* قائمة الأقسام الحالية */}
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          الأقسام الحالية ({categories.length})
        </div>
        <div className="card-body p-0">
          {categories.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">لا توجد أقسام حتى الآن</p>
              <button 
                className="btn btn-success mt-2"
                onClick={handleAddCategory}
              >
                <i className="bi bi-plus-circle me-2"></i> إضافة قسم جديد
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }}>الصورة</th>
                    <th>الاسم</th>
                    <th>الوصف</th>
                    <th>الفئة الأم</th>
                    <th>الحالة</th>
                    <th style={{ width: '150px' }}>الإجراءات</th>
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
                            className="img-thumbnail"
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/60x60/cccccc/333333?text=لا+يوجد+صورة";
                            }}
                          />
                        ) : (
                          <div 
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px'
                            }}
                          >
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">{category.name}</div>
                        <div className="text-muted small">{category.slug}</div>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {category.description || 'لا يوجد وصف'}
                        </div>
                      </td>
                      <td>
                        {category.parent ? (
                          <span className="badge bg-info text-dark">
                            {category.parent.name}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">رئيسي</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {category.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(category)}
                            title="تعديل"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(category.category_id)}
                            title="حذف"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* نافذة منبثقة لإضافة/تعديل الأقسام */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} 
           style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }} 
           tabIndex="-1" 
           aria-hidden={!showModal}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title fw-bold">
                <i className={`bi ${editingCategory ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="categoryName" className="form-label">
                      اسم القسم: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                      value={newCategoryName}
                      onChange={handleNameChange}
                      required
                      placeholder="أدخل اسم القسم"
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback">{validationErrors.name[0]}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="categorySlug" className="form-label">
                      الرابط النظيف (Slug): <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="categorySlug"
                      className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      required
                      placeholder="سيتم توليده تلقائياً"
                    />
                    {validationErrors.slug && (
                      <div className="invalid-feedback">{validationErrors.slug[0]}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label">
                    الوصف:
                  </label>
                  <textarea
                    id="categoryDescription"
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows="3"
                    placeholder="وصف مختصر للقسم (اختياري)"
                  ></textarea>
                  {validationErrors.description && (
                    <div className="invalid-feedback">{validationErrors.description[0]}</div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="categoryParent" className="form-label">
                      الفئة الأم (اختياري):
                    </label>
                    <select
                      id="categoryParent"
                      className={`form-select ${validationErrors.parent_id ? 'is-invalid' : ''}`}
                      value={newCategoryParentId}
                      onChange={(e) => setNewCategoryParentId(e.target.value)}
                    >
                      <option value="">لا يوجد فئة أم</option>
                      {categories
                        .filter(cat => 
                          !editingCategory || 
                          cat.category_id !== editingCategory.category_id
                        )
                        .map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                    {validationErrors.parent_id && (
                      <div className="invalid-feedback">{validationErrors.parent_id[0]}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="categoryImageFile" className="form-label">
                      صورة القسم:
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        id="categoryImageFile"
                        className={`form-control ${validationErrors.image ? 'is-invalid' : ''}`}
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        accept="image/*"
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <i className="bi bi-upload"></i>
                      </button>
                    </div>
                    <small className="text-muted">يُفضل صورة بحجم 800x800 بكسل وبحد أقصى 2MB</small>
                    {validationErrors.image && (
                      <div className="invalid-feedback">{validationErrors.image[0]}</div>
                    )}
                  </div>
                </div>

                {/* معاينة الصورة */}
                {(newCategoryImagePreview || (editingCategory?.image_url && !imageRemoved)) && (
                  <div className="mb-4 p-3 border rounded bg-light text-center">
                    <img
                      src={newCategoryImagePreview || editingCategory.image_url}
                      alt="معاينة صورة القسم"
                      className="img-thumbnail mb-2"
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/200x200/cccccc/333333?text=خطأ+في+الصورة";
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveImage}
                    >
                      <i className="bi bi-trash me-1"></i> إزالة الصورة
                    </button>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="categoryStatus" className="form-label">
                    الحالة: <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoryStatus"
                    className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newCategoryStatus}
                    onChange={(e) => setNewCategoryStatus(e.target.value)}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                  {validationErrors.status && (
                    <div className="invalid-feedback">{validationErrors.status[0]}</div>
                  )}
                </div>

                {formError && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {formError}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={handleCloseModal}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success px-4"
                  >
                    {editingCategory ? 'حفظ التعديلات' : 'إضافة القسم'}
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