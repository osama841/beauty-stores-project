<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Discount;
use Illuminate\Auth\Access\Response;

class DiscountPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Discount.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->is_admin) { // ****** مصحح: استخدام is_admin ******
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض أي نماذج خصومات.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض نموذج خصم معين.
     */
    public function view(?User $user, Discount $discount): bool
    {
        return $discount->is_active && $discount->starts_at <= now() && $discount->expires_at >= now();
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج خصومات.
     */
    public function create(User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء الخصومات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج خصم معين.
     */
    public function update(User $user, Discount $discount): bool
    {
        // فقط المشرفون يمكنهم تحديث الخصومات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج خصم معين.
     */
    public function delete(User $user, Discount $discount): bool
    {
        // فقط المشرفون يمكنهم حذف الخصومات.
        return false;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(User $user, Discount $discount): bool
    {
        return false;
    }

    public function forceDelete(User $user, Discount $discount): bool
    {
        return false;
    }
}