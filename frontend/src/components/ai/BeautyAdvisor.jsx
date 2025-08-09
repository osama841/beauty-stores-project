// frontend/src/components/ai/BeautyAdvisor.jsx

import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom'; // لإنشاء روابط التنقل

function BeautyAdvisor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAnswer('');
    setLoading(true);

    try {
      // إرسال السؤال إلى الواجهة الخلفية لـ Laravel
      const response = await apiClient.post('/beauty-advisor/ask', { question });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error('Error asking AI advisor:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to get an answer from the AI advisor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="h3 fw-bold text-center text-primary mb-3">مستشار الجمال الذكي ✨</h2>
              <p className="text-center text-muted mb-4">اسألني عن الروتين، المكونات، أو اختيار المنتجات المناسبة لنوع بشرتك.</p>

              <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="question" className="form-label">سؤالك</label>
                  <textarea
                    id="question"
                    name="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="form-control"
                    rows={4}
                    placeholder="مثال: ما أفضل روتين للعناية بالبشرة الدهنية؟"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'جاري السؤال...' : 'اسأل المستشار'}
                </button>
              </form>

              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

              {answer && (
                <div className="alert alert-info" role="alert">
                  <h3 className="h6 fw-bold mb-2">إجابة المستشار:</h3>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
                </div>
              )}

              <p className="text-center text-muted small mt-3">
                <Link to="/">العودة للرئيسية</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeautyAdvisor;
