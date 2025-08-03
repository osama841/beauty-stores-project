# Frontend Policies Implementation - Beauty Store Project

## نظرة عامة

تم تطبيق نظام حماية الواجهة الأمامية باستخدام React لحماية الوصول إلى الموارد بناءً على صلاحيات المستخدم. هذا النظام يعمل جنباً إلى جنب مع Laravel Policies في الخلفية.

## المكونات المضافة

### 1. PermissionGuard
مكون لحماية الواجهات بناءً على صلاحيات المستخدم.

```jsx
import PermissionGuard from '../components/PermissionGuard';

<PermissionGuard
  requireAuth={true}
  resource="order"
  action="edit"
  resourceData={order}
  fallback={<div>Access denied</div>}
>
  <EditOrderForm order={order} />
</PermissionGuard>
```

**الخصائص:**
- `requireAuth`: هل يتطلب المصادقة
- `requireAdmin`: هل يتطلب صلاحيات المشرف
- `resource`: نوع المورد (user, order, review, etc.)
- `action`: نوع الإجراء (view, edit, delete, etc.)
- `resourceData`: بيانات المورد للتحقق من الملكية
- `fallback`: المحتوى البديل عند عدم وجود صلاحية

### 2. ErrorHandler
مكون للتعامل مع أخطاء API وعرض رسائل مناسبة للمستخدم.

```jsx
import ErrorHandler from '../components/ErrorHandler';

<ErrorHandler 
  error={error} 
  onRetry={handleRetry}
  showRetry={true}
/>
```

**المكونات الفرعية:**
- `PermissionError`: للتعامل مع أخطاء الصلاحيات (403)
- `AuthError`: للتعامل مع أخطاء المصادقة (401)

### 3. ActionButtons
مكون لأزرار الإجراءات التي تظهر بناءً على صلاحيات المستخدم.

```jsx
import ActionButtons from '../components/ActionButtons';

<ActionButtons
  resource="review"
  resourceData={review}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showEdit={true}
  showDelete={true}
  size="sm"
/>
```

**المكونات الفرعية:**
- `ReviewActionButtons`: أزرار خاصة بالمراجعات
- `OrderActionButtons`: أزرار خاصة بالطلبات

## معالجة الأخطاء

### 1. Axios Interceptors
تم إضافة معالج للاستجابات في `axiosInstance.js`:

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        console.error('Access denied');
      } else if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. أنواع الأخطاء المدعومة
- **400**: Bad Request - خطأ في البيانات المرسلة
- **401**: Unauthorized - غير مصادق
- **403**: Forbidden - غير مصرح
- **404**: Not Found - المورد غير موجود
- **422**: Validation Error - خطأ في التحقق من البيانات
- **429**: Too Many Requests - طلبات كثيرة جداً
- **500**: Server Error - خطأ في الخادم

## كيفية الاستخدام

### 1. حماية الصفحات

```jsx
// صفحة خاصة بالمستخدم
<PermissionGuard requireAuth={true}>
  <UserDashboard />
</PermissionGuard>

// صفحة خاصة بالمشرف
<PermissionGuard requireAdmin={true}>
  <AdminDashboard />
</PermissionGuard>
```

### 2. حماية النماذج

```jsx
<PermissionGuard
  resource="order"
  action="edit"
  resourceData={order}
>
  <EditOrderForm order={order} />
</PermissionGuard>
```

### 3. أزرار الإجراءات

```jsx
// أزرار عامة
<ActionButtons
  resource="review"
  resourceData={review}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// أزرار المراجعات
<ReviewActionButtons
  review={review}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onApprove={handleApprove}
/>

// أزرار الطلبات
<OrderActionButtons
  order={order}
  onView={handleView}
  onCancel={handleCancel}
  onUpdateStatus={handleUpdateStatus}
/>
```

### 4. معالجة الأخطاء

```jsx
// معالج عام للأخطاء
<ErrorHandler error={error} onRetry={handleRetry} />

// معالج أخطاء الصلاحيات
<PermissionError error={error} onLogin={() => navigate('/login')} />

// معالج أخطاء المصادقة
<AuthError error={error} onLogin={() => navigate('/login')} />
```

## دمج المكونات في الصفحات الموجودة

### 1. صفحة المراجعات

```jsx
import { ReviewActionButtons } from '../components/ActionButtons';
import ErrorHandler from '../components/ErrorHandler';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  return (
    <div>
      <ErrorHandler error={error} onRetry={fetchReviews} />
      {reviews.map(review => (
        <div key={review.review_id}>
          <h3>{review.title}</h3>
          <p>{review.comment}</p>
          <ReviewActionButtons
            review={review}
            onEdit={() => handleEdit(review)}
            onDelete={() => handleDelete(review)}
            onApprove={() => handleApprove(review)}
          />
        </div>
      ))}
    </div>
  );
};
```

### 2. صفحة الطلبات

```jsx
import { OrderActionButtons } from '../components/ActionButtons';
import PermissionGuard from '../components/PermissionGuard';

const OrderList = () => {
  return (
    <div>
      {orders.map(order => (
        <div key={order.order_id}>
          <h3>Order #{order.order_id}</h3>
          <p>Status: {order.status}</p>
          <OrderActionButtons
            order={order}
            onView={() => handleView(order)}
            onCancel={() => handleCancel(order)}
            onUpdateStatus={() => handleUpdateStatus(order)}
          />
        </div>
      ))}
    </div>
  );
};
```

### 3. صفحة الملف الشخصي

```jsx
import PermissionGuard from '../components/PermissionGuard';

const UserProfile = ({ user }) => {
  return (
    <PermissionGuard
      resource="user"
      action="edit"
      resourceData={user}
    >
      <div>
        <h2>Profile</h2>
        <EditProfileForm user={user} />
      </div>
    </PermissionGuard>
  );
};
```

## الفوائد

1. **الأمان**: حماية شاملة للواجهات من الوصول غير المصرح
2. **تجربة المستخدم**: إخفاء الأزرار والواجهات التي لا يمكن الوصول إليها
3. **المرونة**: سهولة إضافة صلاحيات جديدة أو تعديل الموجودة
4. **التناسق**: تطبيق موحد للصلاحيات في جميع أنحاء التطبيق
5. **الصيانة**: سهولة الصيانة والتطوير المستقبلي

## الاختبار

يجب اختبار جميع المكونات للتأكد من:
- إخفاء الأزرار والواجهات غير المصرح بها
- عرض رسائل الخطأ المناسبة
- إعادة التوجيه الصحيح عند انتهاء صلاحية الجلسة
- عمل أزرار الإجراءات بشكل صحيح
- تطبيق الصلاحيات على جميع المستخدمين (عادي، مشرف)

## التطوير المستقبلي

يمكن إضافة المزيد من الميزات مثل:
- إدارة الصلاحيات المتقدمة
- أدوار متعددة للمستخدمين
- صلاحيات مخصصة للموارد
- نظام تنبيهات للصلاحيات
- سجل للأنشطة والصلاحيات 