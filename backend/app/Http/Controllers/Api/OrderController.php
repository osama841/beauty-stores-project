<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ShoppingCart; // سنحتاجه لإنشاء الطلبات من سلة التسوق
use App\Models\Product; // سنحتاجه للتحقق من المخزون
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // عرض الطلبات للمستخدم الحالي فقط أو جميع الطلبات إذا كان مسؤولاً
        if (auth()->check()) {
            if (auth()->user()->is_admin) {
                $orders = Order::with(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payments'])->get();
            } else {
                $orders = Order::where('user_id', auth()->user()->user_id)
                               ->with(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payments'])
                               ->get();
            }
            return response()->json($orders);
        }
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    /**
     * Store a newly created order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // هذه الدالة ستكون معقدة بعض الشيء لأنها تتضمن منطق إنشاء الطلب من سلة التسوق
        // والتحقق من المخزون وإنشاء عناصر الطلب
        try {
            $request->validate([
                'shipping_address_id' => 'required|exists:addresses,address_id',
                'billing_address_id' => 'required|exists:addresses,address_id',
                'payment_method' => 'required|string|max:50',
                'shipping_method' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
                // لا نطلب user_id هنا، سنأخذه من المستخدم المصادق
            ]);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // التأكد من أن العناوين تنتمي للمستخدم المصادق
            $shippingAddress = $user->addresses()->where('address_id', $request->shipping_address_id)->first();
            $billingAddress = $user->addresses()->where('address_id', $request->billing_address_id)->first();

            if (!$shippingAddress || !$billingAddress) {
                return response()->json(['message' => 'Invalid shipping or billing address for this user'], 403);
            }

            // جلب عناصر سلة التسوق للمستخدم
            $cartItems = ShoppingCart::where('user_id', $user->user_id)->get();

            if ($cartItems->isEmpty()) {
                return response()->json(['message' => 'Shopping cart is empty'], 400);
            }

            $totalAmount = 0;
            $orderItemsData = [];

            DB::beginTransaction(); // بدء معاملة قاعدة البيانات

            // التحقق من المخزون وحساب الإجمالي
            foreach ($cartItems as $cartItem) {
                $product = Product::find($cartItem->product_id);

                if (!$product || $product->stock_quantity < $cartItem->quantity) {
                    DB::rollBack(); // التراجع عن المعاملة
                    return response()->json(['message' => 'Product "' . $product->name . '" is out of stock or quantity requested is too high'], 400);
                }

                $subtotal = $product->price * $cartItem->quantity;
                $totalAmount += $subtotal;

                $orderItemsData[] = [
                    'product_id' => $product->product_id,
                    'quantity' => $cartItem->quantity,
                    'price_at_order' => $product->price,
                    'subtotal' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // تحديث المخزون
                $product->decrement('stock_quantity', $cartItem->quantity);
            }

            // إنشاء الطلب
            $order = Order::create([
                'user_id' => $user->user_id,
                'order_date' => now(),
                'total_amount' => $totalAmount,
                'status' => 'pending', // الحالة الأولية
                'shipping_address_id' => $request->shipping_address_id,
                'billing_address_id' => $request->billing_address_id,
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid', // الحالة الأولية
                'shipping_method' => $request->shipping_method,
                'notes' => $request->notes,
            ]);

            // إضافة عناصر الطلب
            $order->orderItems()->createMany($orderItemsData);

            // مسح سلة التسوق بعد إنشاء الطلب
            ShoppingCart::where('user_id', $user->user_id)->delete();

            DB::commit(); // تأكيد المعاملة

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('orderItems.product'), // تحميل تفاصيل المنتجات في عناصر الطلب
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred while creating the order.',
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
        // التأكد من أن المستخدم المصادق يملك الطلب أو أنه مسؤول
        if (auth()->check() && (auth()->user()->user_id == $order->user_id || auth()->user()->is_admin)) {
            $order->load(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payments']);
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
            // فقط المسؤول يمكنه تحديث الطلبات
            if (!auth()->check() || !auth()->user()->is_admin) {
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
            // فقط المسؤول يمكنه حذف الطلبات (حذف ناعم)
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json(['message' => 'Unauthorized to delete orders'], 403);
            }

            $order->delete(); // حذف ناعم

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