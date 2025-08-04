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
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\BeautyAdvisorController;
use App\Http\Controllers\Api\WishlistController;

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

// مسارات المصادقة العامة مع Rate Limiting
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ****** مسارات التحقق من البريد الإلكتروني ******
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware(['auth:sanctum', 'signed'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware('auth:sanctum')->name('verification.resend');

// مسارات عامة أخرى مع Rate Limiting
Route::middleware('api.rate.limit')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/{productId}/reviews', [ReviewController::class, 'indexByProduct']);
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{page:slug}', [PageController::class, 'show']);
});

// Protected routes (تتطلب مصادقة Sanctum) مع Rate Limiting
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // مسارات Beauty Advisor
    Route::post('/beauty-advisor/ask', [BeautyAdvisorController::class,'ask']);

    // إدارة المستخدمين
    Route::apiResource('users', UserController::class);

    // إدارة الفئات (للمسؤول)
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

    // إدارة العلامات التجارية (للمسؤول)
    Route::apiResource('brands', BrandController::class)->except(['index', 'show']);

    // إدارة المنتجات (للمسؤول)
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);

    // إدارة العناوين (للمستخدم المصادق عليه)
    Route::apiResource('addresses', AddressController::class);

    // إدارة الطلبات (للمسؤول والمستخدم)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // إدارة سلة التسوق (للمستخدم المصادق عليه)
    Route::apiResource('shopping-cart', ShoppingCartController::class)->only(['index', 'store', 'update', 'destroy']);

    // إدارة المراجعات (للمسؤول)
    Route::apiResource('reviews', ReviewController::class)->except(['indexByProduct']);
    Route::patch('/reviews/{review}/approve', [ReviewController::class, 'approve']);

    // إدارة الصفحات الثابتة (للمسؤول)
    Route::apiResource('pages', PageController::class)->except(['index', 'show']);
    
    // إدارة الخصومات (للمسؤول)
    Route::apiResource('discounts', DiscountController::class);
    // مسار تطبيق الخصم (للمستخدم المصادق عليه)
    Route::post('/discounts/apply', [DiscountController::class, 'apply']);

    // إدارة قائمة الرغبات (Wishlist)
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
});
