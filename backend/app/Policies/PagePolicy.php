<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Page;
use Illuminate\Auth\Access\Response;

class PagePolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Page.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->is_admin) { // ****** مصحح: استخدام is_admin ******
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض أي نماذج صفحات.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض نموذج صفحة معين.
     */
    public function view(?User $user, Page $page): bool
    {
        return $page->is_published;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج صفحات.
     */
    public function create(User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء الصفحات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج صفحة معين.
     */
    public function update(User $user, Page $page): bool
    {
        // فقط المشرفون يمكنهم تحديث الصفحات.
        return false;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج صفحة معين.
     */
    public function delete(User $user, Page $page): bool
    {
        // فقط المشرفون يمكنهم حذف الصفحات.
        return false;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(User $user, Page $page): bool
    {
        return false;
    }

    public function forceDelete(User $user, Page $page): bool
    {
        return false;
    }
}