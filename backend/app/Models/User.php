<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
 use Illuminate\Database\Eloquent\SoftDeletes; // ****** مطابقة مع الأصلي: هذا السطر معلق ******
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail; // ****** مهم: هذا الاستيراد كان معلقاً في الأصلي، الآن سنفعله ******

/**
 * @mixin \Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail // ****** التغيير: تطبيق الواجهة ******
{
    use HasFactory, HasApiTokens, Notifiable; // ****** مطابقة مع الأصلي: ترتيب Traits ******
    use SoftDeletes; // ****** إضافة هذا trait لأن migrations تظهر أن الجدول يستخدم SoftDeletes ******

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users'; // ****** مطابقة مع الأصلي ******

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_id'; // ****** مطابقة مع الأصلي ******

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'phone_number',
        'profile_picture_url',
        'is_admin',
        'status',
        // ****** إضافة هذا الحقل لدعم التحقق من البريد الإلكتروني ******
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token', // ****** مطابقة مع الأصلي ******
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // ****** مطابقة مع الأصلي: is_admin ******
        'email_verified_at' => 'datetime', // ****** إضافة هذا الحقل لدعم التحقق من البريد الإلكتروني ******
        'password' => 'hashed',
        'is_admin' => 'boolean', // ****** مطابقة مع الأصلي ******
    ];

    /**
     * The attributes that should be mutated to dates.
     * (Laravel 9+ يتعامل مع timestamps تلقائيًا، ولكن يمكن تحديد تواريخ إضافية هنا)
     *
     * @var array
     */
    protected $dates = [
        'deleted_at', // ****** مطابقة مع الأصلي: لـ SoftDeletes ******
    ];

    // ****** مطابقة مع الأصلي: تعريف العلاقات ******
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'user_id');
    }

    public function cartItems()
    {
        return $this->hasMany(ShoppingCart::class, 'user_id', 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id', 'user_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class, 'user_id', 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id', 'user_id');
    }
}