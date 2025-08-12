// src/pages/Admin/ProductManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getBrands } from '../../api/brands';
import { FaPlusCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

const ProductManagement = () => {
  // === Data ===
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // === UI state ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // === Form state ===
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [sku, setSku] = useState('');                  // ✅ SKU إلزامي
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('active');

  // Images
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [removedAdditionalImageIds, setRemovedAdditionalImageIds] = useState([]);
  const [mainImageRemoved, setMainImageRemoved] = useState(false);

  // Errors
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Refs
  const mainFileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);

  // === Helpers ===
  const generateSlug = (val) =>
    val.toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    if (!editingProduct) setSlug(generateSlug(v));
  };

  const resetForm = () => {
    setName(''); setSlug(''); setDescription(''); setShortDescription('');
    setPrice(''); setCompareAtPrice(''); setCostPrice('');
    setStockQuantity(''); setLowStockThreshold('');
    setSku(''); setWeight(''); setLength(''); setWidth(''); setHeight('');
    setCategoryId(''); setBrandId('');
    setIsFeatured(false); setStatus('active');

    setMainImageFile(null); setMainImagePreview(null);
    setAdditionalImageFiles([]); setAdditionalImagePreviews([]);
    setExistingAdditionalImages([]); setRemovedAdditionalImageIds([]);
    setMainImageRemoved(false);

    setEditingProduct(null);
    setFormError(null);
    setValidationErrors({});

    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug || '');
    setDescription(p.description || '');
    setShortDescription(p.short_description || '');
    setPrice(p.price);
    setCompareAtPrice(p.compare_at_price || '');
    setCostPrice(p.cost_price || '');
    setStockQuantity(p.stock_quantity);
    setLowStockThreshold(p.low_stock_threshold);
    setSku(p.sku || '');               // ✅ تحميل SKU
    setWeight(p.weight || '');
    setLength(p.length || '');
    setWidth(p.width || '');
    setHeight(p.height || '');
    setCategoryId(p.category_id);
    setBrandId(p.brand_id || '');
    setIsFeatured(!!p.is_featured);
    setStatus(p.status);

    setMainImageFile(null);
    setMainImagePreview(p.main_image_url || null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setExistingAdditionalImages(p.images || []);
    setRemovedAdditionalImageIds([]);
    setMainImageRemoved(false);

    setFormError(null); setValidationErrors({});
    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';

    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); resetForm(); };

  // === Fetch ===
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const productsRes = await getProducts();
      const processed = (productsRes?.data || []).map(p => ({
        ...p,
        price: parseFloat(p.price),
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
        cost_price: p.cost_price ? parseFloat(p.cost_price) : null,
        stock_quantity: parseInt(p.stock_quantity),
        low_stock_threshold: parseInt(p.low_stock_threshold),
        weight: p.weight ? parseFloat(p.weight) : null,
        length: p.length ? parseFloat(p.length) : null,
        width: p.width ? parseFloat(p.width) : null,
        height: p.height ? parseFloat(p.height) : null,
      }));
      setProducts(processed);

      const cats = await getCategories();
      setCategories(cats || []);

      const brs = await getBrands();
      setBrands(brs || []);
    } catch (err) {
      console.error('فشل تحميل البيانات:', err);
      let msg = 'حدث خطأ أثناء تحميل البيانات.';
      if (err?.message) msg = err.message;
      if (err?.errors) msg = Object.values(err.errors).flat().join(' ');
      else if (err?.error) msg = err.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // === Image handlers ===
  const onMainImageChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setMainImageFile(f);
      setMainImagePreview(URL.createObjectURL(f));
      setMainImageRemoved(false);
    } else {
      setMainImageFile(null);
      setMainImagePreview(null);
    }
  };
  const removeMainImage = () => {
    setMainImageFile(null); setMainImagePreview(null);
    setMainImageRemoved(true);
    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
  };
  const onAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImageFiles(prev => [...prev, ...files]);
    setAdditionalImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeNewAdditionalImage = (idx) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== idx));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };
  const removeExistingAdditionalImage = (imageId) => {
    setRemovedAdditionalImageIds(prev => [...prev, imageId]);
    setExistingAdditionalImages(prev => prev.filter(img => img.image_id !== imageId));
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null); setValidationErrors({});

    const payload = {
      name,
      slug,
      description,
      short_description: shortDescription,
      price: price ? parseFloat(price) : null,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      cost_price: costPrice ? parseFloat(costPrice) : null,
      stock_quantity: stockQuantity ? parseInt(stockQuantity) : 0,
      low_stock_threshold: lowStockThreshold ? parseInt(lowStockThreshold) : 0,
      sku, // ✅ إرسال SKU
      weight: weight ? parseFloat(weight) : null,
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      category_id: categoryId,
      brand_id: brandId,
      is_featured: !!isFeatured,
      status,
    };

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.product_id,
          payload,
          mainImageFile,
          mainImageRemoved,
          additionalImageFiles,
          removedAdditionalImageIds
        );
        alert('تم تحديث المنتج بنجاح!');
      } else {
        await createProduct(payload, mainImageFile, additionalImageFiles);
        alert('تم إضافة المنتج بنجاح!');
      }
      closeModal();
      fetchAll();
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

  // === Delete ===
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) return;
    try {
      await deleteProduct(id);
      alert('تم حذف المنتج بنجاح!');
      fetchAll();
    } catch (err) {
      console.error('خطأ في حذف المنتج:', err);
      alert('فشل حذف المنتج: ' + (err?.message || JSON.stringify(err)));
    }
  };

  // === UI ===
  if (loading) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">جاري تحميل المنتجات...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container-fluid text-center my-5">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <h1 className="fw-bold m-0">إدارة المنتجات</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FaPlusCircle className="ms-2" /> إضافة منتج جديد
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white text-center fw-bold">
          المنتجات الحالية
        </div>
        <div className="card-body p-0">
          {products.length === 0 ? (
            <p className="text-center text-muted py-4 m-0">لا توجد منتجات حتى الآن.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover align-middle m-0">
                    <thead className="table-light">
                      <tr>
                        <th>الصورة</th>
                        <th>الاسم</th>
                        <th>SKU</th>
                        <th>الفئة</th>
                        <th>المخزون/الحد</th>
                        <th>السعر</th>
                        <th>الحالة</th>
                        <th>مميز؟</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.product_id}>
                          <td style={{ width: 64 }}>
                            {p.main_image_url ? (
                              <img
                                src={p.main_image_url}
                                alt={p.name}
                                className="img-thumbnail"
                                style={{ width: 50, height: 50, objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/50x50?text=%F0%9F%93%B7'; }}
                              />
                            ) : <span className="text-muted small">لا صورة</span>}
                          </td>
                          <td>
                            <div className="fw-semibold">{p.name}</div>
                            <div className="small text-muted">{p.slug}</div>
                          </td>
                          <td><span className="badge text-bg-secondary">{p.sku || '-'}</span></td>
                          <td className="small text-muted">{p.category ? p.category.name : 'غير محدد'}</td>
                          <td className={p.stock_quantity <= p.low_stock_threshold ? 'text-danger fw-bold' : ''}>
                            {p.stock_quantity}/{p.low_stock_threshold}
                          </td>
                          <td className="fw-bold">${Number(p.price).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${p.status === 'active' ? 'text-bg-success' : p.status === 'draft' ? 'text-bg-secondary' : 'text-bg-danger'}`}>
                              {p.status === 'active' ? 'نشط' : p.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                            </span>
                          </td>
                          <td>{p.is_featured ? <i className="bi bi-check-circle-fill text-success" /> : <i className="bi bi-x-circle-fill text-danger" />}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(p)}>
                                <FaPencilAlt /> تعديل
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.product_id)}>
                                <FaTrashAlt /> حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="d-lg-none p-3">
                {products.map(p => (
                  <div key={p.product_id} className="card mb-3 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-start gap-3">
                        {p.main_image_url ? (
                          <img
                            src={p.main_image_url}
                            alt={p.name}
                            className="rounded"
                            style={{ width: 80, height: 80, objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80?text=%F0%9F%93%B7'; }}
                          />
                        ) : (
                          <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                            <span className="small text-muted">لا صورة</span>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="fw-bold m-0">{p.name}</h6>
                            <span className="badge text-bg-secondary">{p.sku || '-'}</span>
                          </div>
                          <div className="small text-muted mt-1">{p.category ? p.category.name : 'غير محدد'}</div>
                          <div className="mt-2 d-flex align-items-center justify-content-between">
                            <span className={`badge ${p.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                              {p.status === 'active' ? 'نشط' : 'مسودة/مؤرشف'}
                            </span>
                            <span className={`badge ${p.stock_quantity <= p.low_stock_threshold ? 'text-bg-danger' : 'text-bg-light text-dark'}`}>
                              مخزون: {p.stock_quantity}/{p.low_stock_threshold}
                            </span>
                          </div>
                          <div className="mt-2 fw-bold">${Number(p.price).toFixed(2)}</div>
                          <div className="mt-3 d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary w-50" onClick={() => openEditModal(p)}>
                              <FaPencilAlt /> تعديل
                            </button>
                            <button className="btn btn-sm btn-outline-danger w-50" onClick={() => handleDelete(p.product_id)}>
                              <FaTrashAlt /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal (add/edit) */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" aria-modal="true">
        {showModal && <div className="modal-backdrop fade show" />}
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeModal} />
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Basic info */}
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">اسم المنتج</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors?.name ? 'is-invalid' : ''}`}
                      value={name}
                      onChange={handleNameChange}
                      required
                    />
                    {validationErrors?.name && <div className="invalid-feedback">{validationErrors.name[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">الرابط (Slug)</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors?.slug ? 'is-invalid' : ''}`}
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                    {validationErrors?.slug && <div className="invalid-feedback">{validationErrors.slug[0]}</div>}
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">الوصف التفصيلي</label>
                    <textarea
                      rows="3"
                      className={`form-control ${validationErrors?.description ? 'is-invalid' : ''}`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {validationErrors?.description && <div className="invalid-feedback">{validationErrors.description[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">وصف موجز</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors?.short_description ? 'is-invalid' : ''}`}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    />
                    {validationErrors?.short_description && <div className="invalid-feedback">{validationErrors.short_description[0]}</div>}
                  </div>
                </div>

                <hr className="my-3" />

                {/* Pricing & stock */}
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <label className="form-label">السعر</label>
                    <input
                      type="number" step="0.01"
                      className={`form-control ${validationErrors?.price ? 'is-invalid' : ''}`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                    {validationErrors?.price && <div className="invalid-feedback">{validationErrors.price[0]}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">سعر المقارنة</label>
                    <input
                      type="number" step="0.01"
                      className={`form-control ${validationErrors?.compare_at_price ? 'is-invalid' : ''}`}
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                    />
                    {validationErrors?.compare_at_price && <div className="invalid-feedback">{validationErrors.compare_at_price[0]}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">سعر التكلفة</label>
                    <input
                      type="number" step="0.01"
                      className="form-control"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">SKU (رمز المنتج) <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors?.sku ? 'is-invalid' : ''}`}
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                    />
                    {validationErrors?.sku && <div className="invalid-feedback">{validationErrors.sku[0]}</div>}
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label">الكمية المتوفرة</label>
                    <input
                      type="number"
                      className={`form-control ${validationErrors?.stock_quantity ? 'is-invalid' : ''}`}
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      required
                    />
                    {validationErrors?.stock_quantity && <div className="invalid-feedback">{validationErrors.stock_quantity[0]}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">حد المخزون المنخفض</label>
                    <input
                      type="number"
                      className={`form-control ${validationErrors?.low_stock_threshold ? 'is-invalid' : ''}`}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      required
                    />
                    {validationErrors?.low_stock_threshold && <div className="invalid-feedback">{validationErrors.low_stock_threshold[0]}</div>}
                  </div>
                </div>

                <hr className="my-3" />

                {/* Attributes */}
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <label className="form-label">الوزن</label>
                    <input type="number" step="0.01" className="form-control" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">الطول</label>
                    <input type="number" step="0.01" className="form-control" value={length} onChange={(e) => setLength(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">العرض</label>
                    <input type="number" step="0.01" className="form-control" value={width} onChange={(e) => setWidth(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">الارتفاع</label>
                    <input type="number" step="0.01" className="form-control" value={height} onChange={(e) => setHeight(e.target.value)} />
                  </div>
                </div>

                <hr className="my-3" />

                {/* Category/Brand */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">الفئة</label>
                    <select
                      className={`form-select ${validationErrors?.category_id ? 'is-invalid' : ''}`}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">اختر فئة...</option>
                      {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>{c.name}</option>
                      ))}
                    </select>
                    {validationErrors?.category_id && <div className="invalid-feedback">{validationErrors.category_id[0]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">العلامة التجارية</label>
                    <select
                      className={`form-select ${validationErrors?.brand_id ? 'is-invalid' : ''}`}
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      required
                    >
                      <option value="">اختر علامة تجارية...</option>
                      {brands.map(b => (
                        <option key={b.brand_id} value={b.brand_id}>{b.name}</option>
                      ))}
                    </select>
                    {validationErrors?.brand_id && <div className="invalid-feedback">{validationErrors.brand_id[0]}</div>}
                  </div>
                </div>

                <hr className="my-3" />

                {/* Images */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">الصورة الرئيسية</label>
                    <input
                      type="file"
                      ref={mainFileInputRef}
                      className={`form-control ${validationErrors?.main_image ? 'is-invalid' : ''}`}
                      accept="image/*"
                      onChange={onMainImageChange}
                    />
                    {validationErrors?.main_image && <div className="invalid-feedback">{validationErrors.main_image[0]}</div>}

                    {(mainImagePreview || (editingProduct && editingProduct.main_image_url && !mainImageRemoved)) && (
                      <div className="mt-2 text-center p-2 border rounded">
                        <img
                          src={mainImagePreview || editingProduct?.main_image_url}
                          alt="preview"
                          className="img-thumbnail"
                          style={{ maxWidth: 160, maxHeight: 160, objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/160x160?text=%F0%9F%93%B7'; }}
                        />
                        <div className="mt-2">
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeMainImage}>
                            إزالة الصورة
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">صور إضافية</label>
                    <input
                      type="file"
                      ref={additionalFileInputRef}
                      className={`form-control ${validationErrors?.additional_images ? 'is-invalid' : ''}`}
                      accept="image/*"
                      multiple
                      onChange={onAdditionalImagesChange}
                    />
                    {validationErrors?.additional_images && <div className="invalid-feedback">{validationErrors.additional_images[0]}</div>}
                    {validationErrors?.['additional_images.0'] && <div className="invalid-feedback">{validationErrors['additional_images.0']}</div>}

                    {(additionalImagePreviews.length > 0 || existingAdditionalImages.length > 0) && (
                      <div className="mt-2 p-2 border rounded">
                        {additionalImagePreviews.length > 0 && (
                          <>
                            <p className="small text-muted mb-2">صور جديدة:</p>
                            <div className="d-flex flex-wrap gap-2">
                              {additionalImagePreviews.map((url, idx) => (
                                <div key={idx} className="position-relative">
                                  <img
                                    src={url}
                                    alt={`new-${idx}`}
                                    className="img-thumbnail"
                                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                    style={{ borderRadius: '50%', width: 20, height: 20, padding: 0 }}
                                    onClick={() => removeNewAdditionalImage(idx)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {existingAdditionalImages.length > 0 && (
                          <>
                            <p className="small text-muted mt-2 mb-2">صور حالية:</p>
                            <div className="d-flex flex-wrap gap-2">
                              {existingAdditionalImages.map(img => (
                                <div key={img.image_id} className="position-relative">
                                  <img
                                    src={img.image_url}
                                    alt={img.alt_text || `img-${img.image_id}`}
                                    className="img-thumbnail"
                                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80?text=%F0%9F%93%B7'; }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                    style={{ borderRadius: '50%', width: 20, height: 20, padding: 0 }}
                                    onClick={() => removeExistingAdditionalImage(img.image_id)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-3" />

                {/* Flags */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                      <label className="form-check-label" htmlFor="isFeatured">منتج مميز؟</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">الحالة</label>
                    <select className={`form-select ${validationErrors?.status ? 'is-invalid' : ''}`} value={status} onChange={(e) => setStatus(e.target.value)} required>
                      <option value="active">نشط</option>
                      <option value="draft">مسودة</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                    {validationErrors?.status && <div className="invalid-feedback">{validationErrors.status[0]}</div>}
                  </div>
                </div>

                {formError && <div className="alert alert-danger mt-3 small">{String(formError)}</div>}

                <div className="d-flex justify-content-between mt-4">
                  <button type="submit" className="btn btn-primary">{editingProduct ? 'تحديث' : 'إضافة'}</button>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>إغلاق</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Modal */}
    </div>
  );
};

export default ProductManagement;
