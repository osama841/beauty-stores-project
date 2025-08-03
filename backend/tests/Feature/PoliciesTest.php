<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Review;
use App\Models\Address;
use App\Models\ShoppingCart;
use App\Models\Payment;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class PoliciesTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $regularUser;
    protected $otherUser;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        // إنشاء مستخدم مشرف
        $this->adminUser = User::factory()->create([
            'is_admin' => true,
            'email' => 'admin@example.com'
        ]);

        // إنشاء مستخدم عادي
        $this->regularUser = User::factory()->create([
            'is_admin' => false,
            'email' => 'user@example.com'
        ]);

        // إنشاء مستخدم آخر
        $this->otherUser = User::factory()->create([
            'is_admin' => false,
            'email' => 'other@example.com'
        ]);

        // إنشاء منتج للاختبار
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => 10
        ]);
    }

    /** @test */
    public function admin_can_access_all_resources()
    {
        Sanctum::actingAs($this->adminUser);

        // إنشاء موارد للمستخدم العادي
        $order = Order::factory()->create(['user_id' => $this->regularUser->user_id]);
        $review = Review::factory()->create(['user_id' => $this->regularUser->user_id]);
        $address = Address::factory()->create(['user_id' => $this->regularUser->user_id]);

        // اختبار الوصول للطلبات
        $response = $this->getJson("/api/orders/{$order->order_id}");
        $response->assertStatus(200);

        // اختبار الوصول للمراجعات
        $response = $this->getJson("/api/reviews/{$review->review_id}");
        $response->assertStatus(200);

        // اختبار الوصول للعناوين
        $response = $this->getJson("/api/addresses/{$address->address_id}");
        $response->assertStatus(200);
    }

    /** @test */
    public function user_can_only_access_their_own_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // إنشاء موارد للمستخدم العادي
        $ownOrder = Order::factory()->create(['user_id' => $this->regularUser->user_id]);
        $ownReview = Review::factory()->create(['user_id' => $this->regularUser->user_id]);
        $ownAddress = Address::factory()->create(['user_id' => $this->regularUser->user_id]);

        // إنشاء موارد للمستخدم الآخر
        $otherOrder = Order::factory()->create(['user_id' => $this->otherUser->user_id]);
        $otherReview = Review::factory()->create(['user_id' => $this->otherUser->user_id]);
        $otherAddress = Address::factory()->create(['user_id' => $this->otherUser->user_id]);

        // اختبار الوصول لمواردهم الخاصة
        $response = $this->getJson("/api/orders/{$ownOrder->order_id}");
        $response->assertStatus(200);

        $response = $this->getJson("/api/reviews/{$ownReview->review_id}");
        $response->assertStatus(200);

        $response = $this->getJson("/api/addresses/{$ownAddress->address_id}");
        $response->assertStatus(200);

        // اختبار عدم الوصول لموارد الآخرين
        $response = $this->getJson("/api/orders/{$otherOrder->order_id}");
        $response->assertStatus(403);

        $response = $this->getJson("/api/reviews/{$otherReview->review_id}");
        $response->assertStatus(403);

        $response = $this->getJson("/api/addresses/{$otherAddress->address_id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_create_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // اختبار إنشاء طلب
        $orderData = [
            'shipping_address' => [
                'address_line1' => '123 Test St',
                'city' => 'Test City',
                'postal_code' => '12345',
                'country' => 'Test Country',
                'address_type' => 'shipping',
                'is_default' => true
            ],
            'payment' => [
                'method' => 'credit_card',
                'status' => 'pending',
                'amount' => 100.00
            ]
        ];

        $response = $this->postJson('/api/orders', $orderData);
        $response->assertStatus(201);

        // اختبار إنشاء مراجعة
        $reviewData = [
            'product_id' => $this->product->product_id,
            'rating' => 5,
            'title' => 'Great Product',
            'comment' => 'Excellent quality'
        ];

        $response = $this->postJson('/api/reviews', $reviewData);
        $response->assertStatus(201);

        // اختبار إنشاء عنوان
        $addressData = [
            'address_type' => 'shipping',
            'address_line1' => '456 Test Ave',
            'city' => 'Test City',
            'postal_code' => '54321',
            'country' => 'Test Country',
            'is_default' => false
        ];

        $response = $this->postJson('/api/addresses', $addressData);
        $response->assertStatus(201);
    }

    /** @test */
    public function user_can_update_their_own_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // إنشاء موارد للمستخدم
        $order = Order::factory()->create(['user_id' => $this->regularUser->user_id]);
        $review = Review::factory()->create(['user_id' => $this->regularUser->user_id]);
        $address = Address::factory()->create(['user_id' => $this->regularUser->user_id]);

        // اختبار تحديث الطلب
        $response = $this->putJson("/api/orders/{$order->order_id}", [
            'notes' => 'Updated notes'
        ]);
        $response->assertStatus(200);

        // اختبار تحديث المراجعة
        $response = $this->putJson("/api/reviews/{$review->review_id}", [
            'title' => 'Updated Title',
            'comment' => 'Updated comment'
        ]);
        $response->assertStatus(200);

        // اختبار تحديث العنوان
        $response = $this->putJson("/api/addresses/{$address->address_id}", [
            'address_line1' => 'Updated Address'
        ]);
        $response->assertStatus(200);
    }

    /** @test */
    public function user_cannot_update_others_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // إنشاء موارد للمستخدم الآخر
        $otherOrder = Order::factory()->create(['user_id' => $this->otherUser->user_id]);
        $otherReview = Review::factory()->create(['user_id' => $this->otherUser->user_id]);
        $otherAddress = Address::factory()->create(['user_id' => $this->otherUser->user_id]);

        // اختبار عدم إمكانية تحديث طلب الآخر
        $response = $this->putJson("/api/orders/{$otherOrder->order_id}", [
            'notes' => 'Updated notes'
        ]);
        $response->assertStatus(403);

        // اختبار عدم إمكانية تحديث مراجعة الآخر
        $response = $this->putJson("/api/reviews/{$otherReview->review_id}", [
            'title' => 'Updated Title'
        ]);
        $response->assertStatus(403);

        // اختبار عدم إمكانية تحديث عنوان الآخر
        $response = $this->putJson("/api/addresses/{$otherAddress->address_id}", [
            'address_line1' => 'Updated Address'
        ]);
        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_delete_their_own_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // إنشاء موارد للمستخدم
        $review = Review::factory()->create(['user_id' => $this->regularUser->user_id]);
        $address = Address::factory()->create(['user_id' => $this->regularUser->user_id]);

        // اختبار حذف المراجعة
        $response = $this->deleteJson("/api/reviews/{$review->review_id}");
        $response->assertStatus(204);

        // اختبار حذف العنوان
        $response = $this->deleteJson("/api/addresses/{$address->address_id}");
        $response->assertStatus(204);
    }

    /** @test */
    public function user_cannot_delete_others_resources()
    {
        Sanctum::actingAs($this->regularUser);

        // إنشاء موارد للمستخدم الآخر
        $otherReview = Review::factory()->create(['user_id' => $this->otherUser->user_id]);
        $otherAddress = Address::factory()->create(['user_id' => $this->otherUser->user_id]);

        // اختبار عدم إمكانية حذف مراجعة الآخر
        $response = $this->deleteJson("/api/reviews/{$otherReview->review_id}");
        $response->assertStatus(403);

        // اختبار عدم إمكانية حذف عنوان الآخر
        $response = $this->deleteJson("/api/addresses/{$otherAddress->address_id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_resources()
    {
        // إنشاء موارد
        $order = Order::factory()->create(['user_id' => $this->regularUser->user_id]);
        $review = Review::factory()->create(['user_id' => $this->regularUser->user_id]);
        $address = Address::factory()->create(['user_id' => $this->regularUser->user_id]);

        // اختبار عدم الوصول للطلبات
        $response = $this->getJson("/api/orders/{$order->order_id}");
        $response->assertStatus(401);

        // اختبار عدم الوصول للمراجعات
        $response = $this->getJson("/api/reviews/{$review->review_id}");
        $response->assertStatus(401);

        // اختبار عدم الوصول للعناوين
        $response = $this->getJson("/api/addresses/{$address->address_id}");
        $response->assertStatus(401);
    }
} 