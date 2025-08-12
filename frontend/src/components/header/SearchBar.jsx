// ===== src/components/header/SearchBar.jsx =====
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';

const SearchBar = ({ isOpen, onToggle, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // إرسال البحث والانتقال لصفحة المنتجات
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    
    onClose();
    if (location.pathname.startsWith('/products')) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      {/* زر فتح البحث */}
      <button
        id="searchToggleButton"
        className="icon-btn search-toggle"
        aria-label="فتح البحث"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="searchPanel"
      >
        <BiSearch size={24} />
      </button>

      {/* لوحة البحث */}
      <div
        id="searchPanel"
        className={`search-panel ${isOpen ? 'open' : ''}`}
        role="search"
      >
        <div className="container-lg px-3">
          <form className="search-form" onSubmit={handleSubmit} role="search">
            <input
              type="search"
              className="search-input"
              placeholder="ابحث عن منتج..."
              aria-label="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isOpen}
            />
            <button type="submit" className="search-submit">
              بحث
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
