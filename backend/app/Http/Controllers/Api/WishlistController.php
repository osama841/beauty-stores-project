<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\upport\Facades\Log;

class WishlistController extends Controller
{
    /**
     * Display the user's wishlist.
     */
    public function index()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $wishlistItems = Wishlist::where('user_id', Auth::id())
                                ->with('product')
                                ->orderBy('created_at', 'desc')
                                ->get();
        return response()->json($wishlistItems);
    }

    /**
     * Add a product to the wishlist.
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        try {
            $request->validate(['product_id' => 'required|exists:products,product_id']);
            
            $wishlistItem = Wishlist::firstOrCreate([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
            ]);
            
            return response()->json(['message' => 'Product added to wishlist.', 'item' => $wishlistItem], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy($productId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $deleted = Wishlist::where('user_id', Auth::id())
                           ->where('product_id', $productId)
                           ->delete();
                           
        if ($deleted) {
            return response()->json(['message' => 'Product removed from wishlist.'], 204);
        }
        
        return response()->json(['message' => 'Item not found in wishlist.'], 404);
    }
}
