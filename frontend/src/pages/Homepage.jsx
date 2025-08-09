// src/pages/Homepage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/ProductCard';
import './../styles/homepage.css';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const featuredProductsResponse = await getProducts({ is_featured: true, per_page: 8 });
      const processedFeaturedProducts = featuredProductsResponse.data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      }));
      setFeaturedProducts(processedFeaturedProducts);

      const categoriesData = await getCategories();
      const categoriesToDisplay = [];

      for (const category of categoriesData) {
        try {
          const categoryProductsResponse = await getProducts({ category_id: category.category_id, per_page: 5 });
          const processedCategoryProducts = categoryProductsResponse.data.map(product => ({
            ...product,
            price: parseFloat(product.price),
            compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
          }));
          categoriesToDisplay.push({
            ...category,
            products: processedCategoryProducts,
          });
        } catch (catErr) {
          console.warn(`فشل تحميل منتجات الفئة ${category.name}:`, catErr);
          categoriesToDisplay.push({ ...category, products: [] });
        }
      }
      setCategoriesWithProducts(categoriesToDisplay);

    } catch (err) {
      console.error('فشل تحميل بيانات الصفحة الرئيسية:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل بيانات الصفحة الرئيسية.';
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
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل الصفحة الرئيسية...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل الصفحة الرئيسية...</p>
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

  return (
    <div className="homepage-container">
      {/* قسم البطل (Hero Section) */}
      <section className="hero-section text-white text-center py-5 mb-5">
        <div className="container py-5">
          <h1 className="display-4 fw-bold mb-3">اكتشف جمالك مع لمسة روز</h1>
          <p className="lead mb-4">أفضل المنتجات التجميلية والعناية بالبشرة في مكان واحد.</p>
          <Link to="/products" className="btn btn-primary btn-lg fw-bold shadow-sm">
            تسوق الآن <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* قسم المنتجات المميزة */}
      <section className="featured-products-section container my-5">
        <h2 className="text-center mb-5 fw-bold text-dark">منتجات مميزة</h2>
        {featuredProducts.length === 0 ? (
          <p className="text-center text-muted">لا توجد منتجات مميزة لعرضها حالياً.</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {featuredProducts.map((product) => (
              <div className="col" key={product.product_id}> {/* ****** تأكد من key={product.product_id} ****** */}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-5">
          <Link to="/products" className="btn btn-outline-primary btn-lg">
            عرض جميع المنتجات <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* قسم التسوق حسب الفئة - يعرض 5 منتجات لكل فئة */}
      <section className="shop-by-category-section container my-5">
        <h2 className="text-center mb-5 fw-bold text-dark">تسوق حسب الفئة</h2>
        {categoriesWithProducts.length === 0 ? (
          <p className="text-center text-muted">لا توجد فئات لعرضها حالياً.</p>
        ) : (
          <div className="row g-5">
            {categoriesWithProducts.map((category) => (
              <div className="col-12" key={category.category_id}> {/* ****** تأكد من key={category.category_id} ****** */}
                <div className="card shadow-sm border-0 rounded-lg mb-4">
                  <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-dark">{category.name}</h4>
                    <Link to={`/products?category_id=${category.category_id}`} className="btn btn-sm btn-outline-primary">
                      عرض المزيد <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                  <div className="card-body">
                    {category.products.length === 0 ? (
                      <p className="text-center text-muted py-3 mb-0">لا توجد منتجات في هذه الفئة حالياً.</p>
                    ) : (
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
                        {category.products.map((product) => (
                          <div className="col" key={product.product_id}> {/* ****** تأكد من key={product.product_id} ****** */}
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* قسم الميزات أو العروض الخاصة (اختياري) */}
      <section className="features-section bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-5 fw-bold text-dark">لماذا تختار متجرنا؟</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 rounded-lg p-4">
                <i className="bi bi-truck fs-1 text-primary mb-3"></i>
                <h5 className="fw-bold mb-2">شحن سريع وموثوق</h5>
                <p className="text-muted small">نضمن وصول طلباتك بأسرع وقت وأمان تام.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 rounded-lg p-4">
                <i className="bi bi-shield-check fs-1 text-success mb-3"></i>
                <h5 className="fw-bold mb-2">منتجات أصلية 100%</h5>
                <p className="text-muted small">جميع منتجاتنا مضمونة الجودة والأصالة.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 rounded-lg p-4">
                <i className="bi bi-headset fs-1 text-info mb-3"></i>
                <h5 className="fw-bold mb-2">دعم عملاء ممتاز</h5>
                <p className="text-muted small">فريق دعم جاهز لمساعدتك 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
