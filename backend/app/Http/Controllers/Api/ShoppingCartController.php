<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShoppingCart;
use App\Models\Product; // للتحقق من المخزون
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth; // لاستخدام Auth::user()

class ShoppingCartController extends Controller
{
    /**
     * Display the shopping cart items for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $cartItems = ShoppingCart::where('user_id', $user->user_id)
                                 ->with('product') // تحميل تفاصيل المنتج
                                 ->get();

        // ****** حساب المبلغ الإجمالي للسلة ******
        $totalAmount = $cartItems->sum(function($item) {
            // تأكد أن product موجود وأن price هو رقم
            return $item->quantity * ($item->product ? (float)$item->product->price : 0);
        });

        return response()->json([
            'cart_items' => $cartItems,
            'total_amount' => $totalAmount, // ****** إرجاع المبلغ الإجمالي ******
        ]);
    }

    /**
     * Add a product to the shopping cart or update its quantity.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'quantity' => 'required|integer|min:1',
            ]);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $product = Product::find($request->product_id);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $cartItem = ShoppingCart::where('user_id', $user->user_id)
                                    ->where('product_id', $request->product_id)
                                    ->first();

            $newQuantity = $request->quantity;

            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $request->quantity;
                if ($product->stock_quantity < $newQuantity) {
                    return response()->json(['message' => 'Requested quantity exceeds product stock'], 400);
                }
                $cartItem->update(['quantity' => $newQuantity]);
            } else {
                if ($product->stock_quantity < $newQuantity) {
                    return response()->json(['message' => 'Requested quantity exceeds product stock'], 400);
                }
                $cartItem = ShoppingCart::create([
                    'user_id' => $user->user_id,
                    'product_id' => $request->product_id,
                    'quantity' => $newQuantity,
                     'added_at' => now(), // هذا الحقل غير موجود في هجرة shopping_cart التي قدمتها، يمكن إزالته أو إضافته للهجرة
                ]);
            }

            return response()->json([
                'message' => 'Product added/updated in cart successfully',
                'cart_item' => $cartItem->load('product'),
            ], 200); // 200 OK for update, 201 Created for new
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error adding/updating cart item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while adding/updating cart item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified shopping cart item.
     * (Typically not accessed directly, but for completeness)
     *
     * @param  \App\Models\ShoppingCart  $shoppingCart
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(ShoppingCart $shoppingCart)
    {
        if (auth()->check() && auth()->user()->user_id == $shoppingCart->user_id) {
            $shoppingCart->load('product');
            return response()->json($shoppingCart);
        }
        return response()->json(['message' => 'Unauthorized to view this cart item'], 403);
    }

    /**
     * Update the quantity of a shopping cart item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ShoppingCart  $shoppingCart
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, ShoppingCart $shoppingCart)
    {
        try {
            if (!auth()->check() || auth()->user()->user_id != $shoppingCart->user_id) {
                return response()->json(['message' => 'Unauthorized to update this cart item'], 403);
            }

            $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            $product = Product::find($shoppingCart->product_id);
            if (!$product) {
                return response()->json(['message' => 'Product not found for this cart item'], 404);
            }

            $newQuantity = $request->quantity;

            if ($newQuantity == 0) {
                $shoppingCart->delete();
                return response()->json(['message' => 'Product removed from cart successfully'], 204);
            }

            if ($product->stock_quantity < $newQuantity) {
                return response()->json(['message' => 'Requested quantity exceeds product stock'], 400);
            }

            $shoppingCart->update(['quantity' => $newQuantity]);

            return response()->json([
                'message' => 'Cart item quantity updated successfully',
                'cart_item' => $shoppingCart->load('product'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating cart item quantity: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating cart item quantity.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified shopping cart item from storage.
     *
     * @param  \App\Models\ShoppingCart  $shoppingCart
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(ShoppingCart $shoppingCart)
    {
        try {
            if (!auth()->check() || auth()->user()->user_id != $shoppingCart->user_id) {
                return response()->json(['message' => 'Unauthorized to delete this cart item'], 403);
            }

            $shoppingCart->delete();

            return response()->json([
                'message' => 'Cart item deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            \Log::error('Error deleting cart item: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the cart item.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
