## مشروع Beauty Store — متجر تجميلي متكامل (Laravel + React)

هذا المشروع عبارة عن تطبيق متجر إلكتروني لمنتجات التجميل مكوّن من واجهة خلفية API مبنية بإطار Laravel 12، وواجهة أمامية مبنية بـ React 19 وVite. يعتمد النظام على مصادقة Laravel Sanctum، وسياسات الوصول Policies، وتقسيم واضح للمهام مثل المنتجات، الفئات، العلامات التجارية، العناوين، الطلبات، المراجعات، الصفحات الثابتة، الخصومات، وقائمة الرغبات.

### المزايا الرئيسية
- **واجهة خلفية Laravel 12 API**: مصادقة Sanctum، إدارة شاملة للموارد، Limits للمعدل، توثيق بنية واضحة للمجلدات والموديلات والسياسات.
- **واجهة أمامية React 19 + Vite**: صفحات جاهزة للمستخدم ولوحة التحكم، مكونات قابلة لإعادة الاستخدام، تعامل مركزي مع API عبر Axios.
- **أمان وصلاحيات**: سياسات `Policies` لكل نموذج، وحماية المسارات الحساسة، والتحقق من البريد الإلكتروني.
- **ميزات المتجر**: منتجات، صور المنتجات، سمات المنتجات، مراجعات، سلة مشتريات، طلبات ودفع، خصومات، صفحات ثابتة، قائمة رغبات.

### المتطلبات
- PHP 8.2+ وComposer
- Node.js 18+ وnpm
- خادم قاعدة بيانات (MySQL/MariaDB أو SQLite)
- (اختياري) XAMPP على ويندوز — ملائم لمسار المشروع الحالي `C:\xampp\htdocs`

### تشغيل سريع على ويندوز
1) إعداد الواجهة الخلفية (Laravel)
   - افتح Terminal داخل مجلد `backend/` وأدخل الأوامر:
     - `composer install`
     - انسخ ملف البيئة: `copy .env.example .env` (إن وُجد) أو أنشئ `.env` بناءً على إعداداتك
     - أنشئ مفتاح التطبيق: `php artisan key:generate`
     - عدّل إعدادات قاعدة البيانات في `.env` (القيم الشائعة لـ XAMPP: `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=beauty_store`, `DB_USERNAME=root`, `DB_PASSWORD=`)
     - نفّذ الترحيلات والبذور: `php artisan migrate --seed`
     - شغّل الخادم: `php artisan serve --port=8000`

2) إعداد الواجهة الأمامية (React)
   - افتح Terminal آخر داخل مجلد `frontend/` وأدخل:
     - `npm install`
     - `npm run dev`
   - افتح المتصفح على `http://localhost:5173`

3) ربط الواجهتين
   - عنوان الـ API مضبوط افتراضيًا في `frontend/src/api/axiosInstance.js` على: `http://localhost:8000/api`
   - تأكد من مطابقة المنفذ والمنشأ (origin) مع خادم Laravel.

### بيانات الدخول الافتراضية (مستخدم مشرف)
- يتم إنشاء مستخدم مشرف تلقائيًا عبر Seeder أثناء الأمر `php artisan migrate --seed`.
- البريد: `albdany054@gmail.com` — كلمة المرور: `12345678`
- ملاحظة: يوجد Seeder إضافي باسم `AdminUserSeeder` ينشئ بريدًا آخر `aalbdany054@gmail.com` إذا شغّلته يدويًا.

### بنية المجلدات

واجهة خلفية (مختصر):

```
backend/
  app/
    Http/
      Controllers/Api/
        AddressController.php, AuthController.php, BeautyAdvisorController.php,
        BrandController.php, CategoryController.php, DiscountController.php,
        OrderController.php, OrderItemController.php, PageController.php,
        PaymentController.php, ProductAttributeController.php, ProductController.php,
        ProductImageController.php, ReviewController.php, ShoppingCartController.php,
        UserController.php, WishlistController.php
      Middleware/
        ApiRateLimitMiddleware.php, AuthRateLimitMiddleware.php, RateLimitMiddleware.php, VerifyCsrfToken.php
    Models/
      Address.php, Brand.php, Category.php, Discount.php, Order.php, OrderItem.php,
      Page.php, Payment.php, Product.php, ProductAttribute.php, ProductImage.php,
      Review.php, ShoppingCart.php, User.php, Wishlist.php
    Policies/
      ... سياسات الوصول لكل نموذج رئيسي ...
  config/ (sanctum, auth, cors, rate_limiting, ...)
  database/
    migrations/ (جداول المستخدمين، المنتجات، الصور، السمات، المراجعات، العناوين، الطلبات، العناصر، المدفوعات، الخصومات، السلة، الصفحات، الجلسات، الرموز)
    seeders/ (DatabaseSeeder.php, AdminUserSeeder.php, BrandSeeder.php, ...)
  routes/
    api.php (جميع مسارات الـ API)
```

واجهة أمامية (مختصر):

```
frontend/
  src/
    api/ (axiosInstance.js, products.js, categories.js, auth.js, ...)
    components/ (مكونات عامة ومخصصة: Header, Footer, ProductCard, ...)
    contexts/ (AuthContext.jsx)
    pages/
      Admin/ (إدارة المستخدمين، المنتجات، الفئات، الطلبات، الخصومات، المحتوى، المراجعات)
      Auth/ (LoginPage.jsx, RegisterPage.jsx)
      Cart/, Checkout/, Products/, MyAccount/, StaticPage.jsx, Homepage.jsx
    styles/ (ملفات CSS منظمة حسب الصفحات والوحدات)
```

### أهم نقاط النهاية (API) بإيجاز
- مصادقة: `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`
- تحقق بريد: `GET /api/email/verify/{id}/{hash}`, `POST /api/email/resend`
- عامة: `GET /api/categories`, `GET /api/brands`, `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/{id}/reviews`, `GET /api/pages`, `GET /api/pages/{slug}`
- محمية: إدارة المستخدمين، الفئات، العلامات، المنتجات، العناوين، الطلبات، المراجعات، الصفحات، الخصومات، قائمة الرغبات، ومستشار الجمال عبر نقاط مخصصة داخل المجموعة المحمية `auth:sanctum`.

### الأوامر المفيدة
- اختبارات الواجهة الخلفية: `php artisan test`
- توليد مفاتيح جديدة: `php artisan key:generate`
- تحديث التبعيات: `composer update` و`npm update`

### ملاحظات أمنية
- حدّث متغيرات البيئة `.env`، خصوصًا مفاتيح التشفير `APP_KEY` وإعدادات قاعدة البيانات و`SANCTUM` و`CORS`.
- فعّل التحقق من البريد الإلكتروني في إعدادات التطبيق إذا كنت سترسل رسائل بريد حقيقية.

### الرخصة
هذا المشروع يستخدم مكونات مفتوحة المصدر مثل Laravel وReact. راجع تراخيص الحزم في `backend/composer.json` و`frontend/package.json`.


