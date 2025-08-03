<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ShoppingCart;
use Illuminate\Auth\Access\Response;

class ShoppingCartPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ ShoppingCart.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج سلة تسوق.
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null; // المستخدم يجب أن يكون مصادق
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج سلة تسوق معين.
     */
    public function view(?User $user, ShoppingCart $cart): bool
    {
        if (!$user) return false;
        return $user->user_id === $cart->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء عناصر في سلة التسوق.
     */
    public function create(?User $user): bool
    {
        return $user !== null; // أي مستخدم مصادق يمكنه إضافة منتجات لسلته
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث عنصر في سلة التسوق.
     */
    public function update(?User $user, ShoppingCart $cart): bool
    {
        if (!$user) return false;
        return $user->user_id === $cart->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف عنصر من سلة التسوق.
     */
    public function delete(?User $user, ShoppingCart $cart): bool
    {
        if (!$user) return false;
        return $user->user_id === $cart->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تفريغ سلة التسوق.
     */
    public function clear(?User $user): bool
    {
        return $user !== null; // المستخدم يمكنه تفريغ سلته الخاصة
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, ShoppingCart $cart): bool
    {
        return false;
    }

    public function forceDelete(?User $user, ShoppingCart $cart): bool
    {
        return false;
    }
}