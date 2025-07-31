// src/pages/Admin/ContentManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPages, createPage, updatePage, deletePage } from '../../api/pages';
import '../../styles/admin/ContentManagement.css';

const ContentManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة النموذج
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStatus, setNewStatus] = useState('published');

  const [editingPage, setEditingPage] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // دالة لتوليد الـ Slug من العنوان
  const generateSlug = (title) => {
    return title
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setNewTitle(title);
    if (!editingPage) {
      setNewSlug(generateSlug(title));
    }
  };

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPages();
      setPages(data);
    } catch (err) {
      console.error('فشل تحميل الصفحات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل الصفحات.';
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
    fetchPages();
  }, [fetchPages]);

  const resetForm = () => {
    setNewTitle('');
    setNewSlug('');
    setNewContent('');
    setNewStatus('published');
    setEditingPage(null);
    setFormError(null);
    setValidationErrors({});
  };

  const handleAddPageClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (page) => {
    setEditingPage(page);
    setNewTitle(page.title);
    setNewSlug(page.slug);
    setNewContent(page.content);
    setNewStatus(page.status);
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

    const pageData = {
      title: newTitle,
      slug: newSlug,
      content: newContent,
      status: newStatus,
    };

    try {
      if (editingPage) {
        await updatePage(editingPage.page_id, pageData);
        alert('تم تحديث الصفحة بنجاح!');
      } else {
        await createPage(pageData);
        alert('تم إضافة الصفحة بنجاح!');
      }
      handleCloseModal();
      fetchPages();
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
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه الصفحة؟')) {
      try {
        await deletePage(id);
        alert('تم حذف الصفحة بنجاح!');
        fetchPages();
      } catch (err) {
        console.error('خطأ في حذف الصفحة:', err);
        alert('فشل حذف الصفحة: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الصفحات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الصفحات...</p>
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
      <h1 className="mb-4 fw-bold text-success">إدارة المحتوى</h1>

      <button className="btn btn-primary mb-4" onClick={handleAddPageClick}>
        <i className="bi bi-plus-circle me-2"></i> إضافة صفحة جديدة
      </button>

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3">
          الصفحات الحالية
        </div>
        <div className="card-body p-0">
          {pages.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد صفحات حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>معرف الصفحة</th>
                    <th>العنوان</th>
                    <th>الرابط (Slug)</th>
                    <th>الحالة</th>
                    <th>آخر تحديث</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.page_id}>
                      <td>{page.page_id}</td>
                      <td>{page.title}</td>
                      <td>{page.slug}</td>
                      <td>
                        <span className={`badge ${page.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                          {page.status === 'published' ? 'منشورة' : 'مسودة'}
                        </span>
                      </td>
                      <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEditClick(page)}>
                          <i className="bi bi-pencil-square"></i> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(page.page_id)}>
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

      {/* Modal لإضافة/تعديل الصفحات */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-success text-white py-3">
              <h5 className="modal-title fw-bold">{editingPage ? 'تعديل صفحة موجودة' : 'إضافة صفحة جديدة'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="pageTitle" className="form-label">عنوان الصفحة:</label>
                  <input
                    type="text"
                    id="pageTitle"
                    className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                    value={newTitle}
                    onChange={handleTitleChange}
                    required
                  />
                  {validationErrors.title && <div className="invalid-feedback">{validationErrors.title[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageSlug" className="form-label">الرابط (Slug):</label>
                  <input
                    type="text"
                    id="pageSlug"
                    className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    required
                  />
                  {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageContent" className="form-label">محتوى الصفحة:</label>
                  <textarea
                    id="pageContent"
                    className={`form-control ${validationErrors.content ? 'is-invalid' : ''}`}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows="10"
                    required
                  ></textarea>
                  {validationErrors.content && <div className="invalid-feedback">{validationErrors.content[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageStatus" className="form-label">الحالة:</label>
                  <select
                    id="pageStatus"
                    className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="published">منشورة</option>
                    <option value="draft">مسودة</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger">{formError}</div>}
                <button type="submit" className="btn btn-success me-2" disabled={loading}>
                  {editingPage ? 'تحديث الصفحة' : 'إضافة الصفحة'}
                </button>
                {editingPage && (
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

export default ContentManagement;
