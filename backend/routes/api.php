<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\ShoppingCartController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ProductImageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductAttributeController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\AuthController; // لإنشاء AuthController لاحقاً
use App\Http\Controllers\Api\BeautyAdvisorController; // لإضافة BeautyAdvisorController
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
    // backend/routes/api.php

    // ... (مسارات المصادقة الأخرى)

    // هذا المسار ضروري لـ Laravel Sanctum لجلب CSRF cookie
    Route::get('/sanctum/csrf-cookie', function () {
        return response('OK');
    });

    // ... (بقية المسارات)
    
// مسارات المصادقة (سنقوم بإنشاء AuthController لاحقًا)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// مسارات محمية بـ Sanctum (تتطلب مصادقة)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

 
    Route::post('/beauty-advisor/ask', [BeautyAdvisorController::class,'ask']);
        
 

    // مسارات المستخدمين
    Route::apiResource('users', UserController::class);

    // مسارات الفئات
    Route::apiResource('categories', CategoryController::class);

    // مسارات العلامات التجارية
    Route::apiResource('brands', BrandController::class);

    // مسارات المنتجات
    Route::apiResource('products', ProductController::class);

    // مسارات العناوين
    Route::apiResource('addresses', AddressController::class);

    // مسارات الطلبات
    Route::apiResource('orders', OrderController::class);

    // مسارات عناصر الطلب
    Route::apiResource('order-items', OrderItemController::class);

    // مسارات سلة التسوق
    Route::apiResource('shopping-cart', ShoppingCartController::class);

    // مسارات المراجعات
    Route::apiResource('reviews', ReviewController::class);

    // مسارات صور المنتجات
    Route::apiResource('product-images', ProductImageController::class);

    // مسارات المدفوعات
    Route::apiResource('payments', PaymentController::class);

    // مسارات سمات المنتجات
    Route::apiResource('product-attributes', ProductAttributeController::class);

    // مسارات الخصومات
    Route::apiResource('discounts', DiscountController::class);
});