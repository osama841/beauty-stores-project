<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * دالة Before: تُنفذ قبل أي دالة صلاحية أخرى في هذا الـ Policy.
     * تسمح للمستخدمين المشرفين (is_admin = true) بتجاوز جميع الصلاحيات الأخرى.
     *
     * @param  \App\Models\User  $user  المستخدم الذي يحاول تنفيذ الإجراء.
     * @param  string  $ability  اسم الصلاحية التي يتم التحقق منها.
     * @return bool|null
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض أي نماذج (عرض قائمة المستخدمين).
     */
    public function viewAny(?User $user): bool
    {
        // بناءً على before، هذه الدالة تُستدعى فقط للمستخدمين العاديين.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه عرض نموذج مستخدم معين.
     */
    public function view(?User $user, User $model): bool
    {
        if (!$user) return false;
        // المستخدم العادي يمكنه عرض ملفه الشخصي فقط.
        return $user->user_id === $model->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج (إنشاء مستخدمين جدد).
     */
    public function create(?User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء مستخدمين.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج مستخدم معين.
     */
    public function update(?User $user, User $model): bool
    {
        if (!$user) return false;
        // المستخدم العادي يمكنه تحديث ملفه الشخصي فقط.
        return $user->user_id === $model->user_id;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج مستخدم معين.
     */
    public function delete(?User $user, User $model): bool
    {
        if (!$user) return false;
        // فقط المشرفون يمكنهم حذف المستخدمين، ولا يمكن للمشرف حذف حسابه الخاص.
        return $user->user_id !== $model->user_id;
    }

    /**
     * الدوال التالية تُستخدم مع SoftDeletes.
     */
    public function restore(?User $user, User $model): bool
    {
        return false;
    }

    public function forceDelete(?User $user, User $model): bool
    {
        return false;
    }
}