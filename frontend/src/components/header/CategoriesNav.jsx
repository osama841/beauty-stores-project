// ===== src/components/header/CategoriesNav.jsx =====
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/categories';

const CategoriesNav = () => {
  const [categories, setCategories] = useState([]);

  // جلب الأقسام من API
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("فشل تحميل الفئات لشريط التنقل:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // تنظيم الأقسام: الآباء والأطفال
  const { parents, childrenMap } = useMemo(() => {
    const parents = [];
    const map = {};
    
    for (const category of categories) {
      if (!category?.parent_id) {
        parents.push(category);
      } else {
        (map[category.parent_id] ||= []).push(category);
      }
    }

    // ترتيب أبجدي
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

  const getChildren = (parentId) => childrenMap[parentId] || [];

  if (parents.length === 0) {
    return null; // لا تظهر شيئاً إذا لم توجد أقسام
  }

  return (
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

              {/* القائمة الفرعية للديسكتوب فقط */}
              <div
                className="mega-menu d-none d-lg-block"
                role="menu"
                aria-label={`أبناء ${parent.name}`}
              >
                <div className="row g-3">
                  {getChildren(parent.category_id).map((child) => (
                    <div key={child.category_id} className="col-6 col-xl-3">
                      <Link
                        className="mega-link"
                        to={`/products?category_id=${child.category_id}`}
                      >
                        {child.name}
                      </Link>
                    </div>
                  ))}
                  {getChildren(parent.category_id).length === 0 && (
                    <div className="col-12 text-muted small">
                      لا توجد أقسام فرعية
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoriesNav;
