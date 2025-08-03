<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Category.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->is_admin) { // ****** مصحح: استخدام is_admin ******
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض أي نماذج فئات.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض نموذج فئة معين.
     */
    public function view(?User $user, Category $category): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج فئات.
     */
    public function create(User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء الفئات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج فئة معين.
     */
    public function update(User $user, Category $category): bool
    {
        // فقط المشرفون يمكنهم تحديث الفئات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج فئة معين.
     */
    public function delete(User $user, Category $category): bool
    {
        // فقط المشرفون يمكنهم حذف الفئات.
        return false;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(User $user, Category $category): bool
    {
        return false;
    }

    public function forceDelete(User $user, Category $category): bool
    {
        return false;
    }
}