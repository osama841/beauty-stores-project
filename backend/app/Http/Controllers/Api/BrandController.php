<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $brands = Brand::all();
        return response()->json($brands);
    }

    /**
     * Store a newly created brand in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'slug' => 'required|string|max:100|unique:brands,slug',
                'description' => 'nullable|string',
                'logo_url' => 'nullable|url|max:255',
                'status' => 'string|in:active,inactive',
            ]);

            $brand = Brand::create($request->all());

            return response()->json([
                'message' => 'Brand created successfully',
                'brand' => $brand,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the brand.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified brand.
     *
     * @param  \App\Models\Brand  $brand
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    /**
     * Update the specified brand in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Brand  $brand
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Brand $brand)
    {
        try {
            $request->validate([
                'name' => 'sometimes|required|string|max:100',
                'slug' => 'sometimes|required|string|max:100|unique:brands,slug,' . $brand->brand_id . ',brand_id',
                'description' => 'nullable|string',
                'logo_url' => 'nullable|url|max:255',
                'status' => 'string|in:active,inactive',
            ]);

            $brand->update($request->all());

            return response()->json([
                'message' => 'Brand updated successfully',
                'brand' => $brand,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the brand.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified brand from storage.
     *
     * @param  \App\Models\Brand  $brand
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Brand $brand)
    {
        try {
            // المنتجات المرتبطة سيتم تعيين brand_id لها إلى NULL بسبب onDelete('set null') في الهجرة
            $brand->delete();

            return response()->json([
                'message' => 'Brand deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the brand.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}