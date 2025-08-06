// src/pages/Admin/ContentManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPages, createPage, updatePage, deletePage } from '../../api/pages';
import '../../styles/admin/ContentManagement.css'; // تأكد من تحديث هذا الملف إذا لزم الأمر
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const ContentManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStatus, setNewStatus] = useState('published');

  const [editingPage, setEditingPage] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

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
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الصفحات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الصفحات...</p>
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
      <h1 className="mb-4 fw-bold text-success text-center text-md-start" style={{ color: '#60c78c' }}>إدارة المحتوى</h1>

      <div className="d-flex justify-content-center justify-content-md-start">
        <button className="btn btn-primary mb-4 shadow-sm" onClick={handleAddPageClick} style={{ backgroundColor: '#6a8eec', borderColor: '#6a8eec' }}>
          <FaPlusCircle className="me-2" /> إضافة صفحة جديدة
        </button>
      </div>
      
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3 text-center" style={{ backgroundColor: '#60c78c' }}>
          الصفحات الحالية
        </div>
        <div className="card-body p-0">
          {pages.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد صفحات حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
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
                          <td>
                            <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{page.title}</h6>
                          </td>
                          <td><span className="text-muted small">{page.slug}</span></td>
                          <td>
                            <span className={`badge ${page.status === 'published' ? 'bg-success' : 'bg-secondary'}`} style={{ backgroundColor: page.status === 'published' ? '#60c78c' : '#6c757d' }}>
                              {page.status === 'published' ? 'منشورة' : 'مسودة'}
                            </span>
                          </td>
                          <td><span className="text-muted small">{new Date(page.updated_at).toLocaleDateString('ar-SA')}</span></td>
                          <td>
                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => handleEditClick(page)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(page.page_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
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
                <div className="accordion" id="contentAccordion">
                  {pages.map((page) => (
                    <div key={page.page_id} className="accordion-item mb-2 rounded-lg shadow-sm border" style={{ borderColor: '#dee2e6' }}>
                      <h2 className="accordion-header" id={`heading${page.page_id}`}>
                        <button 
                          className="accordion-button collapsed py-3" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${page.page_id}`} 
                          aria-expanded="false" 
                          aria-controls={`collapse${page.page_id}`}
                          style={{ backgroundColor: '#ffffff', color: '#343a40' }}
                        >
                          <div className="d-flex align-items-center w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{page.title}</h6>
                              <span className="badge bg-light text-dark" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>{page.slug}</span>
                            </div>
                            <span className={`badge ms-2 ${page.status === 'published' ? 'bg-success' : 'bg-secondary'}`} style={{ backgroundColor: page.status === 'published' ? '#60c78c' : '#6c757d' }}>
                              {page.status === 'published' ? 'منشورة' : 'مسودة'}
                            </span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse${page.page_id}`} className="accordion-collapse collapse" aria-labelledby={`heading${page.page_id}`} data-bs-parent="#contentAccordion">
                        <div className="accordion-body" style={{ backgroundColor: '#f8f9fa', color: '#343a40' }}>
                          <p className="text-muted small mb-1"><strong>آخر تحديث:</strong> {new Date(page.updated_at).toLocaleDateString('ar-SA')}</p>
                          <p className="text-muted small mb-3"><strong>المحتوى:</strong> {page.content.substring(0, 100)}...</p> {/* عرض جزء من المحتوى */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-sm btn-info text-white shadow-sm" onClick={() => handleEditClick(page)} style={{ backgroundColor: '#81c784', borderColor: '#81c784' }}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(page.page_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
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

      {/* Modal لإضافة/تعديل الصفحات */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content rounded-lg shadow-lg" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
            <div className="modal-header bg-success text-white py-3" style={{ backgroundColor: '#60c78c' }}>
              <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem' }}>{editingPage ? 'تعديل صفحة' : 'إضافة صفحة'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="pageTitle" className="form-label small text-muted">عنوان الصفحة:</label>
                  <input
                    type="text"
                    id="pageTitle"
                    className={`form-control form-control-sm ${validationErrors.title ? 'is-invalid' : ''}`}
                    value={newTitle}
                    onChange={handleTitleChange}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.title && <div className="invalid-feedback">{validationErrors.title[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageSlug" className="form-label small text-muted">الرابط (Slug):</label>
                  <input
                    type="text"
                    id="pageSlug"
                    className={`form-control form-control-sm ${validationErrors.slug ? 'is-invalid' : ''}`}
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  />
                  {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageContent" className="form-label small text-muted">محتوى الصفحة:</label>
                  <textarea
                    id="pageContent"
                    className={`form-control form-control-sm ${validationErrors.content ? 'is-invalid' : ''}`}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows="10"
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  ></textarea>
                  {validationErrors.content && <div className="invalid-feedback">{validationErrors.content[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="pageStatus" className="form-label small text-muted">الحالة:</label>
                  <select
                    id="pageStatus"
                    className={`form-select form-select-sm ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
                  >
                    <option value="published">منشورة</option>
                    <option value="draft">مسودة</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger small">{formError}</div>}
                
                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-success btn-sm shadow-sm" disabled={loading} style={{ backgroundColor: '#60c78c', borderColor: '#60c78c' }}>
                    {editingPage ? 'تحديث' : 'إضافة'}
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

export default ContentManagement;