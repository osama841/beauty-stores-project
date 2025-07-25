<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     * (Publicly accessible, supports filtering, sorting, and pagination)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand']);

        // Filtering - التصفية (تطبيق الشرط فقط إذا كانت القيمة موجودة وغير فارغة)
        if ($request->filled('category_id')) { // ****** استخدام filled() ******
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('brand_id')) { // ****** استخدام filled() ******
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->filled('min_price')) { // ****** استخدام filled() ******
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) { // ****** استخدام filled() ******
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('search')) { // ****** استخدام filled() ******
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('short_description', 'like', '%' . $request->search . '%');
            });
        }

        // Sorting - الفرز
        $sort_by = $request->get('sort_by', 'created_at');
        $sort_order = $request->get('sort_order', 'desc');
        $query->orderBy($sort_by, $sort_order);

        // Pagination - تقسيم الصفحات
        $perPage = $request->get('per_page', 10);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:products,slug',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'compare_at_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'sku' => 'nullable|string|max:100|unique:products,sku',
                'weight' => 'nullable|numeric|min:0',
                'length' => 'nullable|numeric|min:0',
                'width' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'category_id' => 'required|exists:categories,category_id',
                'brand_id' => 'required|exists:brands,brand_id',
                'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'additional_images' => 'nullable|array',
                'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'is_featured' => 'boolean',
                'status' => 'string|in:active,draft,archived',
            ]);

            $mainImagePath = null;
            if ($request->hasFile('main_image')) {
                $imagePath = $request->file('main_image')->store('product_images', 'public');
                $mainImagePath = config('app.url') . '/storage/' . str_replace('\\', '/', $imagePath);
            }

            $product = Product::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'price' => $request->price,
                'compare_at_price' => $request->compare_at_price,
                'cost_price' => $request->cost_price,
                'stock_quantity' => $request->stock_quantity,
                'sku' => $request->sku,
                'weight' => $request->weight,
                'length' => $request->length,
                'width' => $request->width,
                'height' => $request->height,
                'category_id' => $request->category_id,
                'brand_id' => $request->brand_id,
                'main_image_url' => $mainImagePath,
                'is_featured' => $request->is_featured ?? false,
                'status' => $request->status,
            ]);

            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $file) {
                    $additionalImagePath = $file->store('product_images/additional', 'public');
                    ProductImage::create([
                        'product_id' => $product->product_id,
                        'image_url' => config('app.url') . '/storage/' . str_replace('\\', '/', $additionalImagePath),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'images', 'attributes', 'reviews.user']);
        return response()->json($product);
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product)
    {
        try {
            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'slug' => 'sometimes|required|string|max:255|unique:products,slug,' . $product->product_id . ',product_id',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'sometimes|required|numeric|min:0',
                'compare_at_price' => 'nullable|numeric|min:0',
                'cost_price' => 'nullable|numeric|min:0',
                'stock_quantity' => 'sometimes|required|integer|min:0',
                'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->product_id . ',product_id',
                'weight' => 'nullable|numeric|min:0',
                'length' => 'nullable|numeric|min:0',
                'width' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'category_id' => 'sometimes|required|exists:categories,category_id',
                'brand_id' => 'required|exists:brands,brand_id',
                'main_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'main_image_removed' => 'boolean',
                'additional_images' => 'nullable|array',
                'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'removed_additional_image_ids' => 'nullable|array',
                'removed_additional_image_ids.*' => 'exists:product_images,image_id',
                'is_featured' => 'boolean',
                'status' => 'string|in:active,draft,archived',
            ]);

            $mainImageFullPath = $product->main_image_url;

            if ($request->hasFile('main_image')) {
                if ($product->main_image_url) {
                    $oldPath = Str::after($product->main_image_url, config('app.url') . '/storage/');
                    Storage::disk('public')->delete($oldPath);
                }
                $imagePath = $request->file('main_image')->store('product_images', 'public');
                $mainImageFullPath = config('app.url') . '/storage/' . str_replace('\\', '/', $imagePath);
            } elseif ($request->input('main_image_removed')) {
                if ($product->main_image_url) {
                    $oldPath = Str::after($product->main_image_url, config('app.url') . '/storage/');
                    Storage::disk('public')->delete($oldPath);
                }
                $mainImageFullPath = null;
            }

            $product->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'price' => $request->price,
                'compare_at_price' => $request->compare_at_price,
                'cost_price' => $request->cost_price,
                'stock_quantity' => $request->stock_quantity,
                'sku' => $request->sku,
                'weight' => $request->weight,
                'length' => $request->length,
                'width' => $request->width,
                'height' => $request->height,
                'category_id' => $request->category_id,
                'brand_id' => $request->brand_id,
                'main_image_url' => $mainImageFullPath,
                'is_featured' => $request->is_featured ?? false,
                'status' => $request->status,
            ]);

            if ($request->hasFile('additional_images')) {
                foreach ($request->file('additional_images') as $file) {
                    $additionalImagePath = $file->store('product_images/additional', 'public');
                    ProductImage::create([
                        'product_id' => $product->product_id,
                        'image_url' => config('app.url') . '/storage/' . str_replace('\\', '/', $additionalImagePath),
                    ]);
                }
            }

            if ($request->has('removed_additional_image_ids')) {
                foreach ($request->input('removed_additional_image_ids') as $imageId) {
                    $productImage = ProductImage::find($imageId);
                    if ($productImage && $productImage->product_id === $product->product_id) {
                        $oldPath = Str::after($productImage->image_url, config('app.url') . '/storage/');
                        Storage::disk('public')->delete($oldPath);
                        $productImage->delete();
                    }
                }
            }

            return response()->json([
                'message' => 'Product updated successfully',
                'product' => $product,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product)
    {
        try {
            if ($product->main_image_url) {
                $oldPath = Str::after($product->main_image_url, config('app.url') . '/storage/');
                Storage::disk('public')->delete($oldPath);
            }
            foreach ($product->images as $image) {
                $oldPath = Str::after($image->image_url, config('app.url') . '/storage/');
                Storage::disk('public')->delete($oldPath);
                $image->delete();
            }
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            \Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
