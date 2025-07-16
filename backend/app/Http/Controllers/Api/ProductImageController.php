<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductImage;
use App\Models\Product; // للتحقق من وجود المنتج
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage; // لرفع الملفات

class ProductImageController extends Controller
{
    /**
     * Display a listing of the product images.
     * (Typically accessed via a product, but can be listed for admin)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // فقط المسؤول يمكنه عرض جميع صور المنتجات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ProductImage::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $images = $query->get();
        return response()->json($images);
    }

    /**
     * Store a newly created product image in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // فقط المسؤول يمكنه إضافة صور المنتجات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'image_file' => 'required_without:image_url|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // يمكن رفع ملف صورة
                'image_url' => 'required_without:image_file|nullable|url|max:255', // أو توفير رابط صورة
                'thumbnail_url' => 'nullable|url|max:255',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'integer|min:0',
            ]);

            $imageUrl = $request->image_url;
            $thumbnailUrl = $request->thumbnail_url;

            // إذا تم رفع ملف صورة
            if ($request->hasFile('image_file')) {
                $imageFile = $request->file('image_file');
                $path = $imageFile->store('product_images', 'public'); // تخزين في storage/app/public/product_images

                $imageUrl = Storage::url($path); // الحصول على الرابط العام
                // يمكنك هنا إنشاء صورة مصغرة وتخزينها
                // مثال: $thumbnailUrl = Storage::url(Storage::putFile('product_thumbnails', $imageFile, 'public'));
            }

            $productImage = ProductImage::create([
                'product_id' => $request->product_id,
                'image_url' => $imageUrl,
                'thumbnail_url' => $thumbnailUrl,
                'alt_text' => $request->alt_text,
                'sort_order' => $request->sort_order ?? 0,
            ]);

            return response()->json([
                'message' => 'Product image created successfully',
                'product_image' => $productImage,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the product image.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product image.
     *
     * @param  \App\Models\ProductImage  $productImage
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(ProductImage $productImage)
    {
        // فقط المسؤول يمكنه عرض صور المنتجات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $productImage->load('product');
        return response()->json($productImage);
    }

    /**
     * Update the specified product image in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProductImage  $productImage
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, ProductImage $productImage)
    {
        // فقط المسؤول يمكنه تحديث صور المنتجات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $request->validate([
                'product_id' => 'sometimes|required|exists:products,product_id',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // يمكن رفع ملف صورة جديد
                'image_url' => 'nullable|url|max:255',
                'thumbnail_url' => 'nullable|url|max:255',
                'alt_text' => 'nullable|string|max:255',
                'sort_order' => 'integer|min:0',
            ]);

            $updateData = $request->except(['image_file']); // استبعاد ملف الصورة من التحديث المباشر

            // إذا تم رفع ملف صورة جديد
            if ($request->hasFile('image_file')) {
                // حذف الصورة القديمة إذا كانت موجودة وتخزينها محليًا
                if ($productImage->image_url && str_contains($productImage->image_url, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $productImage->image_url));
                }

                $imageFile = $request->file('image_file');
                $path = $imageFile->store('product_images', 'public');
                $updateData['image_url'] = Storage::url($path);
                // تحديث الصورة المصغرة إذا لزم الأمر
            } elseif ($request->has('image_url')) {
                // إذا تم توفير رابط URL مباشر، استخدمه
                $updateData['image_url'] = $request->image_url;
            }

            $productImage->update($updateData);

            return response()->json([
                'message' => 'Product image updated successfully',
                'product_image' => $productImage,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the product image.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product image from storage.
     *
     * @param  \App\Models\ProductImage  $productImage
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(ProductImage $productImage)
    {
        // فقط المسؤول يمكنه حذف صور المنتجات
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // حذف الملف المادي إذا كان مخزنًا محليًا
            if ($productImage->image_url && str_contains($productImage->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $productImage->image_url));
            }
            if ($productImage->thumbnail_url && str_contains($productImage->thumbnail_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $productImage->thumbnail_url));
            }

            $productImage->delete();

            return response()->json([
                'message' => 'Product image deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the product image.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}