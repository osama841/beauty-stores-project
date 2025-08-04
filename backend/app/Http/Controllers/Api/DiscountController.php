<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class DiscountController extends Controller
{
    /**
     * Display a listing of the discounts.
     */
    public function index()
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to view discounts.'], 403);
        }
        $discounts = Discount::orderBy('created_at', 'desc')->get();
        return response()->json($discounts);
    }

    /**
     * Store a new discount code.
     */
    public function store(Request $request)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to create discounts.'], 403);
        }
        try {
            $request->validate([
                'code' => 'required|string|max:50|unique:discounts,code',
                'type' => 'required|string|in:percentage,fixed_amount,free_shipping',
                'value' => 'required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'min_amount' => 'numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1', // ****** تصحيح: مطابقة مع الهجرة ******
                'is_active' => 'boolean',
            ]);
            $discount = Discount::create($request->all());
            return response()->json(['message' => 'Discount created successfully', 'discount' => $discount], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error creating discount: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while creating the discount.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show a specific discount.
     */
    public function show(Discount $discount)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to view discounts.'], 403);
        }
        return response()->json($discount);
    }

    /**
     * Update a discount.
     */
    public function update(Request $request, Discount $discount)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to update discounts.'], 403);
        }
        try {
            $request->validate([
                'code' => 'sometimes|required|string|max:50|unique:discounts,code,' . $discount->discount_id . ',discount_id',
                'type' => 'sometimes|required|string|in:percentage,fixed_amount,free_shipping',
                'value' => 'sometimes|required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'min_amount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1', // ****** تصحيح: مطابقة مع الهجرة ******
                'is_active' => 'boolean',
            ]);
            $discount->update($request->all());
            return response()->json(['message' => 'Discount updated successfully', 'discount' => $discount]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating discount: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while updating the discount.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a discount.
     */
    public function destroy(Discount $discount)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to delete discounts.'], 403);
        }
        $discount->delete();
        return response()->json(['message' => 'Discount deleted successfully'], 204);
    }

    /**
     * Apply a discount code.
     */
    public function apply(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
                'subtotal' => 'required|numeric|min:0',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        }

        $discount = Discount::where('code', $request->code)
                            ->where('is_active', true)
                            ->where(function($query) {
                                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
                            })
                            ->where(function($query) {
                                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
                            })
                            ->where(function($query) {
                                $query->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'); // ****** تصحيح: مطابقة مع الهجرة ******
                            })
                            ->first();

        if (!$discount) {
            return response()->json(['message' => 'Invalid or expired discount code.'], 404);
        }

        if ($request->subtotal < $discount->min_amount) {
            return response()->json(['message' => 'Minimum purchase amount of $' . number_format($discount->min_amount, 2) . ' not met.'], 400);
        }

        $discountedAmount = 0;
        if ($discount->type === 'percentage') {
            $discountedAmount = $request->subtotal * ($discount->value / 100);
        } elseif ($discount->type === 'fixed_amount') {
            $discountedAmount = $discount->value;
        }

        $finalAmount = max(0, $request->subtotal - $discountedAmount);

        return response()->json([
            'message' => 'Discount applied successfully',
            'discount' => $discount,
            'discounted_amount' => $discountedAmount,
            'final_amount' => $finalAmount,
        ]);
    }
}
