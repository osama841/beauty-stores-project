<?php

namespace App\Providers;

// استيراد النماذج (Models) التي ستستخدم Policies
use App\Models\User;
use App\Models\Product;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Page;
use App\Models\Discount;
use App\Models\ShoppingCart;
use App\Models\Payment;

// استيراد الـ Policies
use App\Policies\UserPolicy;
use App\Policies\ProductPolicy;
use App\Policies\AddressPolicy;
use App\Policies\OrderPolicy;
use App\Policies\OrderItemPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\BrandPolicy;
use App\Policies\PagePolicy;
use App\Policies\DiscountPolicy;
use App\Policies\ShoppingCartPolicy;
use App\Policies\PaymentPolicy;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Product::class => ProductPolicy::class,
        Address::class => AddressPolicy::class,
        Order::class => OrderPolicy::class,
        OrderItem::class => OrderItemPolicy::class,
        Review::class => ReviewPolicy::class,
        Category::class => CategoryPolicy::class,
        Brand::class => BrandPolicy::class,
        Page::class => PagePolicy::class,
        Discount::class => DiscountPolicy::class,
        ShoppingCart::class => ShoppingCartPolicy::class,
        Payment::class => PaymentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}