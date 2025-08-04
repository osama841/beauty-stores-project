// src/pages/Admin/ProductManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import '../../styles/admin/ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProductName, setNewProductName] = useState('');
  const [newProductSlug, setNewProductSlug] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductShortDescription, setNewProductShortDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCompareAtPrice, setNewProductCompareAtPrice] = useState('');
  const [newProductCostPrice, setNewProductCostPrice] = useState('');
  const [newProductStockQuantity, setNewProductStockQuantity] = useState('');
  const [newProductLowStockThreshold, setNewProductLowStockThreshold] = useState('');
  const [newProductSKU, setNewProductSKU] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [newProductLength, setNewProductLength] = useState('');
  const [newProductWidth, setNewProductWidth] = useState('');
  const [newProductHeight, setNewProductHeight] = useState('');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  const [newProductBrandId, setNewProductBrandId] = useState('');
  const [newProductMainImageFile, setNewProductMainImageFile] = useState(null);
  const [newProductMainImagePreview, setNewProductMainImagePreview] = useState(null);
  const [newProductAdditionalImageFiles, setNewProductAdditionalImageFiles] = useState([]);
  const [newProductAdditionalImagePreviews, setNewProductAdditionalImagePreviews] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [removedAdditionalImageIds, setRemovedAdditionalImageIds] = useState([]);

  const [newProductIsFeatured, setNewProductIsFeatured] = useState(false);
  const [newProductStatus, setNewProductStatus] = useState('active');
  const [mainImageRemoved, setMainImageRemoved] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const mainFileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const generateSlug = (name) => {
    return name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewProductName(name);
    if (!editingProduct) {
      setNewProductSlug(generateSlug(name));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productsData = await getProducts();
      const processedProducts = productsData.data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
        stock_quantity: parseInt(product.stock_quantity),
        low_stock_threshold: parseInt(product.low_stock_threshold),
        weight: product.weight ? parseFloat(product.weight) : null,
        length: product.length ? parseFloat(product.length) : null,
        width: product.width ? parseFloat(product.width) : null,
        height: product.height ? parseFloat(product.height) : null,
      }));
      setProducts(processedProducts);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (err) {
      console.error('فشل تحميل البيانات. الرجاء المحاولة لاحقاً:', err);
      let errorMessage = 'حدث خطأ غير متوقع أثناء تحميل البيانات.';
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

  const resetForm = () => {
    setNewProductName('');
    setNewProductSlug('');
    setNewProductDescription('');
    setNewProductShortDescription('');
    setNewProductPrice('');
    setNewProductCompareAtPrice('');
    setNewProductCostPrice('');
    setNewProductStockQuantity('');
    setNewProductLowStockThreshold('');
    setNewProductSKU('');
    setNewProductWeight('');
    setNewProductLength('');
    setNewProductWidth('');
    setNewProductHeight('');
    setNewProductCategoryId('');
    setNewProductBrandId('');
    setNewProductMainImageFile(null);
    setNewProductMainImagePreview(null);
    setNewProductAdditionalImageFiles([]);
    setNewProductAdditionalImagePreviews([]);
    setExistingAdditionalImages([]);
    setRemovedAdditionalImageIds([]);
    setNewProductIsFeatured(false);
    setNewProductStatus('active');
    setMainImageRemoved(false);
    setEditingProduct(null);
    setFormError(null);
    setValidationErrors({});
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = '';
    }
  };

  const handleAddProductClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductSlug(product.slug);
    setNewProductDescription(product.description);
    setNewProductShortDescription(product.short_description || '');
    setNewProductPrice(product.price);
    setNewProductCompareAtPrice(product.compare_at_price || '');
    setNewProductCostPrice(product.cost_price || '');
    setNewProductStockQuantity(product.stock_quantity);
    setNewProductLowStockThreshold(product.low_stock_threshold);
    setNewProductSKU(product.sku || '');
    setNewProductWeight(product.weight || '');
    setNewProductLength(product.length || '');
    setNewProductWidth(product.width || '');
    setNewProductHeight(product.height || '');
    setNewProductCategoryId(product.category_id);
    setNewProductBrandId(product.brand_id || '');
    setNewProductMainImageFile(null);
    setNewProductMainImagePreview(product.main_image_url || null);
    setNewProductAdditionalImageFiles([]);
    setNewProductAdditionalImagePreviews([]);
    setExistingAdditionalImages(product.images || []);
    setRemovedAdditionalImageIds([]);
    setNewProductIsFeatured(product.is_featured);
    setNewProductStatus(product.status);
    setMainImageRemoved(false);
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = '';
    }
    setFormError(null);
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const productData = {
      name: newProductName,
      slug: newProductSlug,
      description: newProductDescription,
      short_description: newProductShortDescription,
      price: parseFloat(newProductPrice),
      compare_at_price: newProductCompareAtPrice ? parseFloat(newProductCompareAtPrice) : null,
      cost_price: newProductCostPrice ? parseFloat(newProductCostPrice) : null,
      stock_quantity: parseInt(newProductStockQuantity),
      low_stock_threshold: parseInt(newProductLowStockThreshold),
      sku: newProductSKU,
      weight: newProductWeight ? parseFloat(newProductWeight) : null,
      length: newProductLength ? parseFloat(newProductLength) : null,
      width: newProductWidth ? parseFloat(newProductWidth) : null,
      height: newProductHeight ? parseFloat(newProductHeight) : null,
      category_id: newProductCategoryId,
      brand_id: newProductBrandId,
      is_featured: newProductIsFeatured,
      status: newProductStatus,
    };

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.product_id,
          productData,
          newProductMainImageFile,
          mainImageRemoved,
          newProductAdditionalImageFiles,
          removedAdditionalImageIds
        );
        alert('تم تحديث المنتج بنجاح!');
      } else {
        await createProduct(productData, newProductMainImageFile, newProductAdditionalImageFiles);
        alert('تم إضافة المنتج بنجاح!');
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('خطأ في العملية:', err);
      if (err && typeof err === 'object' && err.errors) {
        setValidationErrors(err.errors);
        setFormError(err.message || 'الرجاء التحقق من الحقول المدخلة.');
      } else {
        setFormError(err || 'حدث خطأ غير متوقع.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
        alert('تم حذف المنتج بنجاح!');
        fetchData();
      } catch (err) {
        console.error('خطأ في حذف المنتج:', err);
        alert('فشل حذف المنتج: ' + (err.message || JSON.stringify(err)));
      }
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProductMainImageFile(file);
      setNewProductMainImagePreview(URL.createObjectURL(file));
      setMainImageRemoved(false);
    } else {
      setNewProductMainImageFile(null);
      setNewProductMainImagePreview(null);
    }
  };

  const handleRemoveMainImage = () => {
    setNewProductMainImageFile(null);
    setNewProductMainImagePreview(null);
    setMainImageRemoved(true);
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewProductAdditionalImageFiles((prevFiles) => [...prevFiles, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewProductAdditionalImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveNewAdditionalImage = (indexToRemove) => {
    setNewProductAdditionalImageFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setNewProductAdditionalImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleRemoveExistingAdditionalImage = (imageId) => {
    setRemovedAdditionalImageIds((prevIds) => [...prevIds, imageId]);
    setExistingAdditionalImages((prevImages) =>
      prevImages.filter((img) => img.image_id !== imageId)
    );
  };

  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل المنتجات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل المنتجات...</p>
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
      <h1 className="mb-4 fw-bold text-info">إدارة المنتجات</h1>

      <button className="btn btn-primary mb-4" onClick={handleAddProductClick}>
        <i className="bi bi-plus-circle me-2"></i> إضافة منتج جديد
      </button>

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-header bg-primary text-white fw-bold py-3">
          المنتجات الحالية
        </div>
        <div className="card-body p-0">
          {products.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">لا توجد منتجات حتى الآن.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>الاسم</th>
                    <th>الفئة</th>
                    <th>المخزون/الحد</th>
                    <th>السعر</th>
                    <th>الحالة</th>
                    <th>مميز؟</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td>
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="img-thumbnail"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; }}
                          />
                        ) : (
                          <span className="text-muted small">لا توجد صورة</span>
                        )}
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold">{product.name}</h6>
                        <span className="badge bg-light text-dark">{product.slug}</span>
                      </td>
                      <td>{product.category ? product.category.name : 'غير محدد'}</td>
                      <td className={product.stock_quantity <= product.low_stock_threshold ? 'text-danger fw-bold' : ''}>
                        {product.stock_quantity}/{product.low_stock_threshold}
                        {product.stock_quantity <= product.low_stock_threshold && (
                          <span className="badge bg-danger text-white ms-2">مخزون منخفض!</span>
                        )}
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.status === 'active' ? 'bg-success' : product.status === 'draft' ? 'bg-secondary' : 'bg-danger'}`}>
                          {product.status === 'active' ? 'نشط' : product.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                        </span>
                      </td>
                      <td>
                        {product.is_featured ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : (
                          <i className="bi bi-x-circle-fill text-danger"></i>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => handleEditClick(product)}>
                          <i className="bi bi-pencil-square"></i> تعديل
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.product_id)}>
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

      {/* Modal لإضافة/تعديل المنتجات */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : '' }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-info text-white py-3">
              <h5 className="modal-title fw-bold">{editingProduct ? 'تعديل منتج موجود' : 'إضافة منتج جديد'}</h5>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="productName" className="form-label">اسم المنتج:</label>
                    <input
                      type="text"
                      id="productName"
                      className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                      value={newProductName}
                      onChange={handleNameChange}
                      required
                    />
                    {validationErrors.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="productSlug" className="form-label">الرابط النظيف (Slug):</label>
                    <input
                      type="text"
                      id="productSlug"
                      className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                      value={newProductSlug}
                      onChange={(e) => setNewProductSlug(e.target.value)}
                      required
                    />
                    {validationErrors.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="productDescription" className="form-label">الوصف التفصيلي:</label>
                  <textarea
                    id="productDescription"
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    rows="4"
                  ></textarea>
                  {validationErrors.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="productShortDescription" className="form-label">وصف موجز:</label>
                  <input
                    type="text"
                    id="productShortDescription"
                    className={`form-control ${validationErrors.short_description ? 'is-invalid' : ''}`}
                    value={newProductShortDescription}
                    onChange={(e) => setNewProductShortDescription(e.target.value)}
                  />
                  {validationErrors.short_description && <div className="invalid-feedback">{validationErrors.short_description[0]}</div>}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label htmlFor="productPrice" className="form-label">السعر:</label>
                    <input
                      type="number"
                      id="productPrice"
                      className={`form-control ${validationErrors.price ? 'is-invalid' : ''}`}
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      step="0.01"
                      required
                    />
                    {validationErrors.price && <div className="invalid-feedback">{validationErrors.price[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productCompareAtPrice" className="form-label">سعر المقارنة (اختياري):</label>
                    <input
                      type="number"
                      id="productCompareAtPrice"
                      className={`form-control ${validationErrors.compare_at_price ? 'is-invalid' : ''}`}
                      value={newProductCompareAtPrice}
                      onChange={(e) => setNewProductCompareAtPrice(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.compare_at_price && <div className="invalid-feedback">{validationErrors.compare_at_price[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productCostPrice" className="form-label">سعر التكلفة (اختياري):</label>
                    <input
                      type="number"
                      id="productCostPrice"
                      className={`form-control ${validationErrors.cost_price ? 'is-invalid' : ''}`}
                      value={newProductCostPrice}
                      onChange={(e) => setNewProductCostPrice(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.cost_price && <div className="invalid-feedback">{validationErrors.cost_price[0]}</div>}
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label htmlFor="productStockQuantity" className="form-label">الكمية المتوفرة:</label>
                    <input
                      type="number"
                      id="productStockQuantity"
                      className={`form-control ${validationErrors.stock_quantity ? 'is-invalid' : ''}`}
                      value={newProductStockQuantity}
                      onChange={(e) => setNewProductStockQuantity(e.target.value)}
                      required
                    />
                    {validationErrors.stock_quantity && <div className="invalid-feedback">{validationErrors.stock_quantity[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productLowStockThreshold" className="form-label">حد المخزون المنخفض:</label>
                    <input
                      type="number"
                      id="productLowStockThreshold"
                      className={`form-control ${validationErrors.low_stock_threshold ? 'is-invalid' : ''}`}
                      value={newProductLowStockThreshold}
                      onChange={(e) => setNewProductLowStockThreshold(e.target.value)}
                      required
                    />
                    {validationErrors.low_stock_threshold && <div className="invalid-feedback">{validationErrors.low_stock_threshold[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productSKU" className="form-label">رمز تعريف المنتج (SKU):</label>
                    <input
                      type="text"
                      id="productSKU"
                      className={`form-control ${validationErrors.sku ? 'is-invalid' : ''}`}
                      value={newProductSKU}
                      onChange={(e) => setNewProductSKU(e.target.value)}
                    />
                    {validationErrors.sku && <div className="invalid-feedback">{validationErrors.sku[0]}</div>}
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label htmlFor="productWeight" className="form-label">الوزن (كجم):</label>
                    <input
                      type="number"
                      id="productWeight"
                      className={`form-control ${validationErrors.weight ? 'is-invalid' : ''}`}
                      value={newProductWeight}
                      onChange={(e) => setNewProductWeight(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.weight && <div className="invalid-feedback">{validationErrors.weight[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productLength" className="form-label">الطول (سم):</label>
                    <input
                      type="number"
                      id="productLength"
                      className={`form-control ${validationErrors.length ? 'is-invalid' : ''}`}
                      value={newProductLength}
                      onChange={(e) => setNewProductLength(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.length && <div className="invalid-feedback">{validationErrors.length[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productWidth" className="form-label">العرض (سم):</label>
                    <input
                      type="number"
                      id="productWidth"
                      className={`form-control ${validationErrors.width ? 'is-invalid' : ''}`}
                      value={newProductWidth}
                      onChange={(e) => setNewProductWidth(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.width && <div className="invalid-feedback">{validationErrors.width[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="productHeight" className="form-label">الارتفاع (سم):</label>
                    <input
                      type="number"
                      id="productHeight"
                      className={`form-control ${validationErrors.height ? 'is-invalid' : ''}`}
                      value={newProductHeight}
                      onChange={(e) => setNewProductHeight(e.target.value)}
                      step="0.01"
                    />
                    {validationErrors.height && <div className="invalid-feedback">{validationErrors.height[0]}</div>}
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="productCategory" className="form-label">الفئة:</label>
                    <select
                      id="productCategory"
                      className={`form-select ${validationErrors.category_id ? 'is-invalid' : ''}`}
                      value={newProductCategoryId}
                      onChange={(e) => setNewProductCategoryId(e.target.value)}
                      required
                    >
                      <option value="">اختر فئة...</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category_id && <div className="invalid-feedback">{validationErrors.category_id[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="productBrand" className="form-label">العلامة التجارية:</label>
                    <select
                      id="productBrand"
                      className={`form-select ${validationErrors.brand_id ? 'is-invalid' : ''}`}
                      value={newProductBrandId}
                      onChange={(e) => setNewProductBrandId(e.target.value)}
                      required
                    >
                      <option value="">اختر علامة تجارية...</option>
                      {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.brand_id && <div className="invalid-feedback">{validationErrors.brand_id[0]}</div>}
                  </div>
                </div>

                {/* قسم إدارة الصور */}
                <hr className="my-4" />
                <h5 className="mb-3 fw-bold text-secondary">إدارة الصور</h5>

                {/* حقل رفع الصورة الرئيسية ومعاينة */}
                <div className="mb-3">
                  <label htmlFor="productMainImageFile" className="form-label">الصورة الرئيسية للمنتج:</label>
                  <input
                    type="file"
                    id="productMainImageFile"
                    className={`form-control ${validationErrors.main_image ? 'is-invalid' : ''}`}
                    onChange={handleMainImageChange}
                    ref={mainFileInputRef}
                    accept="image/*"
                  />
                  {validationErrors.main_image && <div className="invalid-feedback">{validationErrors.main_image[0]}</div>}
                  {(newProductMainImagePreview || (editingProduct && editingProduct.main_image_url && !mainImageRemoved)) && (
                    <div className="mt-2 text-center border p-2 rounded bg-light">
                      <img
                        src={newProductMainImagePreview || (editingProduct && editingProduct.main_image_url)}
                        alt="معاينة الصورة الرئيسية"
                        className="img-thumbnail"
                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150/cccccc/333333?text=خطأ"; }}
                      />
                      <p className="small text-muted mt-1">معاينة الصورة الرئيسية</p>
                      {(newProductMainImagePreview || (editingProduct && editingProduct.main_image_url)) && (
                          <button type="button" className="btn btn-sm btn-outline-danger mt-1" onClick={handleRemoveMainImage}>
                              إزالة الصورة
                          </button>
                      )}
                    </div>
                  )}
                </div>

                {/* حقل رفع الصور الإضافية ومعاينتها */}
                <div className="mb-3">
                  <label htmlFor="productAdditionalImages" className="form-label">صور إضافية للمنتج:</label>
                  <input
                    type="file"
                    id="productAdditionalImages"
                    className={`form-control ${validationErrors.additional_images ? 'is-invalid' : ''}`}
                    onChange={handleAdditionalImagesChange}
                    ref={additionalFileInputRef}
                    accept="image/*"
                    multiple // للسماح باختيار ملفات متعددة
                  />
                  {validationErrors.additional_images && <div className="invalid-feedback">{validationErrors.additional_images[0]}</div>}
                  {validationErrors['additional_images.0'] && <div className="invalid-feedback">{validationErrors['additional_images.0']}</div>}

                  {/* معاينة الصور الإضافية الجديدة */}
                  {newProductAdditionalImagePreviews.length > 0 && (
                    <div className="mt-2 border p-2 rounded bg-light">
                      <p className="small text-muted mb-2">صور إضافية جديدة:</p>
                      <div className="d-flex flex-wrap gap-2">
                        {newProductAdditionalImagePreviews.map((previewUrl, index) => (
                          <div key={index} className="position-relative">
                            <img
                              src={previewUrl}
                              alt={`صورة إضافية ${index + 1}`}
                              className="img-thumbnail"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle-x"
                              style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0', fontSize: '0.75rem', lineHeight: '1' }}
                              onClick={() => handleRemoveNewAdditionalImage(index)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* معاينة الصور الإضافية الموجودة (عند التعديل) */}
                  {existingAdditionalImages.length > 0 && (
                    <div className="mt-2 border p-2 rounded bg-light">
                      <p className="small text-muted mb-2">صور إضافية حالية:</p>
                      <div className="d-flex flex-wrap gap-2">
                        {existingAdditionalImages.map((image) => (
                          <div key={image.image_id} className="position-relative">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || `صورة المنتج ${image.image_id}`}
                              className="img-thumbnail"
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle-x"
                              style={{ borderRadius: '50%', width: '24px', height: '24px', padding: '0', fontSize: '0.75rem', lineHeight: '1' }}
                              onClick={() => handleRemoveExistingAdditionalImage(image.image_id)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* حقل هل المنتج مميز؟ */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="productIsFeatured"
                    checked={newProductIsFeatured}
                    onChange={(e) => setNewProductIsFeatured(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="productIsFeatured">
                    هل المنتج مميز؟ (يظهر في الصفحة الرئيسية)
                  </label>
                </div>

                {/* حقل الحالة (Status) */}
                <div className="mb-3">
                  <label htmlFor="productStatus" className="form-label">الحالة:</label>
                  <select
                    id="productStatus"
                    className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                    value={newProductStatus}
                    onChange={(e) => setNewProductStatus(e.target.value)}
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                  {validationErrors.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                </div>

                {formError && <div className="alert alert-danger">{formError}</div>}
                <button type="submit" className="btn btn-info text-white me-2">
                  {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
                {editingProduct && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    إلغاء التعديل
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement ;