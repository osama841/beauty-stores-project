<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Brand;
use Illuminate\Auth\Access\Response;

class BrandPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Brand.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->is_admin) { // ****** مصحح: استخدام is_admin ******
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض أي نماذج علامات تجارية.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض نموذج علامة تجارية معين.
     */
    public function view(?User $user, Brand $brand): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج علامات تجارية.
     */
    public function create(User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء العلامات التجارية.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج علامة تجارية معين.
     */
    public function update(User $user, Brand $brand): bool
    {
        // فقط المشرفون يمكنهم تحديث العلامات التجارية.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج علامة تجارية معين.
     */
    public function delete(User $user, Brand $brand): bool
    {
        // فقط المشرفون يمكنهم حذف العلامات التجارية.
        return false;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(User $user, Brand $brand): bool
    {
        return false;
    }

    public function forceDelete(User $user, Brand $brand): bool
    {
        return false;
    }
}