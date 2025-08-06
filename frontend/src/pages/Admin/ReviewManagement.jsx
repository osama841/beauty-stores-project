// src/pages/Admin/ReviewManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviews, approveReview, deleteReview } from '../../api/reviews';
import '../../styles/admin/ReviewManagement.css';
import { FaCheckCircle, FaTrashAlt, FaStar, FaStarHalfAlt, FaRegStar, FaFilter, FaSyncAlt } from 'react-icons/fa';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // دالة لجلب المراجعات
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: filterStatus };
      const data = await getAllReviews(params);
      setReviews(data);
    } catch (err) {
      console.error('فشل تحميل المراجعات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل المراجعات.';
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
  }, [filterStatus]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // دالة للموافقة على مراجعة
  const handleApprove = async (reviewId) => {
    if (window.confirm('هل أنت متأكد أنك تريد الموافقة على هذه المراجعة؟')) {
      try {
        await approveReview(reviewId);
        alert('تمت الموافقة على المراجعة بنجاح!');
        fetchReviews();
      } catch (err) {
        console.error('فشل الموافقة على المراجعة:', err);
        alert('فشل الموافقة على المراجعة: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  // دالة لحذف مراجعة
  const handleDelete = async (reviewId) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه المراجعة؟')) {
      try {
        await deleteReview(reviewId);
        alert('تم حذف المراجعة بنجاح!');
        fetchReviews();
      } catch (err) {
        console.error('فشل حذف المراجعة:', err);
        alert('فشل حذف المراجعة: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  // دالة مساعدة لعرض النجوم
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="review-rating d-inline-block">
        {Array.from({ length: fullStars }, (_, i) => (
          <FaStar key={`full-${i}`} className="text-warning" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-warning" />}
        {Array.from({ length: emptyStars }, (_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-muted" />
        ))}
      </div>
    );
  };
  
  const getStatusBadgeClass = (isApproved) => {
    return isApproved ? 'bg-success' : 'bg-warning text-dark';
  };

  const getStatusText = (isApproved) => {
    return isApproved ? 'معتمدة' : 'معلقة';
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5" style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل المراجعات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل المراجعات...</p>
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
      <h1 className="mb-4 fw-bold text-success text-center text-md-start" style={{ color: '#60c78c' }}>إدارة المراجعات</h1>

      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="w-100 mb-3 mb-md-0">
          <label htmlFor="filterStatus" className="form-label small text-muted">تصفية حسب الحالة:</label>
          <select
            id="filterStatus"
            className="form-select form-select-sm w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ borderColor: '#ced4da', fontSize: '0.9rem' }}
          >
            <option value="">جميع المراجعات</option>
            <option value="pending">معلقة</option>
            <option value="approved">معتمدة</option>
          </select>
        </div>
        <button className="btn btn-sm btn-outline-primary d-flex align-items-center shadow-sm" onClick={fetchReviews} style={{ color: '#6a8eec', borderColor: '#6a8eec' }}>
          <FaSyncAlt className="me-2" />
          تحديث القائمة
        </button>
      </div>

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-success text-white fw-bold py-3 text-center" style={{ backgroundColor: '#60c78c' }}>
          المراجعات الحالية
        </div>
        <div className="card-body p-0">
          {reviews.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد مراجعات حتى الآن.</p>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>المنتج</th>
                        <th>المستخدم</th>
                        <th>التقييم</th>
                        <th>العنوان/التعليق</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.review_id}>
                          <td><h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{review.product ? review.product.name : 'منتج غير معروف'}</h6></td>
                          <td><span className="text-muted small">{review.user ? review.user.username : 'مستخدم غير معروف'}</span></td>
                          <td>{renderRatingStars(review.rating)}</td>
                          <td>
                            <h6 className="mb-0 fw-bold small" style={{ color: '#343a40' }}>{review.title || 'لا يوجد عنوان'}</h6>
                            <p className="mb-0 small text-muted">{review.comment.substring(0, 50)}...</p>
                          </td>
                          <td><span className="text-muted small">{new Date(review.review_date).toLocaleDateString('ar-SA')}</span></td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(review.is_approved)}`} style={{ backgroundColor: review.is_approved ? '#60c78c' : '#ffc107' }}>
                              {getStatusText(review.is_approved)}
                            </span>
                          </td>
                          <td>
                            {!review.is_approved && (
                              <button className="btn btn-sm btn-success text-white me-2 shadow-sm" onClick={() => handleApprove(review.review_id)} style={{ backgroundColor: '#60c78c', borderColor: '#60c78c' }}>
                                <FaCheckCircle /> موافقة
                              </button>
                            )}
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(review.review_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
                              <FaTrashAlt /> حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* عرض Accordion للشاشات الصغيرة */}
              <div className="d-lg-none p-3">
                <div className="accordion" id="reviewAccordion">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="accordion-item mb-2 rounded-lg shadow-sm border" style={{ borderColor: '#dee2e6' }}>
                      <h2 className="accordion-header" id={`heading${review.review_id}`}>
                        <button 
                          className="accordion-button collapsed py-3" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#collapse${review.review_id}`} 
                          aria-expanded="false" 
                          aria-controls={`collapse${review.review_id}`}
                          style={{ backgroundColor: '#ffffff', color: '#343a40' }}
                        >
                          <div className="d-flex align-items-center w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-bold" style={{ color: '#343a40' }}>{review.product ? review.product.name : 'منتج غير معروف'}</h6>
                              <p className="text-muted small mb-0">{review.user ? review.user.username : 'مستخدم غير معروف'}</p>
                            </div>
                            <span className={`badge ms-2 ${getStatusBadgeClass(review.is_approved)}`} style={{ backgroundColor: review.is_approved ? '#60c78c' : '#ffc107' }}>
                              {getStatusText(review.is_approved)}
                            </span>
                          </div>
                        </button>
                      </h2>
                      <div id={`collapse${review.review_id}`} className="accordion-collapse collapse" aria-labelledby={`heading${review.review_id}`} data-bs-parent="#reviewAccordion">
                        <div className="accordion-body" style={{ backgroundColor: '#f8f9fa', color: '#343a40' }}>
                          <p className="text-muted small mb-1"><strong>التقييم:</strong> {renderRatingStars(review.rating)}</p>
                          <p className="text-muted small mb-1"><strong>العنوان:</strong> {review.title || 'لا يوجد عنوان'}</p>
                          <p className="text-muted small mb-1"><strong>التعليق:</strong> {review.comment}</p>
                          <p className="text-muted small mb-3"><strong>التاريخ:</strong> {new Date(review.review_date).toLocaleDateString('ar-SA')}</p>
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            {!review.is_approved && (
                              <button className="btn btn-sm btn-success text-white shadow-sm" onClick={() => handleApprove(review.review_id)} style={{ backgroundColor: '#60c78c', borderColor: '#60c78c' }}>
                                <FaCheckCircle /> موافقة
                              </button>
                            )}
                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(review.review_id)} style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}>
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
    </div>
  );
};

export default ReviewManagement;