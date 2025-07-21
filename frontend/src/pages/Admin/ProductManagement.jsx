import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';

const ProductManagement = () => {
  // States for data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    stockQuantity: '',
    sku: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    categoryId: '',
    brandId: '',
    isFeatured: false,
    status: 'active'
  });

  // Image states
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [removedAdditionalImageIds, setRemovedAdditionalImageIds] = useState([]);
  const [mainImageRemoved, setMainImageRemoved] = useState(false);

  // UI states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Refs
  const mainFileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);

  // Helper functions
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  // Data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands()
      ]);

      setProducts(productsRes.data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
        stock_quantity: parseInt(product.stock_quantity),
        weight: product.weight ? parseFloat(product.weight) : null,
        length: product.length ? parseFloat(product.length) : null,
        width: product.width ? parseFloat(product.width) : null,
        height: product.height ? parseFloat(product.height) : null,
      })));

      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form handling
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: '',
      compareAtPrice: '',
      costPrice: '',
      stockQuantity: '',
      sku: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      categoryId: '',
      brandId: '',
      isFeatured: false,
      status: 'active'
    });

    setMainImageFile(null);
    setMainImagePreview(null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setExistingAdditionalImages([]);
    setRemovedAdditionalImageIds([]);
    setMainImageRemoved(false);
    setEditingProduct(null);
    setFormError(null);
    setValidationErrors({});

    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
  };

  const handleAddProductClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description || '',
      price: product.price,
      compareAtPrice: product.compare_at_price || '',
      costPrice: product.cost_price || '',
      stockQuantity: product.stock_quantity,
      sku: product.sku || '',
      weight: product.weight || '',
      length: product.length || '',
      width: product.width || '',
      height: product.height || '',
      categoryId: product.category_id,
      brandId: product.brand_id || '',
      isFeatured: product.is_featured,
      status: product.status
    });

    setMainImagePreview(product.main_image_url || null);
    setExistingAdditionalImages(product.images || []);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Image handling
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
      setMainImageRemoved(false);
    }
  };

  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImageRemoved(true);
    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImageFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewAdditionalImage = (index) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAdditionalImage = (imageId) => {
    setRemovedAdditionalImageIds(prev => [...prev, imageId]);
    setExistingAdditionalImages(prev => prev.filter(img => img.image_id !== imageId));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      short_description: formData.shortDescription,
      price: parseFloat(formData.price),
      compare_at_price: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
      cost_price: formData.costPrice ? parseFloat(formData.costPrice) : null,
      stock_quantity: parseInt(formData.stockQuantity),
      sku: formData.sku,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      category_id: formData.categoryId,
      brand_id: formData.brandId,
      is_featured: formData.isFeatured,
      status: formData.status,
    };

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.product_id,
          productData,
          mainImageFile,
          mainImageRemoved,
          additionalImageFiles,
          removedAdditionalImageIds
        );
        alert('تم تحديث المنتج بنجاح!');
      } else {
        await createProduct(productData, mainImageFile, additionalImageFiles);
        alert('تم إضافة المنتج بنجاح!');
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Operation error:', err);
      if (err?.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setFormError(err.message || 'حدث خطأ غير متوقع');
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
        alert('تم حذف المنتج بنجاح!');
        fetchData();
      } catch (err) {
        console.error('Delete error:', err);
        alert('فشل حذف المنتج: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري تحميل البيانات...</span>
        </div>
        <p className="mt-3 text-muted">جاري تحميل البيانات...</p>
      </div>
    );
  }

  // Error state
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

      {/* Products Table */}
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
                    <th>العلامة التجارية</th>
                    <th>السعر</th>
                    <th>الكمية</th>
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
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src="https://placehold.co/50x50/cccccc/333333?text=خطأ"; 
                            }}
                          />
                        ) : (
                          <span className="text-muted small">لا توجد صورة</span>
                        )}
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold">{product.name}</h6>
                        <span className="badge bg-light text-dark">{product.slug}</span>
                      </td>
                      <td>{product.category?.name || 'غير محدد'}</td>
                      <td>{product.brand?.name || 'غير محدد'}</td>
                      <td>${product.price?.toFixed(2) || '0.00'}</td>
                      <td>{product.stock_quantity}</td>
                      <td>
                        <span className={`badge ${
                          product.status === 'active' ? 'bg-success' : 
                          product.status === 'draft' ? 'bg-secondary' : 'bg-danger'
                        }`}>
                          {product.status === 'active' ? 'نشط' : 
                           product.status === 'draft' ? 'مسودة' : 'مؤرشف'}
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
                        <button 
                          className="btn btn-sm btn-info text-white me-2" 
                          onClick={() => handleEditClick(product)}
                        >
                          <i className="bi bi-pencil-square"></i> تعديل
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(product.product_id)}
                        >
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

      {/* Product Form Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
          aria-modal="true" 
          role="dialog"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-info text-white py-3">
                <h5 className="modal-title fw-bold">
                  {editingProduct ? 'تعديل منتج موجود' : 'إضافة منتج جديد'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  aria-label="Close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="productName" className="form-label">اسم المنتج:</label>
                      <input
                        type="text"
                        id="productName"
                        name="name"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">{validationErrors.name[0]}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="productSlug" className="form-label">الرابط النظيف (Slug):</label>
                      <input
                        type="text"
                        id="productSlug"
                        name="slug"
                        className={`form-control ${validationErrors.slug ? 'is-invalid' : ''}`}
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.slug && (
                        <div className="invalid-feedback">{validationErrors.slug[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="mb-3">
                    <label htmlFor="productDescription" className="form-label">الوصف التفصيلي:</label>
                    <textarea
                      id="productDescription"
                      name="description"
                      className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                    ></textarea>
                    {validationErrors.description && (
                      <div className="invalid-feedback">{validationErrors.description[0]}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productShortDescription" className="form-label">وصف موجز:</label>
                    <input
                      type="text"
                      id="productShortDescription"
                      name="shortDescription"
                      className={`form-control ${validationErrors.short_description ? 'is-invalid' : ''}`}
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                    />
                    {validationErrors.short_description && (
                      <div className="invalid-feedback">{validationErrors.short_description[0]}</div>
                    )}
                  </div>

                  {/* Prices */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label htmlFor="productPrice" className="form-label">السعر:</label>
                      <input
                        type="number"
                        id="productPrice"
                        name="price"
                        className={`form-control ${validationErrors.price ? 'is-invalid' : ''}`}
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        required
                      />
                      {validationErrors.price && (
                        <div className="invalid-feedback">{validationErrors.price[0]}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="productCompareAtPrice" className="form-label">سعر المقارنة (اختياري):</label>
                      <input
                        type="number"
                        id="productCompareAtPrice"
                        name="compareAtPrice"
                        className={`form-control ${validationErrors.compare_at_price ? 'is-invalid' : ''}`}
                        value={formData.compareAtPrice}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.compare_at_price && (
                        <div className="invalid-feedback">{validationErrors.compare_at_price[0]}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="productCostPrice" className="form-label">سعر التكلفة (اختياري):</label>
                      <input
                        type="number"
                        id="productCostPrice"
                        name="costPrice"
                        className={`form-control ${validationErrors.cost_price ? 'is-invalid' : ''}`}
                        value={formData.costPrice}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.cost_price && (
                        <div className="invalid-feedback">{validationErrors.cost_price[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label htmlFor="productStockQuantity" className="form-label">الكمية المتوفرة:</label>
                      <input
                        type="number"
                        id="productStockQuantity"
                        name="stockQuantity"
                        className={`form-control ${validationErrors.stock_quantity ? 'is-invalid' : ''}`}
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.stock_quantity && (
                        <div className="invalid-feedback">{validationErrors.stock_quantity[0]}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="productSKU" className="form-label">رمز تعريف المنتج (SKU):</label>
                      <input
                        type="text"
                        id="productSKU"
                        name="sku"
                        className={`form-control ${validationErrors.sku ? 'is-invalid' : ''}`}
                        value={formData.sku}
                        onChange={handleInputChange}
                      />
                      {validationErrors.sku && (
                        <div className="invalid-feedback">{validationErrors.sku[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <label htmlFor="productWeight" className="form-label">الوزن (كجم):</label>
                      <input
                        type="number"
                        id="productWeight"
                        name="weight"
                        className={`form-control ${validationErrors.weight ? 'is-invalid' : ''}`}
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.weight && (
                        <div className="invalid-feedback">{validationErrors.weight[0]}</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="productLength" className="form-label">الطول (سم):</label>
                      <input
                        type="number"
                        id="productLength"
                        name="length"
                        className={`form-control ${validationErrors.length ? 'is-invalid' : ''}`}
                        value={formData.length}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.length && (
                        <div className="invalid-feedback">{validationErrors.length[0]}</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="productWidth" className="form-label">العرض (سم):</label>
                      <input
                        type="number"
                        id="productWidth"
                        name="width"
                        className={`form-control ${validationErrors.width ? 'is-invalid' : ''}`}
                        value={formData.width}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.width && (
                        <div className="invalid-feedback">{validationErrors.width[0]}</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="productHeight" className="form-label">الارتفاع (سم):</label>
                      <input
                        type="number"
                        id="productHeight"
                        name="height"
                        className={`form-control ${validationErrors.height ? 'is-invalid' : ''}`}
                        value={formData.height}
                        onChange={handleInputChange}
                        step="0.01"
                      />
                      {validationErrors.height && (
                        <div className="invalid-feedback">{validationErrors.height[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Categories and Brands */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="productCategory" className="form-label">الفئة:</label>
                      <select
                        id="productCategory"
                        name="categoryId"
                        className={`form-select ${validationErrors.category_id ? 'is-invalid' : ''}`}
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">اختر فئة...</option>
                        {categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.category_id && (
                        <div className="invalid-feedback">{validationErrors.category_id[0]}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="productBrand" className="form-label">العلامة التجارية:</label>
                      <select
                        id="productBrand"
                        name="brandId"
                        className={`form-select ${validationErrors.brand_id ? 'is-invalid' : ''}`}
                        value={formData.brandId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">اختر علامة تجارية...</option>
                        {brands.map((brand) => (
                          <option key={brand.brand_id} value={brand.brand_id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.brand_id && (
                        <div className="invalid-feedback">{validationErrors.brand_id[0]}</div>
                      )}
                    </div>
                  </div>

                  {/* Images Section */}
                  <hr className="my-4" />
                  <h5 className="mb-3 fw-bold text-secondary">إدارة الصور</h5>

                  {/* Main Image */}
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
                    {validationErrors.main_image && (
                      <div className="invalid-feedback">{validationErrors.main_image[0]}</div>
                    )}
                    
                    {(mainImagePreview || (editingProduct?.main_image_url && !mainImageRemoved)) && (
                      <div className="mt-2 text-center border p-2 rounded bg-light">
                        <img
                          src={mainImagePreview || editingProduct.main_image_url}
                          alt="Main preview"
                          className="img-thumbnail"
                          style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src="https://placehold.co/150x150/cccccc/333333?text=خطأ"; 
                          }}
                        />
                        <p className="small text-muted mt-1">معاينة الصورة الرئيسية</p>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger mt-1" 
                          onClick={handleRemoveMainImage}
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className="mb-3">
                    <label htmlFor="productAdditionalImages" className="form-label">صور إضافية للمنتج:</label>
                    <input
                      type="file"
                      id="productAdditionalImages"
                      className={`form-control ${validationErrors.additional_images ? 'is-invalid' : ''}`}
                      onChange={handleAdditionalImagesChange}
                      ref={additionalFileInputRef}
                      accept="image/*"
                      multiple
                    />
                    {validationErrors.additional_images && (
                      <div className="invalid-feedback">{validationErrors.additional_images[0]}</div>
                    )}
                    
                    {/* New additional images preview */}
                    {additionalImagePreviews.length > 0 && (
                      <div className="mt-2 border p-2 rounded bg-light">
                        <p className="small text-muted mb-2">صور إضافية جديدة:</p>
                        <div className="d-flex flex-wrap gap-2">
                          {additionalImagePreviews.map((preview, index) => (
                            <div key={index} className="position-relative">
                              <img
                                src={preview}
                                alt={`Additional ${index + 1}`}
                                className="img-thumbnail"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                onError={(e) => { 
                                  e.target.onerror = null; 
                                  e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; 
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle-x"
                                style={{ 
                                  borderRadius: '50%', 
                                  width: '24px', 
                                  height: '24px', 
                                  padding: '0', 
                                  fontSize: '0.75rem', 
                                  lineHeight: '1' 
                                }}
                                onClick={() => handleRemoveNewAdditionalImage(index)}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Existing additional images preview */}
                    {existingAdditionalImages.length > 0 && (
                      <div className="mt-2 border p-2 rounded bg-light">
                        <p className="small text-muted mb-2">صور إضافية حالية:</p>
                        <div className="d-flex flex-wrap gap-2">
                          {existingAdditionalImages.map((image) => (
                            <div key={image.image_id} className="position-relative">
                              <img
                                src={image.image_url}
                                alt={image.alt_text || `Product image ${image.image_id}`}
                                className="img-thumbnail"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                onError={(e) => { 
                                  e.target.onerror = null; 
                                  e.target.src="https://placehold.co/100x100/cccccc/333333?text=خطأ"; 
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle-x"
                                style={{ 
                                  borderRadius: '50%', 
                                  width: '24px', 
                                  height: '24px', 
                                  padding: '0', 
                                  fontSize: '0.75rem', 
                                  lineHeight: '1' 
                                }}
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

                  {/* Featured and Status */}
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="productIsFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="productIsFeatured">
                      هل المنتج مميز؟ (يظهر في الصفحة الرئيسية)
                    </label>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productStatus" className="form-label">الحالة:</label>
                    <select
                      id="productStatus"
                      name="status"
                      className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">نشط</option>
                      <option value="draft">مسودة</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                    {validationErrors.status && (
                      <div className="invalid-feedback">{validationErrors.status[0]}</div>
                    )}
                  </div>

                  {/* Form actions */}
                  {formError && (
                    <div className="alert alert-danger">{formError}</div>
                  )}
                  
                  <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-info text-white">
                      {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                    </button>
                    
                    {editingProduct && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={resetForm}
                      >
                        إلغاء التعديل
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;