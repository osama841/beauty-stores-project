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
    public function __construct()
    {
        $this->authorizeResource(Order::class, 'order');
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        try {
            $query = Order::with(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payment']);

            if (!$user->is_admin) {
                $query->where('user_id', $user->id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $perPage = $request->input('per_page', 15);
            $orders = $query->paginate($perPage);

            return response()->json($orders, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage(), ['exception' => $e, 'user_id' => $user->user_id ?? 'guest']);
            return response()->json([
                'message' => 'An error occurred while fetching orders.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();

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
                'payment.card_number' => 'required_if:payment.method,credit_card|nullable|string|max:16',
                'payment.expiry_date' => 'required_if:payment.method,credit_card|nullable|string|max:7',
                'payment.cvv' => 'nullable|string|max:4',
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

                if (abs($request->input('payment.amount') - $totalAmountCalculated) > 0.01) {
                    Log::warning('Frontend total amount mismatch for user: ' . $user->user_id, [
                        'frontend_amount' => $request->input('payment.amount'),
                        'calculated_amount' => $totalAmountCalculated,
                        'cart_items' => $cartItems->toArray(),
                    ]);
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

                $order = Order::create([
                    'user_id' => $user->user_id,
                    'order_date' => now(),
                    'total_amount' => $totalAmountCalculated,
                    'status' => 'pending',
                    'shipping_address_id' => $shippingAddress->address_id,
                    'billing_address_id' => $shippingAddress->address_id,
                    'notes' => $request->input('notes'),
                    'shipping_method' => $request->input('shipping_method'),
                    'payment_method' => $request->input('payment.method'),
                ]);

                $payment = Payment::create([
                    'user_id' => $user->user_id,
                    'order_id' => $order->order_id,
                    'amount' => $totalAmountCalculated,
                    'payment_method' => $request->input('payment.method'),
                    'transaction_id' => $request->input('payment.transaction_id') ?: null,
                    'payment_status' => $request->input('payment.status'),
                    'card_number_last_four' => $request->input('payment.card_number_last_four') ?: null,
                    'expiry_date' => $request->input('payment.expiry_date') ?: null,
                    'payment_date' => $request->input('payment.payment_date') ? Carbon::parse($request->input('payment.payment_date')) : now(),
                    'gateway_response' => $request->input('payment.gateway_response') ?: null,
                    'currency' => $request->input('payment.currency') ?: null,
                ]);

                $order->payment_id = $payment->payment_id;
                $order->save();

                foreach ($cartItems as $item) {
                    OrderItem::create([
                        'order_id' => $order->order_id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'price_at_purchase' => $item->product->price,
                        'price_at_order' => $item->product->price,
                        'subtotal' => $item->quantity * $item->product->price,
                    ]);
                    $item->product->decrement('stock_quantity', $item->quantity);
                }

                ShoppingCart::where('user_id', $user->user_id)->delete();

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

    public function show(Order $order)
    {
        $order->load(['user', 'shippingAddress', 'billingAddress', 'orderItems.product', 'payment']);
        return response()->json($order);
    }

    public function update(Request $request, Order $order)
    {
        try {
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

    public function destroy(Order $order)
    {
        try {
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