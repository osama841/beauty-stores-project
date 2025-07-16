<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $address_id
 * @property int $user_id
 * @property string $address_type
 * @property string $address_line1
 * @property string|null $address_line2
 * @property string $city
 * @property string|null $state
 * @property string $postal_code
 * @property string $country
 * @property int $is_default
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $ordersAsBilling
 * @property-read int|null $orders_as_billing_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $ordersAsShipping
 * @property-read int|null $orders_as_shipping_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereAddressId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereAddressType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereUserId($value)
 * @mixin \Eloquent
 */
class Address extends Model
{
    use HasFactory;

    protected $primaryKey = 'address_id';
    protected $fillable = [
        'user_id', 'address_type', 'address_line1', 'address_line2',
        'city', 'state', 'postal_code', 'country', 'is_default'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ordersAsShipping()
    {
        return $this->hasMany(Order::class, 'shipping_address_id');
    }

    public function ordersAsBilling()
    {
        return $this->hasMany(Order::class, 'billing_address_id');
    }
}