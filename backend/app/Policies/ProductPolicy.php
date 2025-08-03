<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * دالة Before: تسمح للمشرفين بتجاوز جميع الصلاحيات الأخرى لـ Product.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && $user->is_admin) {
            return true;
        }
        return null;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض أي نماذج منتجات.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم (أو الضيف) يمكنه عرض نموذج منتج معين.
     */
    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه إنشاء نماذج منتجات.
     */
    public function create(?User $user): bool
    {
        // فقط المشرفون يمكنهم إنشاء المنتجات.
        return $user && $user->is_admin;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه تحديث نموذج منتج معين.
     */
    public function update(?User $user, Product $product): bool
    {
        // فقط المشرفون يمكنهم تحديث المنتجات.
        return $user && $user->is_admin;
    }

    /**
     * تحديد ما إذا كان المستخدم يمكنه حذف نموذج منتج معين.
     */
    public function delete(?User $user, Product $product): bool
    {
        // فقط المشرفون يمكنهم حذف المنتجات.
        return $user && $user->is_admin;
    }

    /**
     * الدوال التالية لا تُستخدم عادةً، ولكن يتم تعريفها.
     */
    public function restore(?User $user, Product $product): bool
    {
        return $user && $user->is_admin;
    }

    public function forceDelete(?User $user, Product $product): bool
    {
        return $user && $user->is_admin;
    }
}