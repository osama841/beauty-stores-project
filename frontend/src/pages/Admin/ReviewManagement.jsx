// src/pages/Admin/ReviewManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviews, approveReview, deleteReview } from '../../api/reviews';
import '../../styles/admin/ReviewManagement.css';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(''); // لتصفية المراجعات (مثلاً: 'pending', 'approved')

  // دالة لجلب المراجعات
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: filterStatus }; // إرسال حالة التصفية
      const data = await getAllReviews(params);
      setReviews(data); // API يُرجع مصفوفة مباشرة (وليس paginate object هنا)
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
  }, [filterStatus]); // أعد جلب المراجعات عند تغيير حالة التصفية

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // دالة للموافقة على مراجعة
  const handleApprove = async (reviewId) => {
    if (window.confirm('هل أنت متأكد أنك تريد الموافقة على هذه المراجعة؟')) {
      try {
        await approveReview(reviewId);
        alert('تمت الموافقة على المراجعة بنجاح!');
        fetchReviews(); // إعادة جلب المراجعات لتحديث القائمة
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
        fetchReviews(); // إعادة جلب المراجعات لتحديث القائمة
      } catch (err) {
        console.error('فشل حذف المراجعة:', err);
        alert('فشل حذف المراجعة: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل المراجعات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل المراجعات...</p>
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
      <h1 className="mb-4 fw-bold text-success">إدارة المراجعات</h1>

      {/* شريط التصفية */}
      <div className="mb-4">
        <label htmlFor="filterStatus" className="form-label">تصفية حسب الحالة:</label>
        <select
          id="filterStatus"
          className="form-select w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">جميع المراجعات</option>
          <option value="pending">معلقة</option>
          <option value="approved">معتمدة</option>
          {/* يمكن إضافة 'rejected' إذا كان لديك هذا الخيار في DB */}
        </select>
      </div>

      {/* قائمة المراجعات الحالية */}
      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          المراجعات الحالية
        </div>
        <div className="card-body p-0">
          {reviews.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد مراجعات حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>معرف المراجعة</th>
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
                      <td>{review.review_id}</td>
                      <td>{review.product ? review.product.name : 'منتج غير معروف'}</td>
                      <td>{review.user ? review.user.username : 'مستخدم غير معروف'}</td>
                      <td>
                        <div className="review-rating">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                          ))}
                        </div>
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold">{review.title || 'لا يوجد عنوان'}</h6>
                        <p className="mb-0 small text-muted">{review.comment}</p>
                      </td>
                      <td>{new Date(review.review_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${review.is_approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {review.is_approved ? 'معتمدة' : 'معلقة'}
                        </span>
                      </td>
                      <td>
                        {!review.is_approved && (
                          <button className="btn btn-sm btn-success text-white me-2" onClick={() => handleApprove(review.review_id)}>
                            <i className="bi bi-check-circle"></i> موافقة
                          </button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(review.review_id)}>
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
    </div>
  );
};

export default ReviewManagement;
