// src/pages/Products/ProductListingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import ProductCard from '../../components/ProductCard';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/products/ProductListingPage.css'; // يمكن إضافة ملف CSS خاص بهذه الصفحة

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category_id: '',
    brand_id: '',
    min_price: '',
    max_price: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 12,
  });

  const location = useLocation();
  const navigate = useNavigate();

  // دالة لجلب المنتجات بناءً على الفلاتر والصفحة الحالية
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(location.search);
      const currentFilters = {
        category_id: queryParams.get('category_id') || '',
        brand_id: queryParams.get('brand_id') || '',
        min_price: queryParams.get('min_price') || '',
        max_price: queryParams.get('max_price') || '',
        search: queryParams.get('search') || '',
        sort_by: queryParams.get('sort_by') || 'created_at',
        sort_order: queryParams.get('sort_order') || 'desc',
        page: queryParams.get('page') || 1,
        per_page: queryParams.get('per_page') || 12,
      };
      setFilters(currentFilters);

      const productsData = await getProducts(currentFilters);
      const processedProducts = productsData.data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
        stock_quantity: parseInt(product.stock_quantity),
        weight: product.weight ? parseFloat(product.weight) : null,
        length: product.length ? parseFloat(product.length) : null,
        width: product.width ? parseFloat(product.width) : null,
        height: product.height ? parseFloat(product.height) : null,
      }));
      setProducts(processedProducts);
      setCurrentPage(productsData.current_page);
      setTotalPages(productsData.last_page);

    } catch (err) {
      console.error('فشل تحميل المنتجات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل المنتجات.';
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
  }, [location.search]);

  // دالة لجلب الفئات والعلامات التجارية
  const fetchCategoriesAndBrands = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (err) {
      console.error('خطأ في جلب الفئات أو العلامات التجارية:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [fetchProducts, fetchCategoriesAndBrands]);

  // دالة لتغيير الفلاتر وتحديث الـ URL
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  // دالة لتغيير البحث وتحديث الـ URL
  const handleSearchChange = (e) => {
    const value = e.target.value;
    const newFilters = { ...filters, search: value, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  // دالة للتنقل بين الصفحات
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page: page };
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  // دالة لتحديث URL المتصفح بناءً على الفلاتر
  const updateUrl = (currentFilters) => {
    const queryParams = new URLSearchParams();
    for (const key in currentFilters) {
      if (currentFilters[key] !== '' && currentFilters[key] !== null && currentFilters[key] !== undefined) {
        queryParams.set(key, currentFilters[key]);
      }
    }
    navigate(`?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل المنتجات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل المنتجات...</p>
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
    <div className="container my-5">
      <h1 className="text-center mb-4 fw-bold text-info">جميع المنتجات</h1>

      <div className="row mb-4 g-3 align-items-center">
        {/* شريط البحث */}
        <div className="col-md-4">
          <input
            type="text"
            name="search"
            placeholder="ابحث عن منتجات..."
            value={filters.search}
            onChange={handleSearchChange}
            className="form-control"
          />
        </div>

        {/* تصفية حسب الفئة */}
        <div className="col-md-3">
          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* تصفية حسب العلامة التجارية */}
        <div className="col-md-3">
          <select
            name="brand_id"
            value={filters.brand_id}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">جميع العلامات التجارية</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* فرز حسب */}
        <div className="col-md-2">
          <select
            name="sort_by"
            value={filters.sort_by}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="created_at">تاريخ الإضافة</option>
            <option value="price">السعر</option>
            <option value="name">الاسم</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            name="sort_order"
            value={filters.sort_order}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
        </div>

        {/* تصفية حسب السعر */}
        <div className="col-md-3">
          <input
            type="number"
            name="min_price"
            placeholder="الحد الأدنى للسعر"
            value={filters.min_price}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            name="max_price"
            placeholder="الحد الأقصى للسعر"
            value={filters.max_price}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted fs-5 mt-5">لم يتم العثور على منتجات مطابقة لمعاييرك.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {products.map((product) => (
            <div className="col" key={product.product_id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Product pagination" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                السابق
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                التالي
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ProductListingPage;
