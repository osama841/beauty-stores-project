<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShoppingCart newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShoppingCart newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShoppingCart query()
 * @mixin \Eloquent
 */
class ShoppingCart extends Model
{
    use HasFactory;

    protected $primaryKey = 'cart_item_id';
    protected $fillable = ['user_id', 'product_id', 'quantity', 'added_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}