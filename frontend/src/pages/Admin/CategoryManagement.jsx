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
    <div className="container-fluid">
      <h1 className="mb-4 fw-bold text-success">إدارة الأقسام</h1>

      <div className="card shadow-lg mb-5 border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3">
          {editingCategory ? 'تعديل قسم موجود' : 'إضافة قسم جديد'}
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="categoryName" className="form-label">اسم القسم:</label>
                <input
                  type="text"
                  id="categoryName"
                  className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                  value={newCategoryName}
                  onChange={handleNameChange}
                  required
                />
                {validationErrors.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="categorySlug" className="form-label">الرابط النظيف (Slug):</label>
                <input
                  type="text"
                  id="categorySlug"
                  className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  required
                />
                {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="categoryDescription" className="form-label">الوصف:</label>
              <textarea
                id="categoryDescription"
                className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows="3"
              ></textarea>
              {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="categoryParent" className="form-label">الفئة الأم (اختياري):</label>
                <select
                  id="categoryParent"
                  className={`form-select ${validationErrors.parent_id ? 'is-invalid' : ''}`}
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

              <div className="col-md-6">
                <label htmlFor="categoryImageFile" className="form-label">صورة القسم (ملف):</label>
                <input
                  type="file"
                  id="categoryImageFile"
                  className={`form-control ${validationErrors.image ? 'is-invalid' : ''}`}
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  accept="image/*"
                />
                {validationErrors.image && <div className="invalid-feedback">{validationErrors.image[0]}</div>}
                {(newCategoryImagePreview || (editingCategory && editingCategory.image_url && !imageRemoved)) && (
                  <div className="mt-2 text-center border p-2 rounded bg-light">
                    <img
                      src={newCategoryImagePreview || (editingCategory && editingCategory.image_url)}
                      alt="معاينة الصورة"
                      className="img-thumbnail"
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
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
            </div>

            <div className="mb-3">
              <label htmlFor="categoryStatus" className="form-label">الحالة:</label>
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
              {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}
            <button type="submit" className="btn btn-success me-2">
              {editingCategory ? 'تحديث القسم' : 'إضافة القسم'}
            </button>
            {editingCategory && (
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                إلغاء التعديل
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          الأقسام الحالية
        </div>
        <div className="card-body p-0">
          {categories.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد أقسام حتى الآن.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {categories.map((category) => (
                <li key={category.category_id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center">
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="img-thumbnail me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/60x60/cccccc/333333?text=خطأ"; }}
                      />
                    )}
                    <div>
                      <h5 className="mb-1 fw-bold text-dark">{category.name}</h5>
                      {category.parent && (
                        <p className="mb-1 text-muted small">
                          الفئة الأم: <span className="badge bg-secondary">{category.parent.name}</span>
                        </p>
                      )}
                      <p className="mb-1 text-muted small">{category.description}</p>
                      <span className="badge bg-light text-dark me-2">{category.slug}</span>
                      <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`}>{category.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEdit(category)}>
                      <i className="bi bi-pencil-square"></i> تعديل
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(category.category_id)}>
                      <i className="bi bi-trash"></i> حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
