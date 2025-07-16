<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class ProductAttributeController extends Controller
{
    /**
     * Display a listing of the product attributes.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // فقط المسؤول يمكنه عرض جميع سمات المنتجات
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ProductAttribute::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $attributes = $query->get();
        return response()->json($attributes);
    }

    /**
     * Store a newly created product attribute in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // فقط المسؤول يمكنه إضافة سمات المنتجات
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'attribute_name' => 'required|string|max:100',
                'attribute_value' => 'required|string|max:255',
            ]);

            // التحقق من التفرد (product_id, attribute_name, attribute_value)
            $exists = ProductAttribute::where('product_id', $validated['product_id'])
                ->where('attribute_name', $validated['attribute_name'])
                ->where('attribute_value', $validated['attribute_value'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This attribute with this value already exists for this product.',
                ], 409);
            }

            $productAttribute = ProductAttribute::create($validated);

            return response()->json([
                'message' => 'Product attribute created successfully',
                'product_attribute' => $productAttribute,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the product attribute.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product attribute.
     *
     * @param  \App\Models\ProductAttribute  $productAttribute
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(ProductAttribute $productAttribute)
    {
        // فقط المسؤول يمكنه عرض سمات المنتجات
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $productAttribute->load('product');
        return response()->json($productAttribute);
    }

    /**
     * Update the specified product attribute in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProductAttribute  $productAttribute
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, ProductAttribute $productAttribute)
    {
        // فقط المسؤول يمكنه تحديث سمات المنتجات
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'product_id' => 'sometimes|required|exists:products,product_id',
                'attribute_name' => 'sometimes|required|string|max:100',
                'attribute_value' => 'sometimes|required|string|max:255',
            ]);

            $data = [
                'product_id' => $validated['product_id'] ?? $productAttribute->product_id,
                'attribute_name' => $validated['attribute_name'] ?? $productAttribute->attribute_name,
                'attribute_value' => $validated['attribute_value'] ?? $productAttribute->attribute_value,
            ];

            // التحقق من التفرد عند التحديث
            $exists = ProductAttribute::where('product_id', $data['product_id'])
                ->where('attribute_name', $data['attribute_name'])
                ->where('attribute_value', $data['attribute_value'])
                ->where('attribute_id', '!=', $productAttribute->attribute_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This attribute with this value already exists for this product.',
                ], 409);
            }

            $productAttribute->update($validated);

            return response()->json([
                'message' => 'Product attribute updated successfully',
                'product_attribute' => $productAttribute,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the product attribute.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product attribute from storage.
     *
     * @param  \App\Models\ProductAttribute  $productAttribute
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(ProductAttribute $productAttribute)
    {
        // فقط المسؤول يمكنه حذف سمات المنتجات
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $productAttribute->delete();
            return response()->json([
                'message' => 'Product attribute deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the product attribute.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}