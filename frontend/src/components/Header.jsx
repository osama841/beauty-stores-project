// ===== src/components/Header.jsx (IMPROVED + SEARCH + SIMPLER MOBILE CATEGORIES) =====
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { getCategories } from "../api/categories";
import {
  BiUser,
  BiShoppingBag,
  BiLogOut,
  BiLogIn,
  BiUserPlus,
  BiMenu,
  BiX,
  BiChevronDown,
  BiSearch,
} from "react-icons/bi";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import "./../styles/header.css";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Header = ({ cartCount = 0 }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count } = useCart();
  console.log('Header count >>>', count);
  const safeCount = clamp(Number(count) || 0, 0, 999);
  // Close on ESC and click outside (for mobile drawer & search panel)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    const onClick = (e) => {
      const menu = document.getElementById("mobileMenu");
      const toggle = document.getElementById("menuToggleButton");
      const searchPanel = document.getElementById("searchPanel");
      const searchBtn = document.getElementById("searchToggleButton");

      const clickInsideMenu = menu && menu.contains(e.target);
      const clickOnToggle = toggle && toggle.contains(e.target);
      const clickInsideSearch = searchPanel && searchPanel.contains(e.target);
      const clickOnSearchToggle = searchBtn && searchBtn.contains(e.target);

      if (!clickInsideMenu && !clickOnToggle) setIsMenuOpen(false);
      if (!clickInsideSearch && !clickOnSearchToggle) setIsSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Body scroll lock when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const fetchCategoriesForNav = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("فشل تحميل الفئات لشريط التنقل:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesForNav();
  }, [fetchCategoriesForNav]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await logout();
      navigate("/login");
      toast.success("تم تسجيل الخروج بنجاح!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("فشل تسجيل الخروج. الرجاء المحاولة مرة أخرى.");
    }
  };

  // Build parents/children map (desktop still uses children for mega menu)
  const { parents, childrenMap } = useMemo(() => {
    const parents = [];
    const map = {};
    for (const c of categories) {
      if (!c?.parent_id) parents.push(c);
      else (map[c.parent_id] ||= []).push(c);
    }
    parents.sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "ar")
    );
    Object.values(map).forEach((list) =>
      list.sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""), "ar")
      )
    );
    return { parents, childrenMap: map };
  }, [categories]);

  const childrenOf = (pid) => childrenMap[pid] || [];
  const closeMenu = () => setIsMenuOpen(false);

  // Submit search => navigate to products with query param
  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    if (location.pathname.startsWith("/products")) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="site-header sticky-top" role="banner">
      <div className="container-lg px-3">
        <nav
          className="header-nav"
          role="navigation"
          aria-label="الشريط العلوي"
        >
          <Link className="brand-logo" to="/" onClick={closeMenu}>
            لمسة روز
          </Link>

          {/* ✅ عناصر القائمة الرئيسية (للدسك توب) */}
          <ul className="nav-links d-none d-lg-flex" role="list">
            <li>
              <NavLink to="/" end className="nav-link">
                الرئيسية
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className="nav-link"
              >
                المنتجات
              </NavLink>
          </li>
            <li>
              <NavLink
                to="/pages/about-us"
                className="nav-link"
              >
                عن المتجر
              </NavLink>
          </li>
          <li>
            <NavLink
              to="/pages/contact-us"
              className="nav-link"
            >
              اتصل بنا
            </NavLink>
          </li>
        </ul>

          {/* Mobile slide-in menu (pages/auth) */}
          <div
            id="mobileMenu"
            className={`nav-menu d-lg-none ${isMenuOpen ? "is-open" : ""}`}
            aria-hidden={!isMenuOpen}
          >
            <button
              className="close-menu-btn"
              onClick={closeMenu}
              aria-label="إغلاق القائمة"
            >
              <BiX size={30} />
            </button>
            {/* Mobile nav links */}
            <ul className="nav-links" role="list">
              <li>
                <NavLink to="/" end className="nav-link" onClick={closeMenu}>
                  الرئيسية
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/products"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  المنتجات
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pages/about-us"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  عن المتجر
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pages/contact-us"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  اتصل بنا
                </NavLink>
              </li>
            </ul>

            {/* Mobile auth/admin actions (VISIBLE only when menu is open) */}
            <div className="nav-actions-mobile">
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <button
                      type="button"
                      className="btn-admin"
                      onClick={() => {
                        if (window.innerWidth < 992) {
                          window.dispatchEvent(
                            new CustomEvent("open-admin-overlay")
                          ); // يفتح الدروار على الجوال
                        } else {
                          navigate("/admin/dashboard"); // على الديسكتوب: انتقال عادي
                        }
                      }}
                    >
                      <FaUserShield /> <span>لوحة المسؤول</span>
                    </button>
                  )}

                  <Link
                    className="btn-action-main"
                    to="/my-account"
                    onClick={closeMenu}
                  >
                    <BiUser /> حسابي
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-action-secondary"
                  >
                    <BiLogOut /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="btn-action-main"
                    to="/login"
                    onClick={closeMenu}
                  >
                    <BiLogIn /> تسجيل الدخول
                  </Link>
                  <Link
                    className="btn-action-secondary"
                    to="/register"
                    onClick={closeMenu}
                  >
                    <BiUserPlus /> حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="header-actions">
            <div className="d-none d-lg-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link className="btn-admin" to="/admin" onClick={closeMenu}>
                      <FaUserShield /> <span>لوحة المسؤول</span>
                    </Link>
                  )}
                  <div className="nav-item-dropdown user-dropdown">
                    <button
                      className="nav-link btn btn-link p-0"
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <BiUser size={22} /> {user?.username || "حسابي"}{" "}
                      <BiChevronDown />
                    </button>
                    <ul className="dropdown-content" role="menu">
                      <li>
                        <Link to="/my-account" onClick={closeMenu}>
                          لوحة التحكم
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-account/profile" onClick={closeMenu}>
                          الملف الشخصي
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-account/orders" onClick={closeMenu}>
                          طلباتي
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-account/addresses" onClick={closeMenu}>
                          عناويني
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-account/wishlist" onClick={closeMenu}>
                          قائمة الرغبات
                        </Link>
                      </li>
                      {user?.is_admin && (
                        <li>
                          <hr />
                          <Link to="/admin" onClick={closeMenu}>
                            لوحة المسؤول
                          </Link>
                      </li>
                      )}
                      <li>
                        <hr />
                    </li>
                      <li>
                        <button onClick={handleLogout}>تسجيل الخروج</button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    className="btn-action-main"
                    to="/login"
                    onClick={closeMenu}
                  >
                    <BiLogIn /> تسجيل الدخول
                  </Link>
                  <Link
                    className="btn-action-secondary"
                    to="/register"
                    onClick={closeMenu}
                  >
                    <BiUserPlus /> حساب جديد
                  </Link>
                </>
              )}
            </div>

            {/* Search toggle */}
            <button
              id="searchToggleButton"
              className="icon-btn search-toggle"
              aria-label="فتح البحث"
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-expanded={isSearchOpen}
              aria-controls="searchPanel"
            >
              <BiSearch size={24} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="cart-icon" aria-label="السلة">
              <BiShoppingBag size={26} />
              {safeCount > 0 && (
                <span className="cart-badge">
                  {safeCount > 99 ? "99+" : safeCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              id="menuToggleButton"
              className="menu-toggle d-lg-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobileMenu"
            >
              <BiMenu size={28} />
            </button>
          </div>
        </nav>
      </div>

      {/* Inline search panel (desktop: dropdown-like, mobile: full-width below header) */}
      <div
        id="searchPanel"
        className={`search-panel ${isSearchOpen ? "open" : ""}`}
        role="search"
      >
        <div className="container-lg px-3">
          <form className="search-form" onSubmit={onSearchSubmit} role="search">
            <input
              type="search"
              className="search-input"
              placeholder="ابحث عن منتج..."
              aria-label="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit">
              بحث
            </button>
          </form>
        </div>
      </div>

      {/* Categories navigation bar — Desktop: parents with mega-menu of children. Mobile: parents only as direct links */}
      <div
        className="category-nav border-top bg-white"
        role="navigation"
        aria-label="تصفح الأقسام"
      >
        <div className="container-fluid px-3">
          <ul className="category-list" role="list">
            {parents.map((parent) => (
              <li
                key={parent.category_id}
                className="category-item"
                aria-haspopup="true"
              >
                <Link
                  to={`/products?category_id=${parent.category_id}`}
                  className="category-link"
                >
                  {parent.name}
                </Link>

                {/* Desktop mega-menu (children) */}
                <div
                  className="mega-menu d-none d-lg-block"
                  role="menu"
                  aria-label={`أبناء ${parent.name}`}
                >
                  <div className="row g-3">
                    {childrenOf(parent.category_id).map((child) => (
                      <div key={child.category_id} className="col-6 col-xl-3">
                        <Link
                          className="mega-link"
                          to={`/products?category_id=${child.category_id}`}
                        >
                          {child.name}
                        </Link>
                      </div>
                    ))}
                    {childrenOf(parent.category_id).length === 0 && (
                      <div className="col-12 text-muted small">
                        لا توجد أقسام فرعية
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTE: لا توجد قائمة فرعية على الجوال — روابط مباشرة فقط */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;