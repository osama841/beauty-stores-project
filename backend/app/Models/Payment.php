<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_id';
    protected $table = 'payments'; // تأكد أن هذا هو اسم الجدول في قاعدتك

    protected $fillable = [
        'user_id',
        'order_id',
        'amount',
        'payment_method',          // ****** تصحيح: تغيير 'method' إلى 'payment_method' ******
        'transaction_id',
        'payment_status',          // ****** تصحيح: تغيير 'status' إلى 'payment_status' ******
        'card_number_last_four',
        'expiry_date',
        'payment_date',
        'gateway_response',
        'currency',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime', // تأكد أن هذا يطابق نوع العمود في الهجرة
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
