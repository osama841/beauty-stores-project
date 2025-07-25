// src/components/ReviewForm.jsx
import React, { useState } from 'react';

const ReviewForm = ({ onSubmit, product_id, user }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setValidationErrors({});

    try {
      await onSubmit({ product_id, rating, title, comment });
      // إعادة تعيين النموذج بعد الإرسال الناجح
      setRating(5);
      setTitle('');
      setComment('');
      alert('تم إرسال مراجعتك بنجاح! ستظهر بعد مراجعة المسؤول.');
    } catch (err) {
      console.error('خطأ في إرسال المراجعة:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع أثناء إرسال المراجعة.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-0 rounded-lg">
      <div className="card-header bg-light fw-bold py-3">
        اكتب مراجعتك {user?.username ? `(${user.username})` : ''}
      </div>
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">التقييم:</label>
            <select
              id="rating"
              className={`form-select ${validationErrors.rating ? 'is-invalid' : ''}`}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              <option value="1">1 نجمة</option>
              <option value="2">2 نجوم</option>
              <option value="3">3 نجوم</option>
              <option value="4">4 نجوم</option>
              <option value="5">5 نجوم</option>
            </select>
            {validationErrors.rating && <div className="invalid-feedback">{validationErrors.rating[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">عنوان المراجعة (اختياري):</label>
            <input
              type="text"
              id="title"
              className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="255"
            />
            {validationErrors.title && <div className="invalid-feedback">{validationErrors.title[0]}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="comment" className="form-label">مراجعتك:</label>
            <textarea
              id="comment"
              className={`form-control ${validationErrors.comment ? 'is-invalid' : ''}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="5"
            ></textarea>
            {validationErrors.comment && <div className="invalid-feedback">{validationErrors.comment[0]}</div>}
          </div>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'جاري الإرسال...' : 'إرسال المراجعة'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
