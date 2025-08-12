// ===== src/components/Header.jsx (REFACTORED - CLEANER COMPONENTS) =====
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { BiLogIn, BiUserPlus, BiMenu } from "react-icons/bi";
import { FaUserShield } from "react-icons/fa";

// استيراد المكونات الفرعية
import HeaderLogo from "./header/HeaderLogo";
import HeaderNav from "./header/HeaderNav";
import SearchBar from "./header/SearchBar";
import MobileMenu from "./header/MobileMenu";
import UserDropdown from "./header/UserDropdown";
import CartIcon from "./header/CartIcon";
import CategoriesNav from "./header/CategoriesNav";
import { useToast } from "./common/Toast";

import "./../styles/header.css";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
    // إغلاق القوائم عند الضغط على ESC أو النقر خارجها
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    const handleClickOutside = (e) => {
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

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

    // تسجيل الخروج مع إشعار
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

  // إغلاق القائمة
  const closeMenu = () => setIsMenuOpen(false);
  const closeSearch = () => setIsSearchOpen(false);

    return (
    <>
      <header className="site-header sticky-top" role="banner">
        <div className="container-lg px-3">
          <nav
            className="header-nav"
            role="navigation"
            aria-label="الشريط العلوي"
          >
            {/* الشعار */}
            <HeaderLogo onNavigate={closeMenu} />

            {/* قائمة التنقل للديسكتوب */}
            <HeaderNav isDesktop={true} onNavigate={closeMenu} />

            {/* القائمة المنسدلة للجوال */}
            <MobileMenu
              isOpen={isMenuOpen}
              onClose={closeMenu}
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />

            {/* الأزرار والأيقونات الجانبية */}
            <div className="header-actions">
              {/* أزرار المصادقة والحساب للديسكتوب */}
              <div className="d-none d-lg-flex align-items-center gap-2">
                {isAuthenticated ? (
                  <>
                    {user?.is_admin && (
                      <Link className="btn-admin" to="/admin" onClick={closeMenu}>
                        <FaUserShield /> <span>لوحة المسؤول</span>
                      </Link>
                    )}
                    <UserDropdown 
                      user={user} 
                      onNavigate={closeMenu} 
                      onLogout={handleLogout} 
                    />
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

              {/* البحث */}
              <SearchBar
                isOpen={isSearchOpen}
                onToggle={() => setIsSearchOpen(!isSearchOpen)}
                onClose={closeSearch}
              />

              {/* السلة */}
              <CartIcon count={count} />

              {/* زر فتح القائمة للجوال */}
              <button
                id="menuToggleButton"
                className="menu-toggle d-lg-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobileMenu"
                aria-label="فتح القائمة"
              >
                <BiMenu size={28} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* شريط الأقسام */}
      <CategoriesNav />
    </>
  );
};

export default Header;