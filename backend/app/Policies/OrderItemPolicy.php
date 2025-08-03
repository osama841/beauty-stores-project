<?php

namespace App\Policies;

use App\Models\User;
use App\Models\OrderItem;
use Illuminate\Auth\Access\Response;

class OrderItemPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ OrderItem.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج عناصر طلب.
     */
    public function viewAny(User $user): bool
    {
        return true; // المستخدم يمكنه عرض عناصر طلباته
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج عنصر طلب معين.
     */
    public function view(User $user, OrderItem $orderItem): bool
    {
        return $user->user_id === $orderItem->order->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء عناصر طلب.
     */
    public function create(User $user): bool
    {
        return true; // أي مستخدم مصادق يمكنه إنشاء عناصر طلب
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث عنصر طلب معين.
     */
    public function update(User $user, OrderItem $orderItem): bool
    {
        // المستخدم لا يمكنه تحديث عناصر الطلبات المكتملة
        return $user->user_id === $orderItem->order->user_id && $orderItem->order->status !== 'completed';
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف عنصر طلب معين.
     */
    public function delete(User $user, OrderItem $orderItem): bool
    {
        // المستخدم لا يمكنه حذف عناصر الطلبات المكتملة
        return $user->user_id === $orderItem->order->user_id && $orderItem->order->status !== 'completed';
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(User $user, OrderItem $orderItem): bool
    {
        return false;
    }

    public function forceDelete(User $user, OrderItem $orderItem): bool
    {
        return false;
    }
} 