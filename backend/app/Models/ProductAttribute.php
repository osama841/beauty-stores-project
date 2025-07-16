<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $attribute_id
 * @property int $product_id
 * @property string $attribute_name
 * @property string $attribute_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereAttributeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereAttributeName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereAttributeValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductAttribute whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ProductAttribute extends Model
{
    use HasFactory;

    protected $primaryKey = 'attribute_id';
    protected $fillable = ['product_id', 'attribute_name', 'attribute_value'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}