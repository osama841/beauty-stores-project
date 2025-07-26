<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShoppingCart;
use App\Models\Address;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon; // إضافة Carbon للاستخدام المباشر

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
      public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $query = Order::with(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payment']);

            // تطبيق الفلاتر بناءً على حالة الطلب (status)
            // نستخدم input() للحصول على قيمة 'status' من طلب الواجهة الأمامية
            if ($request->has('status') && $request->input('status') !== '') {
                $query->where('status', $request->input('status'));
            }

            // تحديد عدد العناصر لكل صفحة، ويمكن للواجهة الأمامية أن تمررها
            $perPage = $request->input('per_page', 15); // افتراضيًا 15 عنصر لكل صفحة
            // استخدام paginate() لتقسيم النتائج إلى صفحات
            $orders = $query->paginate($perPage);

            // Laravel يقوم تلقائيًا بإرجاع كائن JSON لهيكل Pagination
            return response()->json($orders, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage(), ['exception' => $e, 'user_id' => $user->user_id ?? 'guest']);
            return response()->json([
                'message' => 'An error occurred while fetching orders.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Store a newly created order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $request->validate([
                'shipping_address.address_line1' => 'required|string|max:255',
                'shipping_address.address_line2' => 'nullable|string|max:255',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.state' => 'nullable|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'shipping_address.country' => 'required|string|max:100',
                'shipping_address.phone_number' => 'nullable|string|max:20',
                'shipping_address.address_type' => 'required|string|in:shipping,billing',
                'shipping_address.is_default' => 'boolean',

                'payment.method' => 'required|string|in:credit_card,paypal,cash_on_delivery',
                // CVV لا يجب تخزينه، لذا لا نجعله مطلوباً بشكل صارم للتخزين
                'payment.card_number' => 'required_if:payment.method,credit_card|nullable|string|max:16',
                'payment.expiry_date' => 'required_if:payment.method,credit_card|nullable|string|max:7',
                'payment.cvv' => 'nullable|string|max:4', // **ملاحظة أمنية: لا يوصى بتخزين CVV**
                'payment.status' => 'required|string|in:pending,completed,failed',
                'payment.amount' => 'required|numeric|min:0',
                'payment.currency' => 'nullable|string|max:10',
                'payment.transaction_id' => 'nullable|string|max:255',
                'payment.payment_date' => 'nullable|date',
                'payment.gateway_response' => 'nullable|string',
                'payment.card_number_last_four' => 'nullable|string|max:4',

                'notes' => 'nullable|string|max:500',
                'shipping_method' => 'nullable|string|max:50',
            ]);

            return DB::transaction(function () use ($request, $user) {
                $cartItems = ShoppingCart::where('user_id', $user->user_id)
                                        ->with('product')
                                        ->get();

                if ($cartItems->isEmpty()) {
                    return response()->json(['message' => 'Your cart is empty.'], 400);
                }

                $totalAmountCalculated = 0;
                foreach ($cartItems as $item) {
                    if (!$item->product || $item->product->stock_quantity < $item->quantity) {
                        throw new \Exception('Insufficient stock for product: ' . ($item->product ? $item->product->name : $item->product_id));
                    }
                    $totalAmountCalculated += $item->quantity * $item->product->price;
                }

                // **التحقق من تطابق المبلغ المرسل مع المبلغ المحسوب (مهم للأمان)**
                if (abs($request->input('payment.amount') - $totalAmountCalculated) > 0.01) { // سماحية بسيطة للتعويم
                    Log::warning('Frontend total amount mismatch for user: ' . $user->user_id, [
                        'frontend_amount' => $request->input('payment.amount'),
                        'calculated_amount' => $totalAmountCalculated,
                        'cart_items' => $cartItems->toArray(),
                    ]);
                    // يمكن اختيار رفض الطلب هنا أو تعديل المبلغ إلى المحسوب
                    // للحفاظ على الأمان، سنستخدم المبلغ المحسوب دائمًا
                    // throw new \Exception('Mismatch in total amount.'); // يمكن تفعيل هذا لزيادة الأمان
                }

                $shippingAddress = Address::create([
                    'user_id' => $user->user_id,
                    'address_line1' => $request->input('shipping_address.address_line1'),
                    'address_line2' => $request->input('shipping_address.address_line2'),
                    'city' => $request->input('shipping_address.city'),
                    'state' => $request->input('shipping_address.state'),
                    'postal_code' => $request->input('shipping_address.postal_code'),
                    'country' => $request->input('shipping_address.country'),
                    'phone_number' => $request->input('shipping_address.phone_number'),
                    'address_type' => $request->input('shipping_address.address_type', 'shipping'),
                    'is_default' => $request->input('shipping_address.is_default', false),
                ]);

                // 1. إنشاء الطلب أولًا
                $order = Order::create([
                    'user_id' => $user->user_id,
                    'order_date' => now(),
                    'total_amount' => $totalAmountCalculated, // **استخدام المبلغ المحسوب**
                    'status' => 'pending',
                    'shipping_address_id' => $shippingAddress->address_id,
                    'billing_address_id' => $shippingAddress->address_id, // بافتراض أنها نفسها حاليًا
                    'notes' => $request->input('notes'),
                    'shipping_method' => $request->input('shipping_method'),
                    'payment_method' => $request->input('payment.method'), // **تمت إضافة هذا العمود**
                ]);

                // 2. إنشاء الدفع وربطه بـ order_id
                $payment = Payment::create([
                    'user_id' => $user->user_id,
                    'order_id' => $order->order_id,
                    'amount' => $totalAmountCalculated, // **استخدام المبلغ المحسوب هنا أيضاً**
                    'payment_method' => $request->input('payment.method'),
                    'transaction_id' => $request->input('payment.transaction_id') ?: null,
                    'payment_status' => $request->input('payment.status'),
                    'card_number_last_four' => $request->input('payment.card_number_last_four') ?: null,
                    // 'cvv' لا يتم تخزينه هنا كما هو موصى به أمنيًا
                    'expiry_date' => $request->input('payment.expiry_date') ?: null,
                    'payment_date' => $request->input('payment.payment_date') ? Carbon::parse($request->input('payment.payment_date')) : now(),
                    'gateway_response' => $request->input('payment.gateway_response') ?: null,
                    'currency' => $request->input('payment.currency') ?: null,
                ]);

                // 3. ربط الطلب بمعرف الدفع
                $order->payment_id = $payment->payment_id; // **تأكد أن جدول orders لديه عمود payment_id**
                $order->save();

                // 4. إدخال المنتجات إلى order_items وتحديث المخزون
                foreach ($cartItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->order_id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'price_at_purchase' => $item->product->price,
                        'price_at_order' => $item->product->price, // يمكن أن يكون مختلفًا في حالات معينة
                        'subtotal' => $item->quantity * $item->product->price, // تأكد من وجود هذا العمود في جدول order_items
                    ]);
                    $item->product->decrement('stock_quantity', $item->quantity);
                }

                // حذف عناصر سلة التسوق بعد نجاح الطلب
                ShoppingCart::where('user_id', $user->user_id)->delete();

                // تحميل العلاقات للرد بالطلب الكامل
                $order->load(['user', 'orderItems.product', 'shippingAddress', 'payment']);

                return response()->json([
                    'message' => 'Order placed successfully',
                    'order' => $order,
                ], 201);
            });

        } catch (ValidationException $e) {
            DB::rollBack();
            Log::warning('Validation error for order placement by user ' . ($user->user_id ?? 'guest') . ': ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error placing order for user ' . ($user->user_id ?? 'guest') . ': ' . $e->getMessage(), ['exception' => $e, 'request_data' => $request->all()]);
            return response()->json([
                'message' => 'An error occurred while placing the order: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Order $order)
    {
        if (Auth::check() && (Auth::user()->user_id == $order->user_id || Auth::user()->is_admin)) {
            $order->load(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payment']);
            return response()->json($order);
        }
        return response()->json(['message' => 'Unauthorized to view this order'], 403);
    }

    /**
     * Update the specified order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Order $order)
    {
        try {
            if (!Auth::check() || !Auth::user()->is_admin) {
                return response()->json(['message' => 'Unauthorized to update orders'], 403);
            }

            $request->validate([
                'total_amount' => 'sometimes|required|numeric|min:0',
                'status' => 'sometimes|required|string|in:pending,processing,shipped,delivered,cancelled,refunded',
                'shipping_address_id' => 'sometimes|required|exists:addresses,address_id',
                'billing_address_id' => 'sometimes|required|exists:addresses,address_id',
                'payment_method' => 'sometimes|required|string|max:50',
                'payment_status' => 'sometimes|required|string|in:paid,unpaid,partially_paid,refunded',
                'shipping_method' => 'nullable|string|max:50',
                'tracking_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
            ]);

            $order->update($request->all());

            return response()->json([
                'message' => 'Order updated successfully',
                'order' => $order,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified order from storage.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Order $order)
    {
        try {
            if (!Auth::check() || !Auth::user()->is_admin) {
                return response()->json(['message' => 'Unauthorized to delete orders'], 403);
            }

            $order->delete();

            return response()->json([
                'message' => 'Order deleted successfully (soft deleted)',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}