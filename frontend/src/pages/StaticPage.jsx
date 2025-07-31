// src/pages/StaticPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/pages'; // استيراد دالة API لجلب الصفحة

const StaticPage = () => {
  const { slug } = useParams(); // الحصول على الـ slug من الـ URL
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة لجلب تفاصيل الصفحة بناءً على الـ slug
  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPageBySlug(slug);
      setPage(data);
    } catch (err) {
      console.error(`فشل تحميل الصفحة ذات الـ slug "${slug}":`, err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل الصفحة.';
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
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الصفحة...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الصفحة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-warning" role="alert">
          الصفحة المطلوبة غير موجودة.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-lg p-4 bg-white">
        <h1 className="mb-4 fw-bold text-dark">{page.title}</h1>
        <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }}></div>
      </div>
    </div>
  );
};

export default StaticPage;
