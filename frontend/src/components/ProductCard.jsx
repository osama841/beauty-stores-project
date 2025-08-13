// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // ← السياق
 // لو عندك ستايل للبطاقة

export default function ProductCard({ product }) {
  const { add } = useCart();

  const onAdd = () => {
    // كمية افتراضية = 1 (لو عندك اختيار كمية داخل البطاقة، مرّرها هنا)
    add(product.product_id ?? product.id, 1);
  };

  return (
    <div className="product-card card h-100 shadow-sm">
      <Link 
        to={`/products/${product.product_id ?? product.id}`} 
        className="text-decoration-none"
        aria-label={`عرض تفاصيل المنتج ${product.name}`}
      >
        <img
          src={product.main_image_url || product.image_url || 'https://placehold.co/400x300?text=No+Image'}
          alt={`صورة المنتج ${product.name}`}
          className="card-img-top"
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image'; }}
        />
      </Link>

      <div className="card-body d-flex flex-column">
        <Link 
          to={`/products/${product.product_id ?? product.id}`} 
          className="text-decoration-none text-dark"
          aria-label={`عرض تفاصيل المنتج ${product.name}`}
        >
          <h5 className="card-title fw-bold mb-2">{product.name}</h5>
        </Link>

        <div className="mb-3">
          <span className="text-primary fw-bold">${Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && (
            <small className="text-muted ms-2">
              <del>${Number(product.compare_at_price).toFixed(2)}</del>
            </small>
          )}
        </div>

        <div className="mt-auto d-flex gap-2">
          <Link 
            to={`/products/${product.product_id ?? product.id}`} 
            className="btn btn-outline-secondary w-50"
            aria-label={`عرض تفاصيل المنتج ${product.name}`}
          >
            التفاصيل
          </Link>
          <button
            type="button"
            className="btn btn-primary w-50"
            onClick={onAdd}
            disabled={Number(product.stock_quantity) === 0}
            aria-label={Number(product.stock_quantity) === 0 ? `نفد مخزون ${product.name}` : `أضف ${product.name} للسلة`}
          >
            {Number(product.stock_quantity) === 0 ? 'نفد المخزون' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}