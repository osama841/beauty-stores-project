    // src/pages/Homepage.jsx
    import React from 'react';
    import { Link } from 'react-router-dom';

    const Homepage = () => {
      return (
        <div className="container text-center my-5 p-5 bg-white rounded shadow-lg">
          <h1 className="display-4 fw-bold text-dark mb-4">
            مرحباً بك في <span className="text-primary">متجر الجمال</span>!
          </h1>
          <p className="lead text-muted mb-5">
            هذه هي الصفحة الرئيسية. الرجاء تسجيل الدخول أو التسجيل لاستكشاف منتجاتنا الرائعة.
          </p>
          <img
            src="https://placehold.co/800x400/ADD8E6/000000?text=منتجات+الجمال"
            alt="منتجات الجمال"
            className="img-fluid rounded shadow-sm mb-5"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x400/cccccc/333333?text=صورة+غير+متوفرة"; }}
          />
          <div className="d-grid gap-3 d-md-flex justify-content-md-center">
            <Link to="/products" className="btn btn-lg btn-info text-white fw-bold shadow-sm">
              استكشف المنتجات
            </Link>
            <Link to="/register" className="btn btn-lg btn-warning fw-bold shadow-sm">
              ابدأ التسوق الآن
            </Link>
          </div>
        </div>
      );
    };

    export default Homepage;
    