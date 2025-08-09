## الواجهة الأمامية — React 19 + Vite

واجهة المستخدم لمشروع Beauty Store مبنية على React 19 وVite، وتستهلك الـ API الخاص بـ Laravel عبر Axios. تم تنظيم الصفحات والمكونات لتغطية تجربة المستخدم والمتجر ولوحة الإدارة.

### المتطلبات
- Node.js 18+
- npm

### الإعداد السريع
1) تثبيت التبعيات:
   - `npm install`
2) تشغيل بيئة التطوير:
   - `npm run dev`
   - افتح `http://localhost:5173`

### الربط مع الـ API
- ملف `src/api/axiosInstance.js` مضبوط على `http://localhost:8000/api` كعنوان أساسي.
- إذا غيّرت منفذ خادم Laravel أو النطاق، حدّث القيمة هناك.

### بنية المجلدات المهمة
- `src/api/`: وحدات استهلاك API (auth, users, products, categories, orders, cart, reviews, pages, wishlist, discounts...).
- `src/components/`: مكونات جاهزة مثل `Header`, `Footer`, `ProductCard`, نماذج وإطارات تخطيط.
- `src/contexts/AuthContext.jsx`: سياق المصادقة وتخزين التوكن.
- `src/pages/`:
  - `Admin/`: إدارة المستخدمين، المنتجات، الفئات، الطلبات، الخصومات، المحتوى، المراجعات.
  - `Auth/`: تسجيل الدخول والتسجيل.
  - `Cart/`, `Checkout/`, `Products/`, `MyAccount/`, `StaticPage.jsx`, `Homepage.jsx`.
- `src/styles/`: ملفات CSS منظمة حسب الوحدات والصفحات.

### المصادقة وإدارة الجلسة
- التوكن يُخزن في `localStorage` باسم `authToken`.
- الاعتراضات في `axiosInstance.js` تضيف ترويسة `Authorization` تلقائيًا وتتعامل مع حالات 401/403.

### نصائح وتجهيزات
- تأكد من تفعيل CORS في الواجهة الخلفية ليستقبل منشأ Vite (`http://localhost:5173`).
- حدّث روابط التوجيه في React Router بحال تغيير مسارات الصفحات.

### أوامر npm
- `npm run dev`: تشغيل بيئة التطوير.
- `npm run build`: إنتاج نسخة جاهزة للنشر.
- `npm run preview`: معاينة البناء محليًا.
- `npm run lint`: فحص الشيفرة وفق ESLint.


