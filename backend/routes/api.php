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
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BeautyAdvisorController;

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

// مسارات المصادقة العامة
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// مسارات عامة أخرى (لا تتطلب مصادقة)
Route::get('/sanctum/csrf-cookie', function () {
    return response('OK');
});
Route::get('/categories', [CategoryController::class, 'index']); // عرض الفئات
Route::get('/brands', [BrandController::class, 'index']);       // عرض العلامات التجارية
Route::get('/products', [ProductController::class, 'index']);   // عرض المنتجات
Route::get('/products/{product}', [ProductController::class, 'show']); // عرض تفاصيل منتج

// ****** المسار المحدد لجلب المراجعات لمنتج معين (عام) ******
Route::get('/products/{productId}/reviews', [ReviewController::class, 'indexByProduct']);


// مسارات محمية بـ Sanctum (تتطلب مصادقة)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // مسارات Beauty Advisor (إذا تم تفعيلها)
    Route::post('/beauty-advisor/ask', [BeautyAdvisorController::class,'ask']);

    // مسارات المستخدمين (CRUD)
    Route::apiResource('users', UserController::class);

    // مسارات الفئات (CRUD)
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']); // استثناء index, show لأنها عامة

    // مسارات العلامات التجارية (CRUD)
    Route::apiResource('brands', BrandController::class)->except(['index', 'show']); // استثناء index, show لأنها عامة

    // مسارات المنتجات (CRUD)
    Route::apiResource('products', ProductController::class)->except(['index', 'show']); // استثناء index, show لأنها عامة

    // مسارات العناوين (CRUD)
    Route::apiResource('addresses', AddressController::class);

    // مسارات الطلبات (CRUD)
    Route::apiResource('orders', OrderController::class); // يمكن تعديلها لتكون updateStatus فقط

    // مسارات عناصر الطلب (CRUD)
    Route::apiResource('order-items', OrderItemController::class);

    // مسارات سلة التسوق (CRUD)
    Route::apiResource('shopping-cart', ShoppingCartController::class);

    // مسارات المراجعات (CRUD)
    Route::apiResource('reviews', ReviewController::class); // هذا سيضيف store, update, destroy

    // مسارات صور المنتجات (CRUD)
    Route::apiResource('product-images', ProductImageController::class);

    // مسارات المدفوعات (CRUD)
    Route::apiResource('payments', PaymentController::class);

    // مسارات سمات المنتجات (CRUD)
    Route::apiResource('product-attributes', ProductAttributeController::class);

    // مسارات الخصومات (CRUD)
    Route::apiResource('discounts', DiscountController::class);
});
