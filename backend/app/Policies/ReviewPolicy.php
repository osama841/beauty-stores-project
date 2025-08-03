<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Review;
use Illuminate\Auth\Access\Response;

class ReviewPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Review.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج مراجعات.
     */
    public function viewAny(?User $user): bool
    {
        return true; // يمكن للجميع عرض المراجعات المعتمدة
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج مراجعة معين.
     */
    public function view(?User $user, Review $review): bool
    {
        // يمكن للمستخدم عرض مراجعته الخاصة أو المراجعات المعتمدة
        if (!$user) {
            return $review->is_approved; // المستخدمين غير المصادقين يمكنهم رؤية المراجعات المعتمدة فقط
        }
        return $user->user_id === $review->user_id || $review->is_approved;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء مراجعات.
     */
    public function create(?User $user): bool
    {
        return $user !== null; // أي مستخدم مصادق يمكنه إنشاء مراجعة
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث مراجعة معين.
     */
    public function update(?User $user, Review $review): bool
    {
        if (!$user) return false;
        // المستخدم يمكنه تحديث مراجعته الخاصة فقط
        return $user->user_id === $review->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف مراجعة معين.
     */
    public function delete(?User $user, Review $review): bool
    {
        if (!$user) return false;
        // المستخدم يمكنه حذف مراجعته الخاصة فقط
        return $user->user_id === $review->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه الموافقة على مراجعة.
     */
    public function approve(?User $user, Review $review): bool
    {
        if (!$user) return false;
        // فقط المشرفون يمكنهم الموافقة على المراجعات
        return false; // سيتم التعامل معها في before()
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, Review $review): bool
    {
        return false;
    }

    public function forceDelete(?User $user, Review $review): bool
    {
        return false;
    }
}