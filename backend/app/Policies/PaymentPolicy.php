<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Auth\Access\Response;

class PaymentPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Payment.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج مدفوعات.
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null; // المستخدم يمكنه عرض مدفوعاته الخاصة
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج دفع معين.
     */
    public function view(?User $user, Payment $payment): bool
    {
        if (!$user) return false;
        return $user->user_id === $payment->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء مدفوعات.
     */
    public function create(?User $user): bool
    {
        return $user !== null; // أي مستخدم مصادق يمكنه إنشاء دفع
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث دفع معين.
     */
    public function update(?User $user, Payment $payment): bool
    {
        if (!$user) return false;
        // المستخدم لا يمكنه تحديث المدفوعات المكتملة
        return $user->user_id === $payment->user_id && $payment->status !== 'completed';
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف دفع معين.
     */
    public function delete(?User $user, Payment $payment): bool
    {
        if (!$user) return false;
        // المستخدم لا يمكنه حذف المدفوعات المكتملة
        return $user->user_id === $payment->user_id && $payment->status !== 'completed';
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إلغاء دفع معين.
     */
    public function cancel(?User $user, Payment $payment): bool
    {
        if (!$user) return false;
        return $user->user_id === $payment->user_id && $payment->status === 'pending';
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, Payment $payment): bool
    {
        return false;
    }

    public function forceDelete(?User $user, Payment $payment): bool
    {
        return false;
    }
} 