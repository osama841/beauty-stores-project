<?php

    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Models\Brand; // استيراد نموذج العلامة التجارية
    use Illuminate\Http\Request;
    use Illuminate\Validation\ValidationException;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Str; // استيراد Str facade

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
                    'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // لملف الشعار
                    'status' => 'string|in:active,inactive',
                ]);

                $logoFullPath = null;
                if ($request->hasFile('logo')) {
                    $logoPath = $request->file('logo')->store('brand_logos', 'public');
                    $logoFullPath = config('app.url') . '/storage/' . str_replace('\\', '/', $logoPath);
                }

                $brand = Brand::create([
                    'name' => $request->name,
                    'slug' => $request->slug,
                    'description' => $request->description,
                    'logo_url' => $logoFullPath,
                    'status' => $request->status,
                ]);

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
                \Log::error('Error creating brand: ' . $e->getMessage());
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
                    'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                    'logo_removed' => 'boolean', // للإشارة إلى إزالة الشعار الحالي
                    'status' => 'string|in:active,inactive',
                ]);

                $logoFullPath = $brand->logo_url;

                if ($request->hasFile('logo')) {
                    if ($brand->logo_url) {
                        $oldPath = Str::after($brand->logo_url, config('app.url') . '/storage/');
                        Storage::disk('public')->delete($oldPath);
                    }
                    $logoPath = $request->file('logo')->store('brand_logos', 'public');
                    $logoFullPath = config('app.url') . '/storage/' . str_replace('\\', '/', $logoPath);
                } elseif ($request->input('logo_removed')) {
                    if ($brand->logo_url) {
                        $oldPath = Str::after($brand->logo_url, config('app.url') . '/storage/');
                        Storage::disk('public')->delete($oldPath);
                    }
                    $logoFullPath = null;
                }

                $brand->update([
                    'name' => $request->name,
                    'slug' => $request->slug,
                    'description' => $request->description,
                    'logo_url' => $logoFullPath,
                    'status' => $request->status,
                ]);

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
                \Log::error('Error updating brand: ' . $e->getMessage());
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
                if ($brand->logo_url) {
                    $oldPath = Str::after($brand->logo_url, config('app.url') . '/storage/');
                    Storage::disk('public')->delete($oldPath);
                }
                $brand->delete();

                return response()->json([
                    'message' => 'Brand deleted successfully',
                ], 204);
            } catch (\Exception $e) {
                \Log::error('Error deleting brand: ' . $e->getMessage());
                return response()->json([
                    'message' => 'An error occurred while deleting the brand.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }
    