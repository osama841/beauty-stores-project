## الواجهة الخلفية — Laravel 12 API

هذه الواجهة هي نواة الـ API الخاص بمشروع Beauty Store، مبنية على Laravel 12 ومهيأة لدعم مصادقة Sanctum، حدود المعدل Rate Limiting، سياسات الوصول، والتحقق من البريد الإلكتروني.

### المتطلبات
- PHP 8.2+
- Composer
- MySQL/MariaDB (أو SQLite)

### الإعداد السريع
1) تثبيت التبعيات:
   - `composer install`
2) ملف البيئة:
   - إن وُجد `/.env.example` انسخه إلى `.env`. وإن لم يوجد، أنشئ `.env` واضبط المتغيرات الأساسية:
     - `APP_KEY` (يُولّد عبر الأمر التالي)
     - إعدادات قاعدة البيانات (`DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`)
3) توليد مفتاح التطبيق:
   - `php artisan key:generate`
4) الترحيلات والبذور:
   - `php artisan migrate --seed`
   - سيتم إنشاء مستخدم مشرف تلقائيًا (راجع `DatabaseSeeder` و`AdminUserSeeder`).
5) تشغيل الخادم:
   - `php artisan serve --port=8000`

### بنية المجلدات المهمة
- `app/Http/Controllers/Api/`: جميع وحدات التحكم الخاصة بالـ API، منها: المستخدمون، الفئات، العلامات، المنتجات، الصور، السمات، العناوين، الطلبات، عناصر الطلب، المراجعات، المدفوعات، الصفحات، الخصومات، السلة، قائمة الرغبات، ومستشار الجمال.
- `app/Models/`: نماذج Eloquent لكل كيان رئيسي.
- `app/Policies/`: سياسات الوصول لكل نموذج لضبط الأذونات.
- `routes/api.php`: تعريف نقاط النهاية العامة والمحميّة.
- `database/migrations/`: جميع الجداول اللازمة للنظام.
- `database/seeders/`: بذور البيانات، ومنها إنشاء حساب المشرف.
- `config/`: إعدادات التطبيق، المصادقة، Sanctum، CORS، الحدود…

### نقاط نهاية رئيسية (مختصر)
- مصادقة: `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`
- تحقق البريد: `GET /api/email/verify/{id}/{hash}`, `POST /api/email/resend`
- عامة: `GET /api/categories`, `GET /api/brands`, `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/{id}/reviews`, `GET /api/pages`, `GET /api/pages/{slug}`
- محمية (Sanctum): CRUD للفئات، العلامات، المنتجات، العناوين، الطلبات، المراجعات، الصفحات، الخصومات، قائمة الرغبات، ومستشار الجمال.

### حساب المشرف الافتراضي
- البريد: `albdany054@gmail.com`
- كلمة المرور: `12345678`
- يوجد Seeder إضافي قد ينشئ بريدًا آخر: `aalbdany054@gmail.com` عند استخدام `AdminUserSeeder`.

### نصائح أمنية
- حدّث `APP_KEY` وبيانات قاعدة البيانات في `.env`.
- اضبط CORS وSanctum بحسب نطاق الواجهة الأمامية.
- راجع السياسات في `app/Policies/` لضمان صحة الأذونات.

### أوامر مفيدة
- تشغيل الاختبارات: `php artisan test`
- تحديث الحزم: `composer update`
- تشغيل وضع التطوير المتزامن (حسب سكربت composer إن وُضع): `composer run dev`

### رخصة
يعتمد هذا الجزء على Laravel ويخضع لرخصة MIT الخاصة بحزم Laravel المعتمدة.
