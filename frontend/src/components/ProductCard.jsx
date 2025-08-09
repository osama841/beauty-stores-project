// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 product-card">
      <Link to={`/products/${product.product_id}`} className="text-decoration-none text-dark">
        <img
          src={product.main_image_url || 'https://placehold.co/300x200/ADD8E6/000000?text=صورة+المنتج'}
          alt={product.name}
          className="card-img-top p-3 rounded-top"
          loading="lazy" // ****** إضافة Lazy Loading ******
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=خطأ"; }}
        />
        <div className="card-body text-center">
          <h5 className="card-title fw-bold mb-2">{product.name}</h5>
          <p className="card-text text-primary fs-5 fw-bold mb-3">${product.price ? product.price.toFixed(2) : '0.00'}</p>
          {product.compare_at_price && (
            <p className="card-text text-muted small">
              <del>${product.compare_at_price.toFixed(2)}</del>
              <span className="ms-2 text-success fw-bold">وفر ${(product.compare_at_price - product.price).toFixed(2)}</span>
            </p>
          )}
        </div>
      </Link>
      <div className="card-footer bg-transparent border-top-0 text-center">
        <button className="btn btn-primary w-100 fw-bold" disabled={product.stock_quantity === 0}>
          {product.stock_quantity > 0 ? 'أضف إلى السلة' : 'نفد المخزون'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
