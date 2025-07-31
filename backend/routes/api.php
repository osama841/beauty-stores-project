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
use App\Http\Controllers\Api\PageController; // ****** تصحيح: استخدام \ ******
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

// مسارات المراجعات
Route::get('/products/{productId}/reviews', [ReviewController::class, 'indexByProduct']); // عام


// ****** مسارات الصفحات الثابتة (عامة) ******
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{page:slug}', [PageController::class, 'show']); // يمكن جلب الصفحة باستخدام الـ slug


// Protected routes (تتطلب مصادقة Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // مسارات Beauty Advisor
    Route::post('/beauty-advisor/ask', [BeautyAdvisorController::class,'ask']);

    // ****** إدارة المستخدمين ******
    Route::apiResource('users', UserController::class);

    // ****** إدارة الفئات (للمسؤول) ******
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

    // ****** إدارة العلامات التجارية (للمسؤول) ******
    Route::apiResource('brands', BrandController::class)->except(['index', 'show']);

    // ****** إدارة المنتجات (للمسؤول) ******
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);

    // ****** إدارة العناوين (للمستخدم المصادق عليه) ******
    Route::apiResource('addresses', AddressController::class);

    // ****** إدارة الطلبات (للمسؤول والمستخدم) ******
    Route::get('/orders', [OrderController::class, 'index']); // المستخدم يرى طلباته، المسؤول يرى الكل
    Route::get('/orders/{order}', [OrderController::class, 'show']); // المستخدم يرى طلبه، المسؤول يرى أي طلب
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']); // للمسؤول

    // ****** إدارة سلة التسوق (للمستخدم المصادق عليه) ******
    Route::apiResource('shopping-cart', ShoppingCartController::class)->only(['index', 'store', 'update', 'destroy']);

    // ****** إدارة المراجعات (للمسؤول) ******
    Route::apiResource('reviews', ReviewController::class)->except(['indexByProduct']);
    Route::patch('/reviews/{review}/approve', [ReviewController::class, 'approve']);

    // ****** إدارة الصفحات الثابتة (للمسؤول) ******
    Route::apiResource('pages', PageController::class)->except(['index', 'show']);
});
