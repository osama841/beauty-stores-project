<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Order.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج طلبات (عرض قائمة الطلبات).
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null; // المستخدم يجب أن يكون مصادق
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج طلب معين.
     */
    public function view(?User $user, Order $order): bool
    {
        if (!$user) return false;
        return $user->user_id === $order->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج طلبات.
     */
    public function create(?User $user): bool
    {
        return $user !== null; // أي مستخدم مصادق يمكنه إنشاء طلبات
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج طلب معين.
     */
    public function update(?User $user, Order $order): bool
    {
        if (!$user) return false;
        // فقط المشرفون يمكنهم تحديث الطلبات (مثلاً لتغيير الحالة).
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج طلب معين.
     */
    public function delete(?User $user, Order $order): bool
    {
        if (!$user) return false;
        // فقط المشرفون يمكنهم حذف (حذف ناعم) الطلبات.
        return false;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, Order $order): bool
    {
        return false;
    }

    public function forceDelete(?User $user, Order $order): bool
    {
        return false;
    }
}