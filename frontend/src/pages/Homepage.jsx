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
            استكشف منتجاتنا الرائعة واستمتع بأفضل العروض.
          </p>
          <img
            src="https://placehold.co/800x400/ADD8E6/000000?text=منتجات+الجمال"
            alt="منتجات الجمال"
            className="img-fluid rounded shadow-sm mb-5"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/800x400/cccccc/333333?text=صورة+غير+متوفرة";
            }}
          />
          <div className="row text-center mb-5">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">منتجات جديدة</h5>
                  <p className="card-text">اكتشف أحدث المنتجات المضافة إلى متجرنا.</p>
                  <Link to="/new-products" className="btn btn-primary">
                    استكشاف
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">أفضل العروض</h5>
                  <p className="card-text">استفد من الخصومات والعروض المميزة.</p>
                  <Link to="/offers" className="btn btn-success">
                    عرض العروض
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">منتجات مميزة</h5>
                  <p className="card-text">تصفح المنتجات الأكثر مبيعاً لدينا.</p>
                  <Link to="/featured" className="btn btn-warning">
                    تصفح الآن
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
