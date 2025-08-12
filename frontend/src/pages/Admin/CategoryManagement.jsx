// src/pages/Admin/CategoryManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
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

  const generateSlug = (name) =>
    name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');

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
      // ترتيب: الأقسام الرئيسية أولاً ثم الفرعية، ثم بالاسم
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        if (a.parent_id === null && b.parent_id !== null) return -1;
        if (a.parent_id !== null && b.parent_id === null) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      setCategories(sorted);
    } catch (err) {
      console.error('فشل تحميل الأقسام:', err);
      let msg = 'حدث خطأ غير متوقع أثناء تحميل البيانات.';
      if (err?.message) msg = err.message;
      if (err?.errors) msg = Object.values(err.errors).flat().join(' ');
      else if (err?.error) msg = err.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormError(null);
    setValidationErrors({});
  };

  const handleAddClick = () => { resetForm(); setShowModal(true); };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name || '');
    setNewCategorySlug(category.slug || '');
    setNewCategoryDescription(category.description || '');
    setNewCategoryParentId(category.parent_id || '');
    setNewCategoryImageFile(null);
    setNewCategoryImagePreview(category.image_url || null);
    setNewCategoryStatus(category.status || 'active');
    setImageRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); resetForm(); };

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

  // render
  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">جاري تحميل الأقسام...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="alert alert-danger" role="alert">{String(error)}</div>
      </div>
    );
  }

  // helpers for mobile hierarchical list
  const parents = categories.filter(c => !c.parent_id);
  const childrenOf = (pid) => categories.filter(c => c.parent_id === pid);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">إدارة الأقسام</h1>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <FaPlusCircle className="me-2" /> إضافة قسم جديد
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <strong>الأقسام الحالية</strong>
        </div>
        <div className="card-body p-0">
          {categories.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد أقسام حتى الآن.</p>
          ) : (
            <>
              {/* جدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{width: 72}}>الصورة</th>
                        <th>الاسم</th>
                        <th>الوصف</th>
                        <th>الفئة الأم</th>
                        <th>الحالة</th>
                        <th style={{width: 200}}>الإجراءات</th>
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
                                style={{ width: 56, height: 56, objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56?text=%D8%AE%D8%B7%D8%A3'; }}
                              />
                            ) : (
                              <span className="text-muted small">لا يوجد</span>
                            )}
                          </td>
                          <td>
                            <div className="fw-semibold">{category.name}</div>
                            <div className="text-muted small">{category.slug}</div>
                          </td>
                          <td className="text-muted small">{category.description || '—'}</td>
                          <td className="text-muted small">
                            {category.parent ? category.parent.name : '—'}
                          </td>
                          <td>
                            <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {category.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(category)}>
                                <FaPencilAlt className="me-1" /> تعديل
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(category.category_id)}>
                                <FaTrashAlt className="me-1" /> حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* قائمة هرمية للجوال */}
              <div className="d-lg-none p-3">
                <ul className="list-group">
                  {parents.map((parent) => (
                    <li key={parent.category_id} className="list-group-item">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          {parent.image_url ? (
                            <img
                              src={parent.image_url}
                              alt={parent.name}
                              className="rounded"
                              style={{ width: 48, height: 48, objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48?text=%D8%AE%D8%B7%D8%A3'; }}
                            />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                 style={{ width: 48, height: 48 }}>
                              <span className="small text-muted">لا صورة</span>
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{parent.name}</div>
                            <small className="text-muted">{parent.slug}</small>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          data-bs-toggle="collapse"
                          data-bs-target={`#sub-${parent.category_id}`}
                        >
                          عرض الفرعي
                        </button>
                      </div>

                      <div id={`sub-${parent.category_id}`} className="collapse mt-2">
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleEditClick(parent)}>
                            <FaPencilAlt /> تعديل
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(parent.category_id)}>
                            <FaTrashAlt /> حذف
                          </button>
                        </div>

                        <ul className="list-group list-group-flush mt-2">
                          {childrenOf(parent.category_id).map((child) => (
                            <li key={child.category_id} className="list-group-item d-flex align-items-center justify-content-between">
                              <div>
                                <div className="fw-semibold">{child.name}</div>
                                <small className="text-muted">{child.slug}</small>
                              </div>
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-success" onClick={() => handleEditClick(child)}>
                                  <FaPencilAlt /> تعديل
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(child.category_id)}>
                                  <FaTrashAlt /> حذف
                                </button>
                              </div>
                            </li>
                          ))}
                          {childrenOf(parent.category_id).length === 0 && (
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

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ background: showModal ? 'rgba(0,0,0,.5)' : 'transparent' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingCategory ? 'تعديل قسم' : 'إضافة قسم'}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">اسم القسم</label>
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

                <div className="mb-3">
                  <label htmlFor="categorySlug" className="form-label">الرابط النظيف (Slug)</label>
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

                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label">الوصف</label>
                  <textarea
                    id="categoryDescription"
                    rows={3}
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  />
                  {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryParent" className="form-label">الفئة الأم</label>
                  <select
                    id="categoryParent"
                    className={`form-select ${validationErrors.parent_id ? 'is-invalid' : ''}`}
                    value={newCategoryParentId}
                    onChange={(e) => setNewCategoryParentId(e.target.value)}
                  >
                    <option value="">لا يوجد فئة أم</option>
                    {categories
                      .filter(cat => cat.category_id !== (editingCategory ? editingCategory.category_id : null))
                      .map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                      ))}
                  </select>
                  {validationErrors.parent_id && <div className="invalid-feedback">{validationErrors.parent_id[0]}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryImageFile" className="form-label">صورة القسم</label>
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
                    <div className="mt-2 text-center">
                      <img
                        src={newCategoryImagePreview || (editingCategory && editingCategory.image_url)}
                        alt="معاينة الصورة"
                        className="img-thumbnail"
                        style={{ maxWidth: 140, maxHeight: 140, objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/140x140?text=%D8%AE%D8%B7%D8%A3'; }}
                      />
                      <div className="mt-2">
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveImage}>
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="categoryStatus" className="form-label">الحالة</label>
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

                {formError && <div className="alert alert-danger small">{String(formError)}</div>}

                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'تحديث' : 'إضافة'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
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
