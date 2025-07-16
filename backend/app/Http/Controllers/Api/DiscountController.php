<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use  App\Http\Controllers\Api\UserController  ;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
class DiscountController extends Controller


{
    /**
     * Display a listing of the discounts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // يمكن للمستخدمين عرض الخصومات النشطة، والمسؤولين عرض جميع الخصومات
        if (auth()->check() && auth()->user()->is_admin) {
            $discounts = Discount::all();
        } else {
            $discounts = Discount::where('is_active', true)
                                 ->where(function ($query) {
                                     $query->whereNull('start_date')
                                           ->orWhere('start_date', '<=', now());
                                 })
                                 ->where(function ($query) {
                                     $query->whereNull('end_date')
                                           ->orWhere('end_date', '>=', now());
                                 })
                                 ->get();
        }
        return response()->json($discounts);
    }

    /**
     * Store a newly created discount in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // فقط المسؤول يمكنه إضافة خصومات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $request->validate([
                'code' => 'nullable|string|max:50|unique:discounts,code',
                'type' => 'required|string|in:percentage,fixed_amount,free_shipping',
                'value' => 'required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'min_amount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'is_active' => 'boolean',
            ]);

            $discount = Discount::create($request->all());

            return response()->json([
                'message' => 'Discount created successfully',
                'discount' => $discount,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the discount.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified discount.
     *
     * @param  \App\Models\Discount  $discount
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Discount $discount)
    {
        // يمكن للمستخدمين عرض الخصومات النشطة فقط، والمسؤولين عرض أي خصم
        if (auth()->check() && auth()->user()->is_admin) {
            return response()->json($discount);
        } elseif ($discount->is_active && ($discount->start_date === null || $discount->start_date <= now()) && ($discount->end_date === null || $discount->end_date >= now())) {
            return response()->json($discount);
        }
        return response()->json(['message' => 'Unauthorized or Discount not found/active'], 403);
    }

    /**
     * Update the specified discount in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Discount  $discount
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Discount $discount)
    {
        // فقط المسؤول يمكنه تحديث الخصومات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $request->validate([
                'code' => 'nullable|string|max:50|unique:discounts,code,' . $discount->discount_id . ',discount_id',
                'type' => 'sometimes|required|string|in:percentage,fixed_amount,free_shipping',
                'value' => 'sometimes|required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'min_amount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'is_active' => 'boolean',
            ]);

            $discount->update($request->all());

            return response()->json([
                'message' => 'Discount updated successfully',
                'discount' => $discount,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the discount.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified discount from storage.
     *
     * @param  \App\Models\Discount  $discount
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Discount $discount)
    {
        // فقط المسؤول يمكنه حذف الخصومات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $discount->delete();
            return response()->json([
                'message' => 'Discount deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the discount.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}