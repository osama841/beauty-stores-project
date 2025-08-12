// src/pages/Homepage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/common/Toast';
import ProductGrid, { FeaturedProductGrid } from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import './../styles/homepage.css';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();
  const toast = useToast();

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

  // معالجة إضافة للسلة
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`تمت إضافة ${product.name} للسلة`);
    } catch (error) {
      console.error('خطأ في إضافة المنتج للسلة:', error);
      toast.error('فشل في إضافة المنتج للسلة');
    }
  };

  if (error) {
    return (
      <div className="container my-5">
        <EmptyState
          variant="error"
          title="خطأ في تحميل الصفحة الرئيسية"
          description={error}
          actionText="إعادة المحاولة"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {/* قسم البطل (Hero Section) */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="container">
            <div className="hero-text">
              <h1 className="hero-title">اكتشف جمالك مع لمسة روز</h1>
              <p className="hero-subtitle">
                أفضل المنتجات التجميلية والعناية بالبشرة في مكان واحد.
                تألقي بجمالك الطبيعي مع مجموعتنا المميزة.
              </p>
              <div className="hero-actions">
                <Button
                  as={Link}
                  to="/products"
                  variant="primary"
                  size="lg"
                  icon="bi bi-bag-heart"
                >
                  تسوقي الآن
                </Button>
                <Button
                  as={Link}
                  to="/products?category=bestsellers"
                  variant="outline"
                  size="lg"
                  icon="bi bi-star"
                >
                  الأكثر مبيعاً
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* قسم المنتجات المميزة */}
        <FeaturedProductGrid
          title="منتجات مميزة"
          subtitle="اكتشفي أحدث المنتجات المختارة بعناية لك"
          products={featuredProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
          viewAllLink="/products"
          emptyStateTitle="لا توجد منتجات مميزة"
          emptyStateDescription="تابعي معنا قريباً لمشاهدة أحدث المنتجات المميزة"
          columns={4}
        />

        {/* قسم التسوق حسب الفئة */}
        <section className="categories-section">
          <div className="section-header">
            <h2 className="section-title">تسوقي حسب الفئة</h2>
            <p className="section-subtitle">
              اكتشفي مجموعتنا المتنوعة من منتجات الجمال والعناية
            </p>
          </div>

          {loading ? (
            <div className="categories-loading">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="category-section-skeleton">
                  <div className="skeleton category-title-skeleton"></div>
                  <ProductGridSkeleton count={5} columns={5} />
                </div>
              ))}
            </div>
          ) : categoriesWithProducts.length === 0 ? (
            <EmptyState
              title="لا توجد فئات"
              description="لا توجد فئات منتجات متاحة حالياً"
              icon="bi bi-grid"
            />
          ) : (
            <div className="categories-grid">
              {categoriesWithProducts.map((category) => (
                <div key={category.category_id} className="category-section">
                  <div className="category-header">
                    <h3 className="category-title">{category.name}</h3>
                    <Button
                      as={Link}
                      to={`/products?category_id=${category.category_id}`}
                      variant="ghost"
                      size="sm"
                      icon="bi bi-arrow-left"
                      iconPosition="end"
                    >
                      عرض المزيد
                    </Button>
                  </div>
                  
                  <ProductGrid
                    products={category.products}
                    columns={5}
                    gap="sm"
                    onAddToCart={handleAddToCart}
                    emptyStateVariant="search"
                    emptyStateTitle="لا توجد منتجات"
                    emptyStateDescription={`لا توجد منتجات في فئة ${category.name} حالياً`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* قسم الميزات */}
        <section className="features-section">
          <div className="section-header text-center">
            <h2 className="section-title">لماذا تختارين متجرنا؟</h2>
            <p className="section-subtitle">
              نحن ملتزمون بتقديم أفضل تجربة تسوق لك
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-truck" aria-hidden="true"></i>
              </div>
              <h3 className="feature-title">شحن سريع ومجاني</h3>
              <p className="feature-description">
                شحن مجاني للطلبات فوق 200 ريال ووصول سريع لجميع المدن
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-shield-check" aria-hidden="true"></i>
              </div>
              <h3 className="feature-title">منتجات أصلية 100%</h3>
              <p className="feature-description">
                جميع منتجاتنا مضمونة الجودة والأصالة من العلامات التجارية الموثوقة
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-headset" aria-hidden="true"></i>
              </div>
              <h3 className="feature-title">دعم عملاء مميز</h3>
              <p className="feature-description">
                فريق دعم متخصص جاهز لمساعدتك في اختيار المنتجات المناسبة
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-arrow-return-left" aria-hidden="true"></i>
              </div>
              <h3 className="feature-title">سهولة الإرجاع</h3>
              <p className="feature-description">
                إمكانية إرجاع أو استبدال المنتجات خلال 14 يوم من تاريخ الشراء
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Homepage;
