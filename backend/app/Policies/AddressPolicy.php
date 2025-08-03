<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Address;
use Illuminate\Auth\Access\Response;

class AddressPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Address.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج عناوين (عرض قائمة العناوين).
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null; // المستخدم يجب أن يكون مصادق
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج عنوان معين.
     */
    public function view(?User $user, Address $address): bool
    {
        if (!$user) return false;
        return $user->user_id === $address->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج عناوين.
     */
    public function create(?User $user): bool
    {
        return $user !== null; // أي مستخدم مصادق يمكنه إنشاء عناوين
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج عنوان معين.
     */
    public function update(?User $user, Address $address): bool
    {
        if (!$user) return false;
        return $user->user_id === $address->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج عنوان معين.
     */
    public function delete(?User $user, Address $address): bool
    {
        if (!$user) return false;
        return $user->user_id === $address->user_id;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, Address $address): bool
    {
        return false;
    }

    public function forceDelete(?User $user, Address $address): bool
    {
        return false;
    }
}