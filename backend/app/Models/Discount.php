<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $primaryKey = 'discount_id';
    protected $table = 'discounts';

    protected $fillable = [
        'code',
        'type',
        'value',
        'start_date',
        'end_date',
        'min_amount',
        'usage_limit', // ****** تصحيح: استخدام usage_limit ******
        'used_count',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'min_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // ****** إضافة هذه الدوال لمطابقة كود Controller ******
    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    public function getUsesCountAttribute()
    {
        return $this->used_count;
    }

    public function getMaxUsesAttribute()
    {
        return $this->usage_limit;
    }
}
