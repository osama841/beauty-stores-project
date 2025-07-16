<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str; // استيراد Str facade لتوليد الـ slug

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $categories = Category::with('parent', 'children')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'slug' => 'required|string|max:100|unique:categories,slug',
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:categories,category_id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'status' => 'string|in:active,inactive',
            ]);

            $imageFullPath = null; // سيحتوي على الرابط الكامل للصورة

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('category_images', 'public'); // تخزين الصورة
                // بناء الرابط الكامل يدوياً لضمان صحته
                $imageFullPath = config('app.url') . '/storage/' . str_replace('\\', '/', $imagePath); // ****** التعديل هنا ******
            }

            $category = Category::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'image_url' => $imageFullPath, // حفظ الرابط الكامل
                'status' => $request->status,
            ]);

            return response()->json([
                'message' => 'Category created successfully',
                'category' => $category,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the category.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified category.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Category $category)
    {
        $category->load('parent', 'children');
        return response()->json($category);
    }

    /**
     * Update the specified category in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Category $category)
    {
        try {
            $request->validate([
                'name' => 'sometimes|required|string|max:100',
                'slug' => 'sometimes|required|string|max:100|unique:categories,slug,' . $category->category_id . ',category_id',
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:categories,category_id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'status' => 'string|in:active,inactive',
            ]);

            $imageFullPath = $category->image_url; // احتفظ بالرابط الحالي افتراضيا

            if ($request->hasFile('image')) { // إذا تم رفع ملف جديد
                // حذف الصورة القديمة إذا كانت موجودة
                if ($category->image_url) {
                    // استخراج المسار النسبي من الرابط الكامل وحذفها
                    $oldPath = Str::after($category->image_url, config('app.url') . '/storage/'); // ****** تعديل هنا ******
                    Storage::disk('public')->delete($oldPath);
                }
                $imagePath = $request->file('image')->store('category_images', 'public');
                $imageFullPath = config('app.url') . '/storage/' . str_replace('\\', '/', $imagePath); // ****** التعديل هنا ******
            } elseif ($request->input('image_removed')) { // إذا طلب المستخدم إزالة الصورة
                if ($category->image_url) {
                    $oldPath = Str::after($category->image_url, config('app.url') . '/storage/'); // ****** تعديل هنا ******
                    Storage::disk('public')->delete($oldPath);
                }
                $imageFullPath = null; // تعيين الرابط إلى null
            }


            $category->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'image_url' => $imageFullPath, // حفظ الرابط الكامل
                'status' => $request->status,
            ]);

            return response()->json([
                'message' => 'Category updated successfully',
                'category' => $category,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the category.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified category from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Category $category)
    {
        try {
            // حذف الصورة المرتبطة قبل حذف القسم
            if ($category->image_url) {
                $oldPath = Str::after($category->image_url, config('app.url') . '/storage/'); // ****** تعديل هنا ******
                Storage::disk('public')->delete($oldPath);
            }
            $category->delete();

            return response()->json([
                'message' => 'Category deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the category.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
