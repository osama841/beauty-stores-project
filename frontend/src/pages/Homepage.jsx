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
      <div className="container text-center my-5 py-5">
        <div className="spinner-grow text-purple" role="status" style={{width: '3rem', height: '3rem'}}>
          <span className="visually-hidden">جاري تحميل الصفحة الرئيسية...</span>
        </div>
        <p className="mt-3 text-muted fs-5">جاري تحميل الصفحة الرئيسية...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <button className="btn btn-purple mt-3" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-2"></i>إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {/* Hero Section - تصميم جديد */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-background" style={{
          backgroundImage: 'linear-gradient(rgba(111, 66, 193, 0.8), rgba(76, 40, 140, 0.8)), url(https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
          minHeight: '500px'
        }}>
          <div className="container h-100 d-flex align-items-center">
            <div className="hero-content text-white text-center text-md-start">
              <h1 className="display-3 fw-bold mb-4 animate__animated animate__fadeInDown">اكتشف جمالك الحقيقي</h1>
              <p className="lead fs-4 mb-5 animate__animated animate__fadeIn animate__delay-1s">منتجات تجميلية فاخرة مصممة لتعزيز جمالك الطبيعي</p>
              <div className="d-flex gap-3 justify-content-center justify-content-md-start animate__animated animate__fadeInUp animate__delay-1s">
                <Link to="/products" className="btn btn-light btn-lg px-4 py-3 rounded-pill fw-bold shadow">
                  تسوق الآن <i className="bi bi-arrow-left ms-2"></i>
                </Link>
                <Link to="/about" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold">
                  تعرف علينا
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#fff"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#fff"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#fff"></path>
          </svg>
        </div>
      </section>

      {/* Brands Section - جديد */}
      <section className="brands-section py-4 bg-light">
        <div className="container">
          <div className="row align-items-center justify-content-center g-4">
            {['brand1', 'brand2', 'brand3', 'brand4', 'brand5'].map((brand, index) => (
              <div className="col-6 col-md-2" key={index}>
                <div className="brand-logo p-3 d-flex align-items-center justify-content-center">
                  <img 
                    src={`https://placehold.co/150x80/f8f9fa/6f42c1?text=${brand}`} 
                    alt={`Brand ${index + 1}`} 
                    className="img-fluid opacity-75 hover-opacity-100 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - تصميم جديد */}
      <section className="featured-products-section py-5 position-relative">
        <div className="container position-relative">
          <div className="section-header text-center mb-5">
            <h2 className="section-title fw-bold position-relative d-inline-block">
              <span className="position-relative z-index-1">منتجات مميزة</span>
              <span className="section-title-bg">Featured</span>
            </h2>
            <p className="text-muted mt-3">اكتشف أفضل منتجاتنا المختارة بعناية</p>
          </div>
          
          {featuredProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="bi bi-emoji-frown fs-1 text-muted"></i>
                <p className="mt-3 text-muted fs-5">لا توجد منتجات مميزة لعرضها حالياً.</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredProducts.map((product) => (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.product_id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-5">
            <Link to="/products" className="btn btn-purple btn-lg rounded-pill px-4 py-2 fw-bold shadow-sm">
              تصفح جميع المنتجات <i className="bi bi-arrow-left ms-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section - تصميم جديد */}
      <section className="shop-by-category-section py-5 bg-light">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title fw-bold position-relative d-inline-block">
              <span className="position-relative z-index-1">تسوق حسب الفئة</span>
              <span className="section-title-bg">Categories</span>
            </h2>
            <p className="text-muted mt-3">اختر من بين مجموعتنا الواسعة من الفئات</p>
          </div>
          
          {categoriesWithProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="bi bi-tags fs-1 text-muted"></i>
                <p className="mt-3 text-muted fs-5">لا توجد فئات لعرضها حالياً.</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {categoriesWithProducts.map((category) => (
                <div className="col-12" key={category.category_id}>
                  <div className="category-card card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white p-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
                      <h3 className="mb-0 fw-bold text-purple">{category.name}</h3>
                      <Link 
                        to={`/products?category_id=${category.category_id}`} 
                        className="btn btn-outline-purple btn-sm rounded-pill mt-2 mt-md-0"
                      >
                        عرض الكل <i className="bi bi-arrow-left ms-2"></i>
                      </Link>
                    </div>
                    <div className="card-body p-4">
                      {category.products.length === 0 ? (
                        <div className="empty-state py-4 text-center">
                          <i className="bi bi-box-seam fs-1 text-muted"></i>
                          <p className="mt-3 text-muted">لا توجد منتجات في هذه الفئة حالياً.</p>
                        </div>
                      ) : (
                        <div className="row g-4">
                          {category.products.map((product) => (
                            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={product.product_id}>
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
        </div>
      </section>

      {/* Special Offer Banner - جديد */}
      <section className="special-offer py-5 my-5">
        <div className="container">
          <div className="offer-banner p-5 rounded-4 position-relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #6f42c1 0%, #8a2be2 100%)'
          }}>
            <div className="row align-items-center">
              <div className="col-md-8 text-white">
                <h2 className="display-5 fw-bold mb-3">خصم خاص لموسم الصيف!</h2>
                <p className="lead mb-4">وفر حتى 40% على مجموعة العناية بالبشرة</p>
                <div className="countdown d-flex gap-3 mb-4">
                  <div className="countdown-item bg-white text-purple rounded-3 p-2 text-center">
                    <div className="countdown-value fw-bold fs-3">02</div>
                    <div className="countdown-label small">أيام</div>
                  </div>
                  <div className="countdown-item bg-white text-purple rounded-3 p-2 text-center">
                    <div className="countdown-value fw-bold fs-3">12</div>
                    <div className="countdown-label small">ساعات</div>
                  </div>
                  <div className="countdown-item bg-white text-purple rounded-3 p-2 text-center">
                    <div className="countdown-value fw-bold fs-3">45</div>
                    <div className="countdown-label small">دقائق</div>
                  </div>
                </div>
                <Link to="/offers" className="btn btn-light btn-lg rounded-pill px-4 fw-bold shadow">
                  استفد من العرض الآن <i className="bi bi-arrow-left ms-2"></i>
                </Link>
              </div>
              <div className="col-md-4 d-none d-md-block">
                <img 
                  src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Special Offer" 
                  className="img-fluid rounded-3 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - تصميم جديد */}
      <section className="features-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title fw-bold position-relative d-inline-block">
              <span className="position-relative z-index-1">لماذا تختارنا؟</span>
              <span className="section-title-bg">Why Us</span>
            </h2>
          </div>
          
          <div className="row g-4">
            {[
              {
                icon: 'bi-truck',
                title: 'شحن سريع',
                description: 'توصيل سريع وآمن لجميع أنحاء المملكة خلال 2-5 أيام عمل'
              },
              {
                icon: 'bi-shield-check',
                title: 'منتجات أصلية',
                description: 'جميع منتجاتنا مضمونة 100% مع ضمان الجودة والأصالة'
              },
              {
                icon: 'bi-arrow-repeat',
                title: 'إرجاع سهل',
                description: 'سياسة إرجاع لمدة 14 يومًا بدون أي متاعب أو تعقيدات'
              },
              {
                icon: 'bi-headset',
                title: 'دعم فني',
                description: 'فريق دعم فني متاح على مدار الساعة لمساعدتك في أي استفسار'
              }
            ].map((feature, index) => (
              <div className="col-12 col-sm-6 col-lg-3" key={index}>
                <div className="feature-card card border-0 h-100 shadow-sm p-4 text-center hover-shadow transition">
                  <div className="feature-icon bg-purple-light text-purple rounded-circle p-3 mx-auto mb-4">
                    <i className={`bi ${feature.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - جديد */}
      <section className="testimonials-section py-5 bg-light">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title fw-bold position-relative d-inline-block">
              <span className="position-relative z-index-1">آراء عملائنا</span>
              <span className="section-title-bg">Reviews</span>
            </h2>
            <p className="text-muted mt-3">ما يقوله عملاؤنا عن منتجاتنا</p>
          </div>
          
          <div className="row g-4">
            {[
              {
                name: 'سارة أحمد',
                role: 'عميلة',
                comment: 'منتجات رائعة وجميلة، وصلتني في الوقت المحدد، شكراً لكم على الجودة العالية.',
                rating: 5,
                image: 'https://randomuser.me/api/portraits/women/32.jpg'
              },
              {
                name: 'نورا محمد',
                role: 'عميلة',
                comment: 'تجربة تسوق ممتعة، جميع المنتجات التي طلبتها كانت أفضل مما توقعت.',
                rating: 4,
                image: 'https://randomuser.me/api/portraits/women/44.jpg'
              },
              {
                name: 'لمى خالد',
                role: 'عميلة',
                comment: 'خدمة عملاء ممتازة وساعدوني في اختيار المنتجات المناسبة لبشرتي.',
                rating: 5,
                image: 'https://randomuser.me/api/portraits/women/68.jpg'
              }
            ].map((testimonial, index) => (
              <div className="col-md-4" key={index}>
                <div className="testimonial-card card border-0 h-100 shadow-sm p-4">
                  <div className="d-flex align-items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="rounded-circle me-3" 
                      width="60" 
                      height="60"
                    />
                    <div>
                      <h6 className="mb-1 fw-bold">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </div>
                  <p className="mb-4">"{testimonial.comment}"</p>
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`bi ${i < testimonial.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - جديد */}
      <section className="newsletter-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="card border-0 shadow p-5 rounded-4 bg-purple text-white">
                <h2 className="fw-bold mb-3">اشترك في نشرتنا البريدية</h2>
                <p className="mb-4 opacity-75">احصل على آخر العروض والتخفيضات مباشرة إلى بريدك الإلكتروني</p>
                <form className="row g-2 justify-content-center">
                  <div className="col-md-8">
                    <input 
                      type="email" 
                      className="form-control form-control-lg rounded-pill border-0" 
                      placeholder="بريدك الإلكتروني" 
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <button 
                      type="submit" 
                      className="btn btn-light btn-lg w-100 rounded-pill fw-bold text-purple"
                    >
                      اشتراك
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;