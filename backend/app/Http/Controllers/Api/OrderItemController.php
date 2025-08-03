<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
class OrderItemController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(OrderItem::class, 'orderItem');
    }

    /**
     * Display a listing of the order items.
     * (Usually accessed via an Order, but can be listed for admin)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('viewAny', OrderItem::class);
        
        $orderItems = OrderItem::with(['order', 'product'])->get();
        return response()->json($orderItems);
    }

    /**
     * Store a newly created order item in storage.
     * (Typically created when an Order is stored, not directly)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', OrderItem::class);
        
        // عادةً ما يتم إنشاء عناصر الطلب كجزء من عملية إنشاء الطلب (في OrderController->store)
        // لا يُنصح بإنشاء عناصر الطلب بشكل مباشر عبر API منفصلة لهذا الغرض
        return response()->json([
            'message' => 'Order items are created as part of the order creation process.',
            'tip' => 'Please create an order via the /api/orders endpoint.',
        ], 405); // 405 Method Not Allowed
    }

    /**
     * Display the specified order item.
     *
     * @param  \App\Models\OrderItem  $orderItem
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(OrderItem $orderItem)
    {
        $orderItem->load('order', 'product');
        return response()->json($orderItem);
    }

    /**
     * Update the specified order item in storage.
     * (Rarely updated directly, usually via order modifications for admin)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\OrderItem  $orderItem
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, OrderItem $orderItem)
    {
        try {
            $request->validate([
                'order_id' => 'sometimes|required|exists:orders,order_id',
                'product_id' => 'sometimes|required|exists:products,product_id',
                'quantity' => 'sometimes|required|integer|min:1',
                'price_at_order' => 'sometimes|required|numeric|min:0',
                'subtotal' => 'sometimes|required|numeric|min:0',
            ]);

            $orderItem->update($request->all());

            return response()->json([
                'message' => 'Order item updated successfully',
                'order_item' => $orderItem,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the order item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified order item from storage.
     * (Rarely deleted directly, usually via order modifications for admin)
     *
     * @param  \App\Models\OrderItem  $orderItem
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(OrderItem $orderItem)
    {
        try {
            $orderItem->delete();
            return response()->json([
                'message' => 'Order item deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the order item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}