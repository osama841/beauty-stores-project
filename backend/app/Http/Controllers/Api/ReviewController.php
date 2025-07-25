<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product; // لربط المراجعة بالمنتج
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // لاستخدام Log

class ReviewController extends Controller
{
    /**
     * Display a listing of the reviews.
     * (Used for general review management in admin panel)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product']);

        // يمكن تصفية المراجعات حسب المنتج أو المستخدم أو الحالة
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('user_id')) {
            // فقط المسؤول يمكنه رؤية مراجعات مستخدمين آخرين
            if (!auth()->check() || (!auth()->user()->is_admin && auth()->user()->user_id != $request->user_id)) {
                return response()->json(['message' => 'Unauthorized to view reviews for this user'], 403);
            }
            $query->where('user_id', $request->user_id);
        } else {
            // إذا لم يتم تحديد user_id، اعرض جميع المراجعات للمسؤول، أو مراجعات المستخدم المصادق فقط
            if (auth()->check() && !auth()->user()->is_admin) {
                $query->where('user_id', auth()->user()->user_id);
            } elseif (!auth()->check()) {
                // إذا لم يكن هناك مستخدم مصادق، يمكن عرض المراجعات المعتمدة فقط
                $query->where('is_approved', true);
            }
        }

        if ($request->has('status')) { // تصفية حسب حالة الموافقة (للمسؤول)
            $query->where('is_approved', $request->status === 'approved');
        }

        $reviews = $query->orderBy('review_date', 'desc')->get(); // فرز حسب التاريخ
        return response()->json($reviews);
    }

    /**
     * Display a listing of the reviews for a specific product.
     * (Used by ProductDetailPage, publicly accessible for approved reviews)
     *
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexByProduct($productId) // ****** هذه هي الدالة التي كانت مفقودة ******
    {
        $reviews = Review::where('product_id', $productId)
                         ->where('is_approved', true) // عرض المراجعات المعتمدة فقط
                         ->with('user:user_id,username') // جلب اسم المستخدم فقط
                         ->orderBy('review_date', 'desc')
                         ->get();
        return response()->json($reviews);
    }

    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'nullable|string', // حافظنا على nullable هنا
            ]);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated to add a review'], 401);
            }

            // التأكد من أن المستخدم لم يقم بتقييم هذا المنتج من قبل (اختياري، حسب سياسة المتجر)
            $existingReview = Review::where('user_id', $user->user_id)
                                    ->where('product_id', $request->product_id)
                                    ->first();
            if ($existingReview) {
                return response()->json(['message' => 'You have already reviewed this product.'], 409); // 409 Conflict
            }

            $review = Review::create([
                'product_id' => $request->product_id,
                'user_id' => $user->user_id,
                'rating' => $request->rating,
                'title' => $request->title,
                'comment' => $request->comment,
                'is_approved' => $user->is_admin ? true : false, // الموافقة التلقائية للمسؤول، أو انتظار الموافقة
                'ip_address' => $request->ip(),
                'review_date' => now(),
            ]);

            return response()->json([
                'message' => 'Review created successfully. It may require admin approval.',
                'review' => $review,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error submitting review: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the review.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified review.
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Review $review)
    {
        // يمكن للمستخدمين رؤية مراجعاتهم الخاصة أو المراجعات المعتمدة، والمسؤولين رؤية أي مراجعة
        if (auth()->check() && (auth()->user()->is_admin || auth()->user()->user_id == $review->user_id || $review->is_approved)) {
            $review->load('user', 'product');
            return response()->json($review);
        } elseif (!auth()->check() && $review->is_approved) {
            // للمستخدمين غير المصادقين، فقط المراجعات المعتمدة
            $review->load('user', 'product');
            return response()->json($review);
        }
        return response()->json(['message' => 'Unauthorized to view this review or review not approved'], 403);
    }

    /**
     * Update the specified review in storage.
     * (Can be updated by the user who wrote it, or by an admin)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Review $review)
    {
        // فقط المستخدم الذي كتب المراجعة أو المسؤول يمكنه تحديثها
        if (!auth()->check() || (auth()->user()->user_id != $review->user_id && !auth()->user()->is_admin)) {
            return response()->json(['message' => 'Unauthorized to update this review'], 403);
        }

        try {
            $request->validate([
                'rating' => 'sometimes|required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'nullable|string',
                'is_approved' => 'boolean', // يمكن للمسؤول فقط تحديث هذه القيمة
            ]);

            $updateData = $request->all();

            // إذا كان المستخدم ليس مسؤولاً، لا يمكنه تغيير is_approved
            if (!auth()->user()->is_admin && isset($updateData['is_approved'])) {
                unset($updateData['is_approved']);
            }

            $review->update($updateData);

            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $review,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the review.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a specific review.
     * (Accessible by authenticated admins only)
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Review $review)
    {
        // تأكد أن المستخدم الحالي مسؤول (يمكن استخدام Laravel Policies هنا أيضاً)
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to approve reviews'], 403);
        }

        try {
            $review->is_approved = true;
            $review->save();
            return response()->json(['message' => 'Review approved successfully', 'review' => $review]);
        } catch (\Exception $e) {
            Log::error('Error approving review: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred while approving the review.'], 500);
        }
    }


    /**
     * Remove the specified review from storage.
     * (Can be deleted by the user who wrote it, or by an admin)
     *
     * @param  \App\Models\Review  $review
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Review $review)
    {
        // فقط المستخدم الذي كتب المراجعة أو المسؤول يمكنه حذفها
        if (!auth()->check() || (auth()->user()->user_id != $review->user_id && !auth()->user()->is_admin)) {
            return response()->json(['message' => 'Unauthorized to delete this review'], 403);
        }

        try {
            $review->delete();
            return response()->json([
                'message' => 'Review deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the review.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
