// ===== src/components/header/CartIcon.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';
import { BiShoppingBag } from 'react-icons/bi';

const CartIcon = ({ count = 0 }) => {
  // تقييد العدد بين 0 و 999
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const safeCount = clamp(Number(count) || 0, 0, 999);

  return (
    <Link to="/cart" className="cart-icon" aria-label="السلة">
      <BiShoppingBag size={26} />
      {safeCount > 0 && (
        <span className="cart-badge">
          {safeCount > 99 ? "99+" : safeCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
